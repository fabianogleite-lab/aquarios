# 🔵 HANDOFF — HygeiOS como Agente (Agent.Data) · próxima sessão

**Foco da próxima sessão:** evoluir o **HygeiOS** de motor de dados (v2: data lake + iVi 4D na
VM Oracle) para o **Agent.Data** completo — agente que observa, espera, matura o padrão, pede
verificação e só então fala (a "Voz Preventiva" / Silêncio Inteligente).

**SandeirOS F1/F2 caminha junto:** o cache (F1) e a humanização (F2) entram como a "boca"
custo-zero do HygeiOS-agente — convergem no deploy e na geração de fala (ver H3).

---

## 0. Estado de partida (já pronto)
- **HygeiOS v2** (09/Jun): FastAPI na VM Oracle (`api.podiumtec.com.br`), S3 data lake + DuckDB +
  Supabase, **motor iVi 4D** ativo, feature flag + parallel run. Arquitetura:
  `mobile/docs/ARCHITECTURE_HYGEIOS_V2.md`.
- **iVi (APROVADA):** Físico×0.35 + Mental×0.30 + Espiritual×0.20 + Social×0.15 — núcleo do agente.
- **SandeirOS F1/F2** (sessão 21/Jun): `cache_semantico` + seed **404 validado** + endpoint
  `POST /sandeiros/responder` + humanizador (4 camadas, codinomes). **Não deployado** (banco
  adiado). Ver `CONFERENCIA_DEPLOY_PROXIMA_SESSAO.md`.
- **Papel canônico:** HygeiOS = Agent.Data, operador do data lake, **único canal**
  ProteOS↔CerberOS; captura → organiza → guarda → espera → libera só após o carimbo do CerberOS.

## 1. Escopo proposto — HygeiOS Agente (validar no H0 antes de codar)
| Fase | Entrega | Pronto quando |
|---|---|---|
| **H0** | Alinhar o que "como agente" significa p/ o fundador + reler `ARCHITECTURE_HYGEIOS_V2.md` + fixar fronteiras (HygeiOS↔CerberOS carimbo, HygeiOS↔ProteOS canal) | escopo confirmado |
| **H1** | **Loop agêntico**: captura → decantação temporal (espera recorrência) → maturação de padrão → pedido de verificação. Silêncio Inteligente: não reage a dado isolado | um padrão só vira "pacote de insight" após recorrência confirmada |
| **H2** | **Interface Agent.Data (tools)**: HygeiOS chamável por ProteOS/SandeirOS — `ivi(user)`, `tendencia(user, dimensao)`, `historico(...)`, `detectar_padrao(...)`, com gate de verificação do CerberOS antes de liberar | ProteOS obtém dado/insight via tool, carimbado |
| **H3** | **Convergência SandeirOS (F1/F2)**: toda fala do HygeiOS-agente passa pelo cascata custo-zero — N1 cache (`/sandeiros/responder`) + humanização F2 — e o `sandeiros.api` é wired no MESMO `main.py` da VM. **Deploy conjunto** (migration+seed cache + endpoint + HygeiOS-agente) | voz preventiva sai barata (HIT no cache) e humanizada |
| **H4** | **Data Gate / LGPD**: HygeiOS guardião do data lake — muro saúde×comercial/crédito + DELETE LGPD (= F6 do SandeirOS converge aqui: apaga cache+memória+artefatos do user) | remoção total auditável + carimbo CerberOS em toda liberação |
| **H5** | **Deploy + verificação** na VM (feature flag / parallel run, como o v2 já faz) | iVi + insights + custo-zero conferidos no ar |

## 2. Convergência F1/F2 ↔ HygeiOS (o "caminhar junto")
- **Mesma VM, mesmo FastAPI**: `/sandeiros/responder` e o HygeiOS-agente vivem no mesmo
  `main.py` (Oracle). O wire do `sandeiros.api` (2 linhas) entra junto no H3.
- **Cache = boca barata**: a frase da "voz preventiva" sai via N1 cache (0 token); miss →
  cascata (F3 depois).
- **Humanização = tom**: as 4 camadas (F2) dão tom à fala (degrada sem os `hl*.json` privados).
- **LGPD**: o DELETE do SandeirOS (F6) e o Data Gate do HygeiOS são a mesma fronteira → unificar no H4.

## 3. Sigilo
Codinomes neutros sempre. Humanização do SandeirOS = Intervalo / Tríade / Equilíbrio /
Reenquadramento. CerberOS = "portal de verificação". Nada de nomes de fontes em arquivo do repo.

## 4. Pendências que entram junto
- Deploy do banco do SandeirOS (precisa de credencial) — roda no mesmo passo do deploy do HygeiOS.
- `hl*.json` privados na VM (F2 enriquece; degrada sem eles).
- Planos PanaceIA (Free/Pro/GPU) antes do F3 da cascata.

---

## 5. 🟢 Mensagem de abertura da próxima etapa (colar pra começar)
> "Vamos atualizar o **HygeiOS como Agente (Agent.Data)**. Leia `HANDOFF_HYGEIOS_AGENTE.md` e
> `mobile/docs/ARCHITECTURE_HYGEIOS_V2.md`. Comece pelo **H0** (alinhar o escopo comigo) e siga
> H1→H5. O **SandeirOS F1/F2 caminha junto**: cache + humanização são a boca custo-zero do
> HygeiOS, e o deploy do `/sandeiros/responder` entra no mesmo `main.py` da VM (H3). Respeite o
> sigilo (codinomes; CerberOS = 'portal de verificação'). Confirme cada fase antes da seguinte."
