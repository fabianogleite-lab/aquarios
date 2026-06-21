# 🏢 AGÊNCIA ARKHE — Agência Automatizada AquariOS (aprovada 10/Jun/2026)

Pipeline de criativos para 14 países a custo zero de ferramenta (Fase Validação).
**Stack:** Claude (estratégia/copy/SVG/orquestração) + Figma Starter (montagem via Plugin ARKHE) + stock gratuito.
**Regras vinculantes:** #8 #9 #10 #11 do collaboration_rules + Governança de Claims (Playbook, Parte 0).

## Uso
Em qualquer sessão (Cowork ou Claude Code): abra o arquivo do comando em `comandos/`,
cole o conteúdo + o argumento (ex.: país), e o pipeline executa aquela etapa.
Fontes de verdade: `AquariOS-Global-Launch-Playbook-fonte.md` (Big Ideas, canais, releases),
`COUNTRY_MATRIX.md`, `HEROS_JOURNEY_CAMPAIGN_SPEC.md`, `mobile/lib/proteos-cultural-voice.ts`.

## Árvore
| Etapa | Comando | Saída |
|---|---|---|
| 🧠 | `/brief <país>` | briefing 1 página do país |
| 🧠 | `/copy <país> <formato>` | headlines + body + CTA (local + PT) |
| 🧠 | `/arte <país> <formato>` | direção de arte + SVG pronto p/ Figma |
| 🏭 | `/template <formato>` | spec do template-mestre com variáveis |
| 🏭 | `/montar <país>` | instruções/execução Plugin ARKHE |
| 🏭 | `/exportar <país|todos>` | lote em `pecas/<país>/` |
| 🛡️ | `/cerberos <peça>` | parecer: aprova/reescreve |
| 🛡️ | `/juridico <país>` | gate de claims × regulador |
| 📡 | `/publicar <país> <rede>` | peça + legenda + hashtags + horário |
| 📡 | `/imprensa <país> <A|B|C>` | release + kit → mailing |
| 📊 | `/kpi <país>` | metas × realizado |
| 📊 | `/radar` | próximas 3 jogadas (Regra #11) |

## Fases de custo (decisão oficial)
Validação (até jul): R$ 0 · Launch (ago): Figma Pro opcional ~R$ 90 + hero images ~US$ 30 opcionais · Escala (nov+): PanaceIA, R$ 400–700 se dados justificarem.

## Pendência técnica
**Plugin ARKHE** — a desenvolver (1 sessão, TypeScript/Figma Plugin API): troca de variáveis {headline}{body}{cta} por país, fontes por script (RTL incluso), duplicação de frames, export em lote. Hipótese a testar: limites de export em volume muito alto no Starter.
