# MVP1 — Fonte de Verdade Operacional

> **Este doc é o ponto de entrada operacional do AquariOS.** Substitui a proliferação de
> `HANDOFF_*` / `ESCOPO_*` / `STATUS_*` / `SESSION_*` (arquivados em `mvp0/`).
> **Conceito/arquitetura completa** continua em `AQUARIOS_LIVRO.md` (documento único definitivo).
> Aqui mora só o **operacional**: nomenclatura canônica, o que está no ar, como rodar, como pedir ajuda.
>
> Última montagem: **Sessão 3 do MVP1 — 22/Jun/2026**.

---

## 1. O que é o AquariOS (1 parágrafo)

Plataforma AI-First de bem-estar — **motor único / 2 peles** (AquariOS global B2C + B2B white-label),
custo-quase-zero, **config-first** (toda decisão com >2 opções vira toggle no console do admin,
configurável por tempo/usuário/região). Empresa: **C&L** (CARVALHO & LEITE GESTORA DE RECURSOS LTDA,
CNPJ 41.191.506/0001-02).

---

## 2. Nomenclatura canônica (grafia oficial — usar SEMPRE assim)

### 2.1 Agentes (5)
| Agente | Papel | Observação |
|---|---|---|
| **ProteOS** | Agent.Interface | Superfície de conversa/UX; pele do usuário |
| **HygeiOS** | Agent.Data | Motor de dados + iVi 4D |
| **CerberOS** | Agent.Core | Defesa/governança (ver `project_cerberos`; hardening em sessão própria) |
| **PanaceIA** | Agent.Corp | Camada corporativa (MVP2) |
| **SandeirOS** | camada interna do ProteOS | Motor custo-zero (cache + humanizador) |

### 2.2 Módulos UX (9)
ProteOS · SandeirOS · EcumenicOS · AsclepiOS · HermeOS · EteriOS · Comunidades · Diário do Ser · Nutrição

### 2.3 Outros nomes próprios (grafia canônica)
**AlexandriOS** (ajuda/KB) · **GaiOS** (sistema/governança, divisão do CerberOS) · **AeropagOS** ·
**EscambOS** (marketplace) · **heYskY** (energia solar) · **OdontolarPlus** (vertical clínico) ·
**AquariOS** (produto/plataforma) · **iVi** (índice — V maiúsculo).

### 2.4 iVi — fórmula canônica (4 dimensões)
```
iVi = Físico×0.35 + Mental×0.30 + Espiritual×0.20 + Social×0.15
```
No banco: `calculate_ivi(p_fisico, p_mental, p_espiritual, p_social)` (4D ativo).
Legado 3D preservado só para auditoria em `calculate_ivi_legacy_3d`.

### 2.5 4 Dimensões (cores oficiais)
Físico `#E07B54` · Mental `#5B8DEF` · Espiritual `#7C5CBF` · Social `#52C98A`

### 2.6 6 Bardos
Calmo · Ansiedade Leve · Stress Alto · Exaustão · Impulso Aditivo · Dissociação

---

## 3. O que está NO AR (estado verificado nas Sessões 1–2, 22/Jun)

### 3.1 Backend (API)
- **Azure Container App** `aquarios-hygeios-api` — grupo `rg-aquarios-hygeios`, imagem
  `aquariosacr.azurecr.io/aquarios:latest`. `SUPABASE_SERVICE_ROLE_KEY` é **secret do Container App**
  (nunca em arquivo).
- ⚠️ **Antes de qualquer publicação pública deste doc, revisar esta seção** (nomes de recursos de infra) —
  ver `feedback_sites_pro_template`. Endpoint/FQDN e topologia ficam fora de páginas públicas.

### 3.2 Dados
- **Supabase** projeto `agebsmjsjrmazbozphnh`. Migrations aplicadas até **`20260622000007`**
  (AlexandriOS reconcile + seed 3 públicos + policies admin-gated).

### 3.3 Ajuda viva — AlexandriOS
- Endpoint `/alexandrios/search`. KB por público: **usuário 45 · admin 10 · integrador 8**.
- Central pública: `docs/ajuda.html`. App: componente `HelpButton` ("?" em telas mobile).

