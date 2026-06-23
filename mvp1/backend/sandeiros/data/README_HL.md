# Dados do Motor de Humanização (HL) — PRIVADO

🔒 Os arquivos abaixo são **heurística proprietária** e estão no `.gitignore` — **nunca
são commitados**. Ficam só localmente / na VM. O `humanizador.py` os carrega daqui em
runtime; se ausentes, cada camada degrada graciosamente (não quebra).

| Arquivo (privado, não-versionado) | Camada | Schema esperado (campos por nó) |
|---|---|---|
| `hl1_intervalo_300.json` | C1 | `{modo: "PROSPECTIVO"\|"RETROSPECTIVO", tema:[...], traducao_humana, pratica}` |
| `hl2_triade_80.json` | C2 | `{eixo: "pessoal"\|"relacional"\|"coletivo", acao_5min}` |
| `hl3_equilibrio_70.json` | C3 | `{de: "<regex>", para: "<substituição>"}` (regras anti-absolutismo) |
| `hl4_reframe_22.json` | C4 | `{numero, pergunta_espelho}` (reenquadramento, nunca previsão) |

**Como colocar (manual, fora do Git):** copiar/gerar os 4 arquivos da fonte privada
(`Desktop/Literatura`, fora do repo) para esta pasta no ambiente local/VM. Não adicionar
ao Git (o `.gitignore` já bloqueia `hl*_*.json`).

`seed_cache_800.sql` (também aqui) NÃO é sensível — é Q&A de finanças/saúde/viagem,
pode ser versionado normalmente.
