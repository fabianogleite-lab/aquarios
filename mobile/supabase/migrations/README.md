# Convenção de numeração de migrations

**Decidida 12/Jun/2026** — sessões paralelas (Fronteira, MKT, HygeiOS Agent)
passaram a criar migrations ao mesmo tempo; faixas eliminam colisão sem
exigir coordenação contínua entre chats.

## Faixas por trilha

| Faixa | Trilha (dona) | Estado |
|---|---|---|
| 01–30 | Histórico pré-convenção (core, RLS, Pacote D) | aplicadas |
| **31–39** | **Fronteira F1→F2** (CerberOS gate / GaiOS / EteriOS) | 31 redigida (não aplicada) |
| **40–49** | **MKT / CRM** (agencia/, campanhas, optins) | livre |
| **50–59** | **HygeiOS Agent v1** | livre |
| 60+ | Reservar nova faixa AQUI antes de usar | — |

## Regras

1. **Antes de criar migration, confira a faixa da sua trilha nesta tabela.**
   Faixa nova (60+) = atualizar a tabela no mesmo commit da migration.
2. Nome: `NN_nome_em_snake.sql` (duas casas, zero à esquerda).
3. Toda `CREATE TABLE` nova: `ENABLE ROW LEVEL SECURITY` **na mesma migration**
   — `python tools/security_audit.py` (check A6) acusa FAIL sem isso.
4. Idempotência obrigatória: `IF NOT EXISTS` / `DROP ... IF EXISTS`
   (padrão das migrations 28–31).
5. Migration aplicada em produção ganha nota `✅ Aplicada em produção DD/Mmm`
   no rodapé (padrão da 30).
