# 🟡 PLANO — AlexandriOS (Item 5 do MVP1, ajuda conversacional)

**Status:** plano escrito, **sem código ainda** (decisão da sessão 22/Jun). Implementar só depois
do Item 4 (SLOs) — ordem travada em `HANDOFF_MVP1.md`: "é o último módulo porque a ajuda documenta
tudo que já existe no MVP1".

---

## 0. O que já existe (não rebuildar)
- [mobile/services/alexandrios.ts](mobile/services/alexandrios.ts) — engine de busca local (`searchKB`,
  `getKBByPersona`, `getKBByCategory`), lê de `mobile/config/faqs.json`. Já tem aliases
  backward-compatible (`searchFAQ`, `getFAQsByPersona`, etc.) — não remover ainda.
- [mobile/config/faqs.json](mobile/config/faqs.json) — **35 FAQs**, 3 personas
  (`ZÉ_DO_APERTO`, `DONA_MARIA`, `CARLOS`), 8 categorias (`SUS`, `PREVENTIVA`, `FAMÍLIA`, `CRÔNICA`,
  `EXPERTISE`, `NEGAÇÃO`, `ACESSO`, `SUPORTE`).
- Campos por FAQ: `id`, `persona`, `category`, `question`, `answer`, `relatedFAQs[]`, `tone`
  (alguns também têm `qualisLevel`, `sourceAuthor`, `isCanonical` — opcionais, ver interface
  `AlexandriosResult`).

## 1. O que falta (3 peças)

### 1.1 Tabela `alexandrios_kb` no Supabase
Migration nova (próxima na sequência: `20260622000005_alexandrios_kb.sql`, seguindo o padrão de
`20260622000004_skin_b.sql`). Espelha os campos do FAQ JSON:
- `id TEXT PRIMARY KEY` (mantém os ids existentes, ex: `faq_zé_001`)
- `persona TEXT NOT NULL`
- `category TEXT NOT NULL`
- `question TEXT NOT NULL`
- `answer TEXT NOT NULL`
- `related_faqs TEXT[]`
- `tone TEXT`
- `qualis_level TEXT` (nullable)
- `source_author TEXT` (nullable — **sigilo:** nunca nome de livro/autor real, só codinome se algum dia precisar)
- `is_canonical BOOLEAN DEFAULT true`
- `ts TIMESTAMPTZ DEFAULT NOW()`

RLS: leitura **pública** (é conteúdo de ajuda, não dado de usuário) — `FOR SELECT USING (true)`.
Escrita: só service_role (sem policy de INSERT/UPDATE pra `anon`/`authenticated`).

### 1.2 Script de migração dos dados (JSON → Supabase)
Script Python pequeno (`backend/alexandrios/migrate_faqs.py` ou similar) que lê
`mobile/config/faqs.json` e faz upsert na tabela via `supabase-py` (já é dependência —
`requirements.txt:5`). Roda uma vez, manual. **Não apagar o JSON local** — fica como fallback
offline (o app pode continuar lendo local se a API estiver fora, modo degradado).

### 1.3 Endpoint `GET /alexandrios/search`
Novo router `backend/alexandrios/api.py`, seguindo o padrão de
[backend/hygeios/api.py](backend/hygeios/api.py) (APIRouter com prefix, funções simples,
parâmetro `db` injetado). Wire no `main.py` igual aos outros 5 routers.

```
GET /alexandrios/search?q=...&persona=...&category=...
GET /alexandrios/persona/{persona}
GET /alexandrios/category/{category}
```

Mobile (`alexandrios.ts`) passa a chamar a API primeiro, cai pro JSON local se a chamada falhar
(mesmo padrão de feature-flag + fallback já usado no app pra outros módulos).

## 2. Página de ajuda pública (depois da API)
Usa o template de `docs/engenharia.html` (§4 do `HANDOFF_MVP1.md`) — dark, "stack real sem
caixa-preta". Sigilo sempre: codinomes neutros, nada de nomes de fontes/livros/autores reais em
arquivo do repo (ver `feedback_humanizer_sigilo`).

## 3. Dependências / ordem
- Depende do **Item 4 (SLOs)** estar feito antes (ordem travada, não reabrir).
- Depende do **deploy Azure estar de fato no ar** pra testar o endpoint novo em produção
  (ver `DEPLOY_FINAL_CHECKLIST.md` / sessão 22/Jun — build estava quebrado, corrigido com
  `.dockerignore`).
- Não depende de nenhum dado de usuário — pode ser feito em paralelo com Item 4 se quiser
  paralelizar, mas a decisão travada foi sequencial.

## 4. Pronto quando
Help conversacional responde sobre os módulos do MVP1 (cache SandeirOS, H1, Skin B) puxando da
tabela `alexandrios_kb` via API, com fallback local se a API cair.

---
**Próxima sessão:** se Item 4 (SLOs) já estiver feito, começar aqui pela migration 1.1.
