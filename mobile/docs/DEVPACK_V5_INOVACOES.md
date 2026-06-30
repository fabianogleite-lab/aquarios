# DEVPACK v5 — Inovações do código sobre o DEVPACK v4

Sessão 10 da fila DEVPACK v4→v5 (`HANDOFF_DEVPACK_V4_FILA_29JUN.md`). Estes 7 itens são
classificados como `innovation` em [divergencias.ts](../data/divergencias.ts) — o código
implementou algo melhor ou mais sólido do que o DEVPACK v4 previa. Decisão (29/Jun e
sessões anteriores): **documentar como estão, não reescrever pra caber no v4.**

---

## D-07 — EteriOS (wearables/IoT)

**DEVPACK v4:** não menciona.
**Código real:** módulo independente (`aquarios_modules` slug `eterios`), status `coming_soon`,
depende de HygeiOS, tabela `telemetry_vitality_logs`.
**Decisão:** manter independente (não mesclar em AsclepiOS) — biometria de wearable é uma
fonte de dados, não um eixo de saúde em si.

## D-08 — AeropagOS (gamificação)

**DEVPACK v4:** descreve gamificação dentro de Comunidades (M-11), sem nome próprio.
**Código real:** módulo nomeado e construído (`aquarios_modules` slug `aeropagos`, status `built`).
XP, badges, leaderboard e mentor — não é só "gamificação genérica", é um sistema com nome e
identidade. Referência ao Areópago grego (conselho deliberativo de Atenas) — o nome carrega
a ideia de avaliação por pares, coerente com o leaderboard social.
**Decisão:** documentar no v5 com esse nome.

## D-19 — Pilar 2 (Psicologia Social), Constituição AquariOS

**DEVPACK v4:** cita só 7 Leis Herméticas + Quarto Caminho + Bardo Thodol — não tem um "Pilar 2".
**Código real:** `aquarios_constitution` tem 10 itens de Psicologia Social: Vigotski, Foucault,
Freire, Almeida, Butler, Han, Bauman, Basaglia, Pichon-Rivière, Ciampa. É um corpo teórico
sociológico/psicológico que o DEVPACK v4 simplesmente não cobre.
**Decisão:** virar Pilar 2 oficial na próxima versão do DEVPACK.

## D-20 — 7 Leis Herméticas ocultas

**DEVPACK v4:** sugere uso explícito das 7 Leis como "base do ecossistema".
**Código real:** ficam com `is_public = false` em `aquarios_constitution`, nunca expostas
diretamente ao usuário (RLS travada pra `service_role` só — ver migration `20260621030000`).
**Por que isso é melhor:** hermetismo de verdade é esotérico — "oculto" é o próprio princípio,
não uma falha de implementação. Manter oculto é mais fiel à tradição do que expor.
**Decisão:** manter ocultas.

## D-23 — SandeirOS: 22 arcanos + 3 livros basais + 7 leis herméticas

**DEVPACK v4:** não detalha a camada simbólica do SandeirOS.
**Código real:** `lib/proteos-cultural-voice.ts` define os 22 Arcanos Maiores do Tarô como
metalinguagem simbólica universal (`ARCANAS`), usados pra dar voz cultural ao ProteOS por
país/locale (14 vozes culturais hoje: pt-BR, en-US, fa-IR, he-IL, es-VE, pt-PT, th-TH, ko-KR,
zh-HK, nb-NO, en-NG, de-CH, es-PE). Cada locale tem arcanos dominantes + referências
filosóficas/religiosas reais (ex: Rumi/Hafez pro Irã, Jung pra Suíça, Pachamama pro Peru) +
um "oráculo oculto" (frase-âncora) + lista do que evitar culturalmente.
**Por que isso é melhor:** é um sistema de localização cultural profunda, não um gimmick —
cada voz tem fontes bibliográficas reais por trás.
**Decisão:** documentar como está; é o motor real do Cultural Voice Layer do ProteOS.

## D-24 — oracle_modern / oracle_label (EcumenicOS)

**DEVPACK v4:** não menciona.
**Código real:** tabela `ecumenic_traditions` (catálogo de 13 tradições: slug, name, icon,
`oracle_modern`, `oracle_label`, active) guarda o "oráculo oculto" de cada tradição — a
mesma ideia das frases-âncora do D-23, mas pela lente do EcumenicOS em vez do SandeirOS.
**Achado de segurança (corrigido na Sessão 1, 29/Jun):** a tabela não tem coluna `is_public`
(é um catálogo fixo, não linhas públicas+privadas misturadas) e estava com RLS `USING(true)`,
expondo `oracle_modern`/`oracle_label` a qualquer anônimo. Corrigido pra `authenticated`/
`service_role` só (migration `20260629000005`), mesmo padrão de `ecumenic_references`.
**Decisão:** documentar a existência do sistema; a correção de RLS já está em produção.

## D-25 — Funções SECURITY DEFINER

**DEVPACK v4:** não detalha funções SQL.
**Código real:** arquitetura SQL madura com 4 funções `SECURITY DEFINER` confirmadas no
código (`mobile/supabase/migrations/07_s16_audit_logs.sql`, `09_s17_community_personas.sql`,
`10_s17_aquarios_constitution.sql`, `11_s18_panaceia_payments.sql`, `2[4-7]_fix_upsert_bot_*.sql`):
- `log_audit_event` — grava em `audit_logs` mesmo se o caller não tiver permissão direta na tabela.
- `hygeios_log_content_audit` — auditoria de conteúdo do HygeiOS.
- `panaceia_deliver_tokens` — entrega de tokens de compra sem expor a tabela de saldo a escrita direta do client.
- `upsert_bot_persona` — upsert controlado de personas-bot (community), revisado 3x (`25`→`26`→`27`) até a versão correta de schema.
**Por que isso é melhor:** é o padrão correto pra operações privilegiadas em Postgres/Supabase
— client nunca tem permissão de escrita direta nessas tabelas, só via função auditada.
**Decisão:** manter como está.

---

**Status desta sessão (29/Jun):** os 7 itens documentados acima a partir do código real,
incluindo o achado de segurança do D-24 (já corrigido e aplicado em produção na Sessão 1).
Nenhuma mudança de código foi necessária pra esta sessão — só documentação.
