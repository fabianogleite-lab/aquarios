"""F1 — cache semântico (hash-exato).

Decisões travadas:
- Cache GLOBAL no Supabase (tabela `cache_semantico`), NÃO por usuário, NÃO SQLite.
- F1 = SÓ hash-exato (zero risco de OOM na VM micro). Busca por embedding (pgvector
  <=> com fastembed/ONNX) é um SEGUNDO passo, ligado só após medir a folga de RAM.
  NUNCA usar sentence-transformers/torch (~400MB residente = OOM na E2.1.Micro).
- Normalização espelha a função SQL `normalizar_prompt`: lowercase, sem acento,
  sem pontuação — para que hash do Python == hash do banco.

Qualidade por fonte: CLAUDE=1.0 > CACHE=0.9 > LLAMA=0.75 > PLAYBOOK=0.6.
"""

from __future__ import annotations

import hashlib
import re
import unicodedata
from typing import Any, Optional

_QUALIDADE_POR_FONTE = {
    "CLAUDE": 1.0,
    "CACHE": 0.9,
    "LLAMA": 0.75,
    "PLAYBOOK": 0.6,
}


def normalizar_prompt(texto: str) -> str:
    """Replica `public.normalizar_prompt` do SQL (determinístico)."""
    sem_acento = "".join(
        c for c in unicodedata.normalize("NFKD", texto) if not unicodedata.combining(c)
    )
    return re.sub(r"[^a-z0-9\s]", "", sem_acento.lower())


def hash_prompt(prompt: str, idioma: str = "pt") -> str:
    """Hash canônico do cache: sha256(normalizado + '|' + idioma).
    PONTO ÚNICO DE VERDADE — o seed (extract_seed) e o runtime (get/set) usam ESTE,
    senão os hashes divergem e get() nunca dá HIT."""
    base = f"{normalizar_prompt(prompt)}|{idioma}"
    return hashlib.sha256(base.encode("utf-8")).hexdigest()


class SemanticCache:
    """N1 do SandeirOS. `client` = cliente supabase-py (ou wrapper equivalente)."""

    TABELA = "cache_semantico"

    def __init__(self, client: Any):
        self._db = client

    def _hash(self, prompt: str, idioma: str = "pt") -> str:
        return hash_prompt(prompt, idioma)

    def get(self, prompt: str, idioma: str = "pt", categoria: Optional[str] = None) -> Optional[dict]:
        """HIT → dict {output, fonte:'CACHE', custo_tokens:0}; MISS → None.

        F1: só hash-exato. (Fase 2 do F1 adiciona similaridade pgvector.)
        """
        hash_key = self._hash(prompt, idioma)
        res = (
            self._db.table(self.TABELA)
            .select("id, resposta_cacheada, fonte_original, hits")
            .eq("hash_prompt", hash_key)
            .limit(1)
            .execute()
        )
        linhas = getattr(res, "data", None) or []
        if not linhas:
            return None
        linha = linhas[0]
        # incrementa hit (best-effort, não falha a resposta se der erro)
        try:
            self._db.table(self.TABELA).update(
                {"hits": (linha.get("hits") or 0) + 1, "ultimo_hit": "now()"}
            ).eq("id", linha["id"]).execute()
        except Exception:
            pass
        return {
            "output": linha["resposta_cacheada"],
            "fonte": "CACHE",
            "custo_tokens": 0,
            "fonte_original": linha.get("fonte_original"),
        }

    def set(
        self,
        prompt: str,
        idioma: str,
        categoria: Optional[str],
        funcao: Optional[str],
        resposta: Any,
        fonte: str,
        qualidade: Optional[float] = None,
        tokens_input: int = 0,
        tokens_output: int = 0,
    ) -> None:
        """Grava/atualiza. Só sobrescreve a resposta se a nova qualidade for MAIOR
        (lógica do §12; a versão DB-side definitiva entra no F3 como função SQL)."""
        hash_key = self._hash(prompt, idioma)
        q = qualidade if qualidade is not None else _QUALIDADE_POR_FONTE.get(fonte, 0.5)

        existente = (
            self._db.table(self.TABELA)
            .select("id, qualidade_score")
            .eq("hash_prompt", hash_key)
            .limit(1)
            .execute()
        )
        linhas = getattr(existente, "data", None) or []

        if not linhas:
            self._db.table(self.TABELA).insert(
                {
                    "hash_prompt": hash_key,
                    "prompt_original": prompt,
                    "prompt_normalizado": normalizar_prompt(prompt),
                    "idioma": idioma,
                    "categoria": categoria,
                    "funcao": funcao,
                    "resposta_cacheada": resposta,
                    "tokens_input": tokens_input,
                    "tokens_output": tokens_output,
                    "fonte_original": fonte,
                    "qualidade_score": q,
                }
            ).execute()
            return

        atual = linhas[0]
        if q > float(atual.get("qualidade_score") or 0):
            self._db.table(self.TABELA).update(
                {
                    "resposta_cacheada": resposta,
                    "fonte_original": fonte,
                    "qualidade_score": q,
                    "ultimo_hit": "now()",
                }
            ).eq("id", atual["id"]).execute()
        else:
            # mantém resposta melhor; só conta o hit
            self._db.table(self.TABELA).update(
                {"hits": "hits + 1"}
            ).eq("id", atual["id"]).execute()