### 3.4 Consoles (config-first)
- Backoffice admin: `docs/backoffice.html` (Configurações + Servidores trilha-a-trilha + ajuda "?").
- Demo wearable / white-label: `tests/wearable_whitelabel_demo.py` (verde).

### 3.5 Sites (GitHub Pages — servem de `main/docs`)
- `podiumtec.com.br` → AquariOS landing
- `odontolarplus.com.br` → OdontolarPlus + AquariOS
- `podiumtec.com.br/escambos/` · `/heysky/` · `/investidores.html` (gated, senha)

### 3.6 App mobile
- Expo (pasta `mobile/`, ~5.9 GB — **vive na raiz**, não entra em `mvp1/`). APK dev por download.

---

## 4. Como rodar / operar

| Ação | Onde |
|---|---|
| Build + deploy do backend | `DEPLOY_AZURE_CONTAINER_APP.sh`, `WATCH_BUILD_AND_DEPLOY.sh` (raiz) |
| Deploy itens F1/H3 | `DEPLOY_F1_ITEM1.sh`, `DEPLOY_H3_ITEM3.sh` |
| Checklist de deploy | `DEPLOY_FINAL_CHECKLIST.md` |
| Migrations Supabase | `supabase/` (faixas reservadas em `supabase/migrations/README` quando houver) |
| Imagem/container | `Dockerfile`, `.dockerignore`, `main.py`, `requirements.txt` (raiz — o build referencia a raiz) |
| Infra como código | `infra/azure/` (Terraform), `infra/oracle/` |

> **Vivos na raiz (NÃO mover):** `docs/` (Pages serve daqui) e `mobile/` (build Expo) e o build infra
> (`Dockerfile`/`main.py` referenciam a raiz). Mover quebra Pages/app/build.

---

## 5. Como pedir ajuda (3 públicos)
1. **Usuário** → "?" no app (`HelpButton`) e `docs/ajuda.html`.
2. **Admin** → ajuda "?" embutida no backoffice (`docs/backoffice.html`).
3. **Integrador** → KB `integrador` via `/alexandrios/search`.

---

## 6. Estrutura de versões (mvp0 / mvp1)

```
raiz/                  ← vivo (build/Pages/app). docs/ e mobile/ ficam aqui SEMPRE.
├── mvp0/              ← BASELINE congelado do marco MVP1 (histórico + cópia-baseline do operacional)
├── mvp1/              ← VERSÃO ATIVA (cópia operacional + escopo vivo) → backup no Azure Blob
└── (operacional vivo na raiz: backend/, supabase/, main.py, Dockerfile, infra/, ...)
```
- **Dual-write só na montagem:** na montagem do `mvp1/`, cada relevante foi gravado em `mvp0/` (baseline)
  **e** `mvp1/` (ativo) de uma vez. Depois **`mvp0/` congela**.
- **Compactar (futuro):** `mvp0/` só quando não for mais consultado; `mvp1/` só quando nascer o `mvp2`.
- **Backup:** cópia de `mvp1/` no **Azure Blob** (container `mvp1-backup`, assinatura CEL) — versionado.

---

## 7. Sigilo & publicação (regras permanentes)
- 🔒 **Humanizador do SandeirOS** = heurística proprietária. Repo é PÚBLICO → **só codinomes neutros**
  (`humanizador.py`, `hl1-4_*.json`). Nunca nomear fontes/autores em arquivo do repo. Dados
  `backend/sandeiros/data/hl[1-4]_*.json` são **local-only** (gitignored) — backup só em destino privado.
- 🌐 **Páginas públicas** nunca expõem IPs/topologia/código HVP/DRE real/SAFE-IPO/schema do DB
  (`feedback_sites_pro_template`).
- 🛠️ **Config-first**: >2 opções → toggle no console do admin (`feedback_config_first_console`).

---

## 8. Próximo (fora desta sessão)
- **Sessão própria: CerberOS + Hardening.** `cerber_shield.py` existe em `business-agent/` mas **não está
  ligado** no backend live (sem rate-limit/CORS/auth nos writes). Exige rebuild+redeploy →
  **com o fundador presente**. Escopo e estado real na memória `project_cerberos`.
