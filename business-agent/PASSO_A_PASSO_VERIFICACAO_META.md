# 🔐 Passo a passo — Verificação Meta Business (Pacote D · item 1)

> **Por que isto primeiro:** destrava o **deploy do business-agent (D2/D3)** e o **teste E2E (D5)**.
> As credenciais `META_TOKEN` e `PHONE_ID` que o serviço precisa **nascem aqui**.
> Prazo de aprovação: **10 min a ~14 dias úteis** → é o gargalo, comece já.

---

## 📍 Status atual (11/Jun, sessão de co-piloto via prints)

- **Negócio certo confirmado**: "**C & L - Gestora de Recursos**" (`business_id=785398925693475`) — bate com o D-U-N-S `824652492` (CARVALHO & LEITE GESTORA DE RECURSOS LIMITADA).
- **Central de Segurança do C&L** (`security_center?business_id=785398925693475`) hoje mostra um *scorecard de higiene de segurança* (domínio confiável pendente, 1 conta de anúncio sem aprovação de semelhantes, 2FA **não ativada** no admin) — **não** um status explícito "Verificação da Empresa: Verificada/Não verificada". Pode estar mais abaixo na página ou só aparecer ao clicar "Iniciar verificação" / dentro de "Informações da empresa" (não testado ainda).
- **C&L bloqueado para CRIAR nova conta de anúncios** — mensagem: "Você atingiu o número máximo de contas de anúncios permitido para um novo portfólio empresarial... depois de seguir nossas políticas por várias semanas." → **isto é um limite de portfólio novo (idade/histórico), NÃO o mesmo gate da Verificação da Empresa**. C&L já tem 1 conta de anúncios existente (não inspecionada ainda).
- **Workaround em andamento**: conta de anúncios `AquariOS - Ads` sendo criada no portfólio **"Fabiano Leite"** (`business_id=2642630901...`, BRL/America-São Paulo) — **transferir para C&L depois** quando o limite de portfólio novo liberar.
- **Próximo passo**: Parte 2 abaixo — `developers.facebook.com/apps` → criar/abrir app → produto WhatsApp → API Setup → `PHONE_ID` + token temporário. **Não depende** da Parte 1 estar concluída (só a migração pra produção/limites altos depende).
- **Pendência secundária, não bloqueante**: ativar 2FA no admin (`leite81@hotmail.com`) — recomendado pela Meta, pode ser pré-requisito de alguns recursos da API mais adiante.

### ⚠️ Se aparecer convite pra prêmio / destaque / programa de competição da Meta

**NÃO inscrever o negócio AquariOS/C&L.** AquariOS é grande demais pra se expor numa competição agora — é como sugerir a um grande chef participar de reality show.

Se quiser mostrar potencial, use o portfólio **"Odontolar Plus API"** (um dos 4 negócios na tela de seleção) como **case construído pelo ProteOS** — demonstra capacidade técnica sem revelar o que o AquariOS realmente é.

---

## 0. Pré-requisitos (ter em mãos antes de começar)
- Conta no **Meta Business Manager** — https://business.facebook.com/
- **CNPJ** da controladora **CARVALHO & LEITE GESTORA DE RECURSOS LIMITADA** (Cartão CNPJ em PDF/imagem legível).
- **Comprovante oficial** com a razão social + endereço **ou** telefone, emitido há **≤ 1 ano** (contrato social, cartão CNPJ, conta de serviço). O nome legal tem que ser **idêntico** ao do CNPJ.
- E-mail corporativo: **contato@podiumtec.com.br** (ativo ✅).
- Site: **podiumtec.com.br** (no ar ✅).
- (útil) D-U-N-S já emitido: **824652492**.

---

