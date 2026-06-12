# AquariOS — Arquitetura HygeiOS v2 (Python/FastAPI)

**Data:** 2026-06-07 | **Status:** Direção aprovada (síntese A+B+C) + mecanismo de deploy decidido ("terceira via") — implementação é a Trilha 6

---

## 1. A pergunta que destravou isso

HygeiOS v2 (Python/FastAPI, evolução de `AQUARIOS_v4.2_INTEGRADO.py` — 2753 linhas / 81 módulos / 17 handlers, congelado desde 18/05 em `C:\Users\DWOS\Desktop\AquariOS\`) **substitui ou complementa** o HygeiOS atual (TypeScript/Supabase/PostgreSQL, com `calculate_ivi` em SQL)?

Resposta do fundador (06/06): nenhum dos dois isoladamente — uma síntese das três opções propostas (A=substitui, B=complementa, C=`.py` é spec/referência).

## 2. Síntese A+B+C — o que cada parte faz

| | Onde se aplica | Por quê |
|---|---|---|
| **A — substitui** | Motor de cálculo/analytics: iVi, 44 eixos, pipelines ETL | O `.py` foi desenhado pra isso — `handler_hygeios` já está descrito ali como "Núcleo analítico — IVI pipeline ETL 6h — CRITICAL_MARKER". Supabase/SQL não compete nesse terreno. |
| **B — complementa** | Operacional: auth, RLS, persistência, dados de usuário | Supabase já é mais forte aqui. O `.py` hoje tem ZERO auth, ZERO RLS — `usuario_demo` está fixo (hardcoded) em 8 linhas (1925, 1926, 1967, 2274, 2342, 2479, 2496, 2517, 2689 — conferido linha a linha). |
| **C — vira spec/cola** | Desenho da costura entre A e B | O registro de módulos via `@dataclass class Modulo` + `MODULOS_AQUARIOS: List[Modulo]` + handlers plugáveis (`handler: Optional[Callable]`) é um padrão limpo o bastante pra servir de referência de como organizar o novo serviço — não pra copiar o código, mas pra copiar a *forma*. |

## 3. A costura concreta (C em ação)

O `.py` já contém um esqueleto FastAPI condicional (linha 1954: `from fastapi import FastAPI...`, linha 1978: `app = FastAPI(...)`, com fallback gracioso `FASTAPI_OK = False` se as libs não estiverem instaladas). Isso aponta o desenho natural da costura:

```
┌──────────────────┐      ┌───────────────────────────┐
│  React Native    │ ───▶ │  Supabase                 │
│  (app mobile)    │      │  • auth + RLS  (= B)      │
│                  │ ◀─── │  • telemetry_vitality_logs│
└──────────────────┘      │  • calculate_ivi (legado) │
                          └─────────────┬─────────────┘
                                        │ REST (a construir)
                                        ▼
                          ┌───────────────────────────┐
                          │  HygeiOS v2 — FastAPI     │
                          │  • motor iVi 4D  (= A)    │
                          │  • pipeline 44 eixos      │
                          │  • analytics/ETL          │
                          │  Oracle VM E2.1.Micro     │
                          └───────────────────────────┘
```

Já está em MEMORY.md o vínculo certo: *"App React Native chama FastAPI via REST API (não 'converte Python em JS')"* — essa síntese A+B+C é o que dá conteúdo concreto a essa frase: o app e o Supabase continuam sendo o "B" (identidade, permissão, guarda dos dados); o FastAPI vira o "A" (quem faz a conta).

**Nó solto que essa síntese expõe (achado novo, vale registrar):** a função SQL `calculate_ivi` (migration 12, fórmula 3D antiga — ver dívida crítica #2 do MEMORY.md) já está **dormente** — o app calcula o iVi 4D no client (`calcIVI` em `hygeios.tsx`/`index.tsx`), não via RPC. A Trilha 4 mapeou o conserto 3D→4D dela como rede de segurança, mas, à luz do "A" aqui, o destino final dessa função é provavelmente **aposentadoria** — quando o motor em Python assumir o cálculo "de verdade", tanto essa SQL quanto o `calcIVI` client-side viram redundância a consolidar. Não muda o que a Trilha 4 preparou (o conserto continua válido como stopgap), só explica por que ele não é urgente.

## 4. Decisão de deploy — "a terceira via" (git + lockfile)

A pergunta de fundo do fundador: *"quanto maior o programa fica, mais difícil atualizar"* — isso é verdade **apenas se** cada atualização reenvia o programa inteiro. As duas vias óbvias, comparadas:

| | Via 1 — Construir fora + subir pronto | Via 2 — Instalar tudo no servidor |
|---|---|---|
| O que viaja a cada update | O artefato inteiro (imagem, pacote compilado) | Só o código-fonte que mudou |
| Quem "trabalha" no update | Sua máquina / CI | O próprio servidor |
| Risco | Transferência pesada toda vez | Servidor ocupado/lento compilando — numa Oracle VM `E2.1.Micro` (**1 OCPU / 1GB**), pode travar o serviço que já está rodando |

**Via 3 — a escolhida — é o padrão da indústria pra exatamente esse cenário:** deploy via **git + dependências travadas** (`requirements.txt`/lockfile).

1. Você manda só o `git diff` (KB, não MB)
2. O servidor roda `pip install -r requirements.txt` — baixa/recompila *só* as libs que mudaram (raramente nenhuma — dependências travadas raramente mudam)
3. Reinicia o serviço (`uvicorn`/`systemd`)

Resultado: o tamanho da transferência passa a ser o **tamanho da mudança**, nunca o tamanho do programa. É exatamente esse desacoplamento — "tamanho do programa" ≠ "custo de atualizar" — que git, Docker layers e OTA existem para resolver. O HygeiOS v2 é a única peça nova de infra que ainda exigia essa escolha consciente; as outras (Supabase, sites, mobile) já seguem — ou têm disponível — esse mesmo padrão.

## 5. Elo com a Trilha 2 — o gap paralelo no mobile

A Trilha 2 conferiu o estado do OTA (`expo-updates`/EAS Update) no app — que é exatamente o equivalente mobile desse mesmo princípio ("atualizar só o delta, sem reenviar o programa inteiro"). Achado: **ainda não está configurado** —

- `app.json` → bloco `updates` só tem `fallbackToCacheTimeout` + `runtimeVersion.policy`, sem `url`
- `package.json` → `expo-updates` não está entre as dependências
- `eas.json` → nenhum profile declara `channel`

Ou seja: a "terceira via" resolve a pergunta do fundador para o **HygeiOS v2** (servidor). A pergunta análoga para o **app mobile** (OTA) segue em aberto — mesma motivação, peça diferente, ainda não configurada. Não é bloqueio de nada agora (parquedo como item de backlog na recomendação da sessão), mas não deve ser confundido com — nem dado como resolvido por — esta decisão.

## 6. O que a Trilha 6 vai montar (esboço — não executar agora)

Quando a Trilha 6 ("realização da terceira via") rodar, o roteiro natural no Oracle VM (`aquarios-server-1`, `opc@137.131.158.242`) é:

1. `git clone`/`git pull` do código do HygeiOS v2 no servidor
2. Ambiente Python isolado (`venv` — leve o bastante pra `E2.1.Micro`)
3. Gerar o lockfile (`requirements.txt` com versões travadas — definir se é `pip freeze`, `pip-tools` ou `poetry.lock`)
4. `pip install -r requirements.txt`
5. Processo de serviço (`uvicorn` atrás de `systemd` — manter rodando + reiniciar em boot/falha)
6. Script de deploy (`git pull && pip install -r requirements.txt && systemctl restart hygeios-v2`)
7. Testar o ciclo completo de update ponta a ponta com uma mudança trivial antes de confiar nele em produção

---

*Gerado a partir da decisão tomada na Sessão 24 (06/06/2026) — ver `session24_handoff.md` para o contexto completo da síntese A+B+C e da "terceira via".*
