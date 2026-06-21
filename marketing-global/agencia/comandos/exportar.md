# /exportar <país|todos>
**Função:** export em lote das peças montadas.
**Processo:** via Plugin ARKHE (fora dos limites REST): PNG @2x + SVG + PDF/X quando impresso → `pecas/<país>/export/`. REST API gratuita só para leituras pontuais (respeitar limites do Starter — verificar doc rate limits antes de qualquer sync automatizado).
**Saída:** manifesto `pecas/<país>/export/manifest.md` (peça, formato, variação, hash, data).
