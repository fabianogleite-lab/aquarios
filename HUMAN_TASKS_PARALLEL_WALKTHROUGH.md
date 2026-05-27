# 🤝 HUMAN TASKS — Walkthrough Paralelo (Fabiano)

> **Estratégia:** enquanto Claude trabalha em código/SQL, você executa estas 8 tarefas em paralelo. **Total estimado: ~2h focadas**, fragmentável em chunks de 15-30min.
>
> **Onde tiver `🤖 Claude-in-Chrome`** = você pode pedir para Claude no chrome automatizar via CLI. Você só faz CAPTCHA + cartão + 2FA.
>
> **Cole no chat:** "Claude, navegue para [URL] e preencha [campos] usando Claude in Chrome" — Claude usa `mcp__Claude_in_Chrome__navigate` + `form_input`.

---

## ⚡ Ordem recomendada (do mais bloqueante ao menos)

| # | Tarefa | ETA | Bloqueia o quê |
|---|---|---|---|
| 1 | Revogar token Supabase usado em 27/05 | 2min | Segurança |
| 2 | Bootstrap adm_ai (passphrase) | 5min | Admin dashboard |
| 3 | Teleport Cloud | 15min | S16 JIT (Week 1) |
| 4 | Stripe | 15min | S17 BYOK + cobrança |
| 5 | AWS | 20min | S18 infrastructure |
| 6 | Oracle Cloud (Always Free) | 25min | S18 failover |
| 7 | 🌏 Alibaba Cloud International | 30min | S18 Asia |
| 8 | Google Play Console | 15min | S18 launch |

**Total: 2h7min** — pode fragmentar em 3 sessões de 45min cada.

---

## TAREFA 1 — Revogar token Supabase (2min · CRÍTICO)

**Por quê:** o token `sbp_ecd166...` usado para deploy da M-12 não deve persistir.

**Steps:**
1. Acesse: https://supabase.com/dashboard/account/tokens
2. Encontre o token criado em 27/05 (provavelmente "aquarios-deploy" ou similar)
3. Clique no menu `⋯` → **Revoke**
4. Confirme

**🤖 Claude-in-Chrome:** ✅ pode automatizar inteiramente — só pede confirmação no Revoke

**Save:** nada (apenas revogar)

---

## TAREFA 2 — Bootstrap adm_ai gate (5min · ANTES de qualquer admin op)

**Por quê:** sem isso, ninguém (nem você) pode usar `aquarios_admin_grants`.

**Steps (NÃO automatizável — passphrase deve ser ÚNICA e secreta):**

1. **Gere uma passphrase forte** (offline, em papel ou gerenciador de senha):
   - Mínimo 16 caracteres
   - Mistura letras + números + símbolos
   - Exemplo: `Aqu@r10s-S0v3r@n0-2026!` (NÃO use esta — gere a sua)

2. **Pegue seu user UUID do Supabase:**
   - Acesse: https://supabase.com/dashboard/project/agebsmjsjrmazbozphnh/auth/users
   - Clique no seu user (fabianogleite@hotmail.com)
   - Copie o **User UID** (formato UUID v4)