## Parte 1 — Verificação do Negócio (Business Verification)
1. Abra as **Configurações do Negócio** → https://business.facebook.com/settings
2. No menu lateral, **Central de Segurança** (*Security Center*) → https://business.facebook.com/settings/security-center
3. Clique **Iniciar verificação** (*Start Verification*).
4. Preencha os dados da organização **exatamente como no CNPJ**: razão social, endereço, telefone e site (`podiumtec.com.br`).
5. Escolha como receber o **código de confirmação** (e-mail do domínio ou telefone).
6. Faça **upload dos documentos** (Cartão CNPJ / contrato social) — devem mostrar nome legal + endereço/telefone, **≤ 1 ano**.
7. Digite o código → **Concluir**.
8. Acompanhe o status por e-mail + notificação no Business Manager (**10 min – 14 dias úteis**).

📚 Referência oficial: [About Business Verification](https://www.facebook.com/business/help/1095661473946872) · [Verify Your Business](https://www.facebook.com/business/help/2058515294227817) · [About Security Center](https://www.facebook.com/business/help/216940652189296)

---

## Parte 2 — WhatsApp Business + credenciais do agente
*(É aqui que saem o `PHONE_ID` e o `META_TOKEN` que o D2/D3 usa.)*
1. **Meta for Developers** → criar um **app** com caso de uso **WhatsApp** → https://developers.facebook.com/apps
2. No painel do app: **WhatsApp → Configuração da API** (*API Setup*). Aparecem o **`PHONE_ID`** (Phone number ID) e um token temporário; conecte/crie a **WABA** (WhatsApp Business Account).
3. **Adicione e verifique o número** do WhatsApp Business de produção — exige a **Parte 1 concluída** para sair do modo teste e subir os limites.
4. **Token permanente (`META_TOKEN`):** Business Settings → **Usuários do sistema** (*System users*) → criar System User → **Atribuir ativos** (o app **e** a WhatsApp Business Account, controle total) → **Gerar token** com as permissões `whatsapp_business_messaging` + `whatsapp_business_management`. **Guarde o token** (não reaparece).
5. **`META_APP_SECRET`:** App → Configurações → **Básico**. **`META_VERIFY_TOKEN`:** você inventa (qualquer string secreta) e usa no webhook.

📚 Referência: [WhatsApp Cloud API — Get Started](https://developers.facebook.com/docs/whatsapp/cloud-api/get-started) · [WhatsApp Business Accounts](https://developers.facebook.com/docs/whatsapp/overview/business-accounts/)

---

## Parte 3 — Fechar o loop (quando aprovar)
Me avise **"Meta verificada + tenho as credenciais"**. Eu então, na sessão seguinte:
- faço o **deploy do `business-agent/` na VM Oracle**, preencho o `.env` (`META_APP_SECRET`, `META_VERIFY_TOKEN`, `META_TOKEN`, `PHONE_ID`, `SUPABASE_SERVICE_KEY`);
- registro o **webhook** (`/webhook`) e o **callback de exclusão** (`/delete-data`);
- rodamos o **E2E (+55 / +351)** do `business-agent/tests/E2E_CHECKLIST.md`.

Os 5 valores esperados estão documentados em [`.env.example`](.env.example).

---

## 🔗 Todos os links
| O quê | Link |
|---|---|
| Meta Business Manager | https://business.facebook.com/ |
| Configurações do Negócio | https://business.facebook.com/settings |
| Central de Segurança (verificação) | https://business.facebook.com/settings/security-center |
| About Business Verification | https://www.facebook.com/business/help/1095661473946872 |
| Verify Your Business | https://www.facebook.com/business/help/2058515294227817 |
| About Security Center | https://www.facebook.com/business/help/216940652189296 |
| Meta for Developers (apps) | https://developers.facebook.com/apps |
| WhatsApp Cloud API — Get Started | https://developers.facebook.com/docs/whatsapp/cloud-api/get-started |
| WhatsApp Business Accounts | https://developers.facebook.com/docs/whatsapp/overview/business-accounts/ |

> ⚠️ Os rótulos de menu da Meta mudam com frequência — se um item estiver com nome diferente, confira pelos links oficiais acima. **Regra de ouro:** todo dado (razão social, endereço) tem que bater **idêntico** ao CNPJ, senão a verificação é recusada.
