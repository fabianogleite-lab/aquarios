# Meta Agente — Status de integração (12/Jun/2026)

Material recebido pronto do Meta AI (ZIP `aquarios-meta-agente.zip`) e integrado
ao repo nesta pasta, **estrutura original intacta**. Este arquivo registra o que
é real, o que é mock e o que NÃO usar — leia antes de operar.

## O que o serviço é

Camada de **economia de tokens** na frente do Claude:
`/ask` → cache semântico Qdrant (dim 384, threshold 0.92, TTL 1h) → ledger TKN
(saldo por usuário) → classificador simples/complexa → Haiku/Sonnet → fallback
"Eternal Maze" (cache em memória, threshold 0.80). Métricas Prometheus em
`/metrics`. Cleanup a cada 10 min (APScheduler).

> Nota de nomenclatura: este "Eternal Maze" é um cache de fallback — NÃO é o
> honeypot ETERNAL MAZE do CerberOS V1.0512 (handoff §8 deixou aquele fora de
> escopo). Nome reaproveitado, conceitos diferentes.

## ✅ Real e aproveitável

- `src/datalake.py` — cache Qdrant embarcado + embeddings MiniLM (funcional)
- `src/graph.py` — workflow LangGraph com roteamento por custo (funcional)
- `src/api.py`, `src/models.py`, `src/telemetry.py`, `src/main.py` — esqueleto FastAPI ok
- `Dockerfile`, `docker-compose.yml` — build local ok

## ⚠️ Mock / faltando (em ordem de prioridade)

1. **`src/agents.py` é MOCK** — `haiku_call`/`sonnet_call` retornam string fixa,
   não chamam a Anthropic. Falta: SDK `anthropic` no requirements + chamadas
   reais (`claude-haiku-4-5-20251001` / `claude-sonnet-4-6`) + `ANTHROPIC_API_KEY`
   via `.env` (nunca no repo — handoff §4).
2. **`src/ledger.py` é MOCK em memória** — saldo zera a cada restart. Destino
   real a decidir (Supabase? faixa de migration própria). Sem pressa: mock serve
   pra validar o fluxo.
3. **`/ask` sem autenticação** — qualquer um que alcançar a porta queima saldo/
   tokens. Mínimo: API key interna via header antes de expor; ideal: só
   localhost/rede interna da VM (o nginx não publica essa rota).
4. **Sem rate limiting** — cobrir no nginx da VM (mesma zona do webhook).
5. **RAM**: sentence-transformers+torch ≈ 400–700 MB. Na B1s (1 GiB, já com
   gate + HygeiOS Agent v1) é apertado: subir com swap 2G (README infra/azure)
   e avaliar lazy-load do modelo. Plano B: cache exato por hash (sem embeddings)
   até a VM provar folga.

## 🚫 NÃO usar daqui (decisões de 12/Jun prevalecem)

- `infra/terraform/` desta pasta — **referência apenas**. Tem erro de sintaxe
  HCL (atributos inline sem newline → `terraform init` quebra) e reintroduz
  PG B1MS + Container Apps, descartados ontem com justificativa (cliff de
  custo D+365 sobre dado de retenção; cold start × timeout do webhook Meta).
  **O Terraform ativo é `infra/azure/` (raiz do repo)** — VM B1s 24×7 + 2×P6.
- `azure.yaml` / `docker-compose.azure.yml` — apontam pra Container Apps; mesmo
  motivo. O deploy real é systemd na VM (padrão da VM Oracle).
- `.github/workflows/deploy.yml` — aponta pra Container Apps e RG inexistente
  (`rg-aquarios-free`). Está fora da raiz `.github/` do repo, logo **inerte**
  (GitHub não executa) — manter assim até existir CI/CD pensado pra VM.

## Onde isso roda

VM Azure da fronteira (decisão 12/Jun): nginx → gate CerberOS (business-agent)
→ este serviço (porta interna) → Claude. Deploy junto de D2/D3 (gated:
credenciais Meta + conta Azure criada).