3. **Execute no SQL Editor** (https://supabase.com/dashboard/project/agebsmjsjrmazbozphnh/sql/new):

```sql
-- Substitua YOUR_USER_UUID pelo UID do passo 2
-- Substitua YOUR_PASSPHRASE pela passphrase do passo 1
INSERT INTO public.aquarios_admin_grants
  (user_id, granted_by, passphrase_hash, pre_condition_met, pre_condition_proof, notes)
VALUES (
  'YOUR_USER_UUID',
  'fabiano_self_bootstrap',
  crypt('YOUR_PASSPHRASE', gen_salt('bf', 12)),  -- bcrypt cost 12
  true,
  '{"founder": true, "bootstrap_date": "2026-05-28"}'::jsonb,
  'Founder bootstrap · self-granted'
);

-- Verificar
SELECT user_id, granted_at, pre_condition_met FROM public.aquarios_admin_grants;
```

4. **Guarde a passphrase em local SEGURO** (gerenciador de senhas, NÃO em chat/email)

**🤖 Claude-in-Chrome:** ⚠ PARCIAL — Claude navega ao SQL Editor mas você COLA a passphrase manualmente (nunca digite passphrase via Claude/IA por segurança)

**Save:**
- Passphrase: gerenciador de senhas
- User UID: gerenciador de senhas
- Hash bcrypt: já no banco

---

## TAREFA 3 — Teleport Cloud (15min · $1000/mês após trial)

**Por quê:** JIT access ao Supabase production. Zero-standing-privilege.

**Steps:**

1. Acesse: https://goteleport.com/signup
2. Clique **"Try Teleport Cloud"** ou **"Sign up"**
3. Email: fabianogleite@hotmail.com
4. Organização: "Arkhe Labs" ou "AquariOS"
5. Domain: `aquarios.teleport.sh` (escolha)
6. **Trial:** 14 dias grátis. Depois disso: ~$15/user/month (Team plan).
7. Verificar email
8. Login no painel
9. Vá em **Resources → Add Resource → Database**
10. Tipo: PostgreSQL
11. Conexão: vai pedir host/port/db da Supabase. Use o pooler:
    - Host: `aws-1-sa-east-1.pooler.supabase.com`
    - Port: 5432
    - Database: `postgres`
    - User: `postgres.agebsmjsjrmazbozphnh`
    - Password: pegar do Supabase Dashboard → Project Settings → Database

12. **Habilitar:**
    - [ ] MFA required (Google Authenticator ou similar)
    - [ ] Access Request approval (você se auto-aprova por enquanto)
    - [ ] Session recording

13. **Save:**
    - Teleport URL: `https://aquarios.teleport.sh`
    - Admin email + senha (gerenciador)
    - Credentials para conectar ao Supabase: configuradas

**🤖 Claude-in-Chrome:** ✅ até o passo 11. Cartão de crédito + email confirmation = humano.

**Custo:** Trial 14d grátis. Depois ~$15-$25/mês para 1-2 users. (S16 plan considerou $1000/mês para uso enterprise — adequar realidade founder único.)

---

## TAREFA 4 — Stripe (15min · zero custo até receber pagamentos)

**Por quê:** PanaceIA Payments + BYOK (S17). Receita B2C.

**Steps:**

1. Acesse: https://dashboard.stripe.com/register
2. Email + senha + país (Brasil)
3. Verificação email
4. **Dashboard → Get started**
5. Tipo de negócio: **Individual / Sole Proprietor** (PJ depois)
6. CPF: 521.363.886-49
7. Endereço: seu endereço
8. Conta bancária para repasse: dados da sua conta (banco BR)
9. **Configurar:**
   - Methods: Card · Pix · Boleto (todos)
   - Currencies: BRL primary + USD + EUR
10. **Get API keys:**
    - Vá em: **Developers → API keys**
    - Copie **Publishable key** (pk_test_...)
    - Copie **Secret key** (sk_test_...)
    - ⚠ Use TEST keys até S17 estar pronto. Switch para LIVE só no launch.

11. **Webhook (S17):**
    - **Developers → Webhooks → Add endpoint**
    - URL: `https://agebsmjsjrmazbozphnh.supabase.co/functions/v1/stripe-webhook` (placeholder — edge function ainda não criada)
    - Eventos: `checkout.session.completed`, `payment_intent.succeeded`, `customer.subscription.*`
    - Copie **Signing secret** (whsec_...)

**🤖 Claude-in-Chrome:** ✅ até passo 9. CPF + dados bancários = humano (segurança).

**Save:**
- STRIPE_PUBLISHABLE_KEY (pk_test_...) → mobile/.env
- STRIPE_SECRET_KEY (sk_test_...) → Supabase Vault (NÃO no .env do app!)
- STRIPE_WEBHOOK_SECRET (whsec_...) → Supabase Vault
- Salvar no gerenciador

---

## TAREFA 5 — AWS (20min · Free tier 12 meses)

**Por quê:** S18 Americas/EU primary cloud. EC2 + RDS + S3.

**Steps:**

1. Acesse: https://aws.amazon.com → **Create an AWS Account**
2. Email: fabianogleite@hotmail.com
3. Account name: "AquariOS Production"
4. Verificação email + telefone (SMS)
5. **Personal Account** (PJ depois)
6. Endereço + CPF (Brasil)
7. **Cartão de crédito** (apenas validação — não cobra durante free tier)
8. Identity verification: telefone + foto documento
9. Suporte plan: **Basic (Free)**
10. **Region default:** `sa-east-1` (São Paulo) para latência BR

11. **Free Tier ativado automaticamente:**
    - EC2: 750h/mês t2.micro ou t3.micro
    - RDS: 750h/mês db.t3.micro
    - S3: 5GB storage + 20k GET + 2k PUT requests/month
    - CloudFront: 1TB transfer + 10M requests
    - Lambda: 1M requests + 400k GB-seconds

12. **Criar IAM user para AquariOS** (não usar root!):
    - **IAM → Users → Create user**
    - User name: `aquarios-deploy`
    - Permissions: **Attach policies directly** → `AdministratorAccess` (temporário, refinar depois)
    - Create access key: **Other** (programmatic)
    - **Copiar AccessKeyId + SecretAccessKey** ← críticos

**🤖 Claude-in-Chrome:** ✅ até passo 7. Cartão + identity verification = humano.

**Save:**
- AWS Account ID (12 dígitos)
- AccessKeyId + SecretAccessKey → Supabase Vault (NÃO em git!)
- Root password → gerenciador de senhas
- Configurar AWS CLI local depois (S18 task)

---

## TAREFA 6 — Oracle Cloud Always Free (25min · grátis permanente)

**Por quê:** S18 failover global. Autonomous Database + 200GB storage **forever free**.

**Steps:**

1. Acesse: https://www.oracle.com/cloud/free/
2. Clique **Start for free**
3. **Country:** Brazil
4. Email + senha + nome
5. **Verificação email + telefone (SMS)**
6. **Cartão de crédito** (apenas validação — never charged em Always Free)
7. **Home region:** escolha **US East (Ashburn)** ou **sa-saopaulo-1** (São Paulo)
   - ⚠ Region é PERMANENTE — não pode mudar depois
   - Recomendado: `us-ashburn-1` para alinhar com AWS US-East
8. Identity verification: documento

9. **Always Free recursos automáticos:**
   - 2 Autonomous Databases (20GB cada · 1 OCPU)
   - 4 ARM Ampere A1 cores + 24GB memory (always free compute)
   - 200GB Block Volume storage
   - 10GB Object Storage
   - 10TB outbound data transfer/mês
   - Load Balancer (10Mbps)

10. **Provisionar Autonomous Database:**
    - Console → **Oracle Database → Autonomous Database**
    - Create Autonomous Database
    - Display name: `aquarios-prod-failover`
    - Always Free: **YES**
    - Database name: `AQUARIOS`
    - Workload type: **Transaction Processing**
    - Senha admin (ADMIN user): salvar!

11. **Save:**
    - Oracle Account name (tenancy)
    - Region: `us-ashburn-1`
    - Admin user: `ADMIN` + senha
    - Connection string: vai aparecer no console (copy)

**🤖 Claude-in-Chrome:** ✅ até passo 6. Cartão + verification = humano.

**Custo:** $0 forever (Always Free). Burst paid se exceder limites.

---

## TAREFA 7 — 🌏 Alibaba Cloud International (30min · Free 12 meses)

**Por quê:** 3ª nuvem · Asia primary · low latency 7 países asiáticos do plano.

**Steps:**

1. Acesse: https://www.alibabacloud.com/en/free?_p_lc=1
2. Clique **Sign Up** (Singapore international entity)
3. Email: fabianogleite@hotmail.com
4. Verificação email
5. **Country:** Singapore (entity legal) OR Brazil (cobrança)
6. Nome + telefone + senha
7. **Real-name verification:**
   - Tipo: Enterprise (se tiver PJ) ou Individual
   - Para Individual: passport ou CNH internacional
   - ⚠ Sem verification, free credits NÃO ativam
8. **Cartão de crédito ou PayPal** (para verification, não cobra)
9. **Free credits ativam automaticamente:** $50 + $450-$1300 USD em vouchers

10. **Habilitar serviços:**
    - **ECS (Elastic Compute Service):** 1 instância t6 Burstable grátis 12 meses
      - Region: **ap-southeast-1 (Singapore)** ou **ap-northeast-1 (Tokyo)**
      - Instance type: ecs.t6-c1m1.large (free tier eligible)
      - OS: Ubuntu 22.04 LTS
      - Storage: 40GB SSD
    
    - **RDS PostgreSQL:** $200 credit
      - Region: ap-southeast-1
      - Version: PostgreSQL 14 ou 15
      - Instance: rds.pg.s1.small ou similar
    
    - **OSS (Object Storage):** 5GB free 12 meses
      - Region: ap-southeast-1
      - Bucket name: `aquarios-asia-storage`
    
    - **CDN/DCDN:** 10TB free 12 meses
    
    - **DTS (Data Transmission):** $50 credit para replicação AWS↔Alibaba

11. **Create RAM (Resource Access Management) user:**
    - Console → **RAM → Users → Create User**
    - Name: `aquarios-deploy`
    - Access mode: **Programmatic Access**
    - Permissions: `AdministratorAccess` (temporário)
    - Copie **AccessKeyId + AccessKeySecret**

**🤖 Claude-in-Chrome:** ✅ até passo 7. Real-name verification + cartão = humano.

**Save:**
- Alibaba Account ID
- RAM AccessKeyId + AccessKeySecret → Supabase Vault
- Region primary: ap-southeast-1 (Singapore)
- ECS instance public IP (after creation)
- RDS connection string (after provisioning)

**Custo ano 1:** $0 (free credits cobrem ECS+RDS+OSS por 12 meses).
**Custo ano 2:** ~$80-$150/mês estimado.

---

## TAREFA 8 — Google Play Console (15min · $25 lifetime)

**Por quê:** publicar APK no Play Store em 09/09/2026.

**Steps:**

1. Acesse: https://play.google.com/console/u/0/signup
2. Login com Google Account (ou criar `aquarios.dev@gmail.com`)
3. Tipo de conta: **Developer (Individual)** ou **Organization**
4. Nome do desenvolvedor: "Fabiano Gomes Leite" ou "Arkhe Labs"
5. **Pagamento único $25 USD** (lifetime, não anual!)
6. Identity verification (passport ou CNH)

7. **Configurar Developer Profile:**
   - Nome público: "Arkhe Labs"
   - Email contato: fabianogleite@hotmail.com
   - Website: (criar landing page · ver Hero's Journey spec)
   - Phone: seu número
   - Address: seu endereço

8. **Criar app (placeholder):**
   - Console → **Create app**
   - Default language: pt-BR
   - App name: "AquariOS"
   - App or game: **App**
   - Free or paid: **Free** (com in-app purchases)
   - Declarations: aceitar developer policies + US export

9. **Internal testing track:**
   - **Testing → Internal testing → Create new release**
   - Pode subir um AAB de teste já agora (placeholder)
   - Adicionar email Fabiano como tester

**🤖 Claude-in-Chrome:** ✅ até passo 5. Pagamento + identity = humano.

**Save:**
- Google Play Developer Account email
- App ID: `com.arkhelabs.aquarios` (definir agora)
- Internal testing track URL (para distribuir betas)

---

## 📋 Checklist final

Ao terminar, você terá:

```
[ ] Token Supabase antigo REVOGADO
[ ] adm_ai bootstrap feito (passphrase em gerenciador)
[ ] Teleport Cloud account + DB proxy configurado
[ ] Stripe account + test keys + webhook configurado
[ ] AWS account + IAM user com keys
[ ] Oracle Cloud account + Autonomous DB provisionada
[ ] 🌏 Alibaba Cloud account + ECS/RDS provisionados (Singapore)
[ ] Google Play Console + app placeholder criado

CREDENCIAIS GUARDADAS (gerenciador senhas):
[ ] Senhas root de todos
[ ] AWS AccessKey + Secret
[ ] Oracle ADMIN password
[ ] Alibaba RAM AccessKey + Secret
[ ] Stripe sk_test_* e whsec_*
[ ] Teleport admin URL + cred
[ ] adm_ai passphrase
[ ] Google Play developer email
```

**Tempo total: ~2h7min · Custo total ano 1: ~$25 (Google Play) + ~$50-200 (Teleport opcional) = $75-$225**

Todo o resto é free durante 12 meses.

---

## 🤖 Como pedir ajuda do Claude in Chrome

Quando estiver fazendo uma tarefa, abra um chat Claude paralelo e cole:

```
Por favor automatize parte de [TAREFA X · nome] usando Claude in Chrome.
URL inicial: [URL específica]
O que automatizar: [steps específicos, ex: "preencha o form de signup, MAS PARE no campo de cartão de crédito"]
O que NÃO automatizar: cartão, CAPTCHA, 2FA, passphrase, CPF, identity docs
```

Claude usará `mcp__Claude_in_Chrome__navigate`, `form_input`, `find` e `javascript_tool` para preencher automaticamente.

---

**Pronto para começar?** Sugestão: **Tarefa 1 (revogar token) + Tarefa 2 (bootstrap adm_ai)** primeiro, depois pause e respira. Continue Tarefa 3-8 em sessões de 15-30min cada.
