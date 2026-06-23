"""SandeirOS — camada interna do ProteOS (motor custo-zero).

F1 (esta entrega): núcleo do cache. Só `semantic_cache` + `bootstrap`.
F2+ (humanizador, agente, ferramentas, conversor, fallout) NÃO estão aqui.

Deploy: este backend roda na VM Oracle (FastAPI) e é versionado aqui como
fonte de verdade — o envio para a VM é passo manual separado (ver README.md).
"""

from .semantic_cache import SemanticCache

__all__ = ["SemanticCache"]
