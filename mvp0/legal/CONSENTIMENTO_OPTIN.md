# Consentimento e Opt-in — AquariOS

> **STATUS:** RASCUNHO v0.1 (Pacote D · D0 · item #5) — PT-BR canônico.
> **Fonte de verdade:** decisões do projeto prevalecem sobre sugestões de terceiros. Submissão à Meta em lote, via extensão do Chrome.
> **Vigência:** [A DEFINIR] · **Última atualização:** 10/06/2026
> **Irmãos:** [Privacidade](POLITICA_DE_PRIVACIDADE.md) · [Termos](TERMOS_DE_USO.md) · [Exclusão](POLITICA_DE_EXCLUSAO_DE_DADOS.md) · [AI Disclosure](AI_DISCLOSURE.md).

---

## 1. Princípios

Todo consentimento no AquariOS é **livre, informado, inequívoco e específico**. Consequências práticas:

- **caixas nunca pré-marcadas** (opt-in ativo, exigência da Meta e do GDPR/LGPD);
- **consentimentos separados** por finalidade — aceitar um não obriga aceitar outro;
- **revogável** a qualquer momento, sem penalidade (ver §6).

## 2. Os três consentimentos (separados)

| # | Finalidade | Base legal | Obrigatório? |
|---|---|---|---|
| A | Usar o serviço / criar conta | Execução de contrato | Sim (para ter conta) |
| B | Tratar dados de bem-estar (humor, diário, iVi) | Consentimento (dado sensível) | Necessário para os módulos de bem-estar |
| C | Receber marketing no WhatsApp/Meta | Consentimento explícito | **Não** — opcional |

Recusar **C** não impede usar o serviço. Recusar **B** limita apenas os recursos de bem-estar.

## 3. Textos canônicos (PT)

**B — dados de bem-estar:**
> ☐ "Autorizo o AquariOS a tratar meus dados de bem-estar (humor, diário e dimensões do iVi) para me oferecer acompanhamento personalizado, com a proteção descrita na Política de Privacidade."

**C — marketing WhatsApp/Meta:**
> ☐ "Concordo em receber mensagens de marketing do AquariOS no WhatsApp."

**Disclosure de IA (no ponto de entrada do canal — ver [AI_DISCLOSURE](AI_DISCLOSURE.md)):**
> "Você falará com o ProteOS, uma IA de bem-estar (não médico)."

## 4. Traduções (Onda 1)

| Consent. | EN | ES |
|---|---|---|
| C | "I agree to receive marketing messages from AquariOS on WhatsApp." | "Acepto recibir mensajes de marketing de AquariOS en WhatsApp." |

Demais idiomas na trilha de localização (S34). Cada idioma tem sua **versão de texto** registrada (§5).

## 5. Prova de consentimento (amarra na tabela `optins` do D1)

No ato do opt-in, registramos como prova auditável:

| Campo (D1 `optins`) | Exemplo |
|---|---|
| `phone_e164` | +5511999999999 |
| `consent_text` | texto **exato** exibido (o desta política) |
| `consent_version` | `v1.0_20260610` |
| `timestamp_utc` | 2026-06-10T14:30:00Z |
| `ip_address` | 189.12.34.56 |
| `source` | `landing_podiumtec`, `app_onboarding`, `instagram_ad`… |
| `language` | `pt-BR` |
| `checkbox_checked` | true (ação ativa do usuário) |

Esses campos comprovam, perante autoridades e a Meta, que o consentimento foi válido.

## 6. Revogação e opt-out

- **Marketing (C):** toda mensagem traz opção de **descadastro** ("responda SAIR"); o pedido é honrado imediatamente.
- **Dados de bem-estar (B):** revogável nas configurações; ver também a [Política de Exclusão](POLITICA_DE_EXCLUSAO_DE_DADOS.md).
- A revogação **não afeta** a licitude do tratamento feito antes dela.

## 7. Double opt-in (recomendado para WhatsApp)

Para marketing no WhatsApp, recomenda-se confirmar o aceite por uma **segunda ação** (ex.: o usuário responde "CONFIRMO" na primeira mensagem). Isso reforça a prova e a qualidade do número (campo `double_optin_confirmed` no D1).

## 8. Onde o opt-in aparece

- **Landing / widget Click-to-WhatsApp:** caixas B e C antes de iniciar a conversa.
- **Onboarding no app:** B no momento de ativar os módulos de bem-estar.
- **1ª mensagem no WhatsApp:** disclosure de IA + (se aplicável) double opt-in de C.

## 9. Versionamento

Toda mudança no texto gera **nova `consent_version`**. Mantemos o histórico para saber qual versão cada usuário aceitou.

---

*Rascunho técnico-jurídico para revisão. Não constitui aconselhamento jurídico.*
