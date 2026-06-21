# META SETUP CHECKLIST — S35
**Criado:** 17/Jun/2026 (noite) · **Atualizado:** hoje cedo
**Status:** BLOQUEADO em "ação do fundador"
**Business ID:** 2274467833382298 (PodiumTec)

---

## ✅ FASE 0 — Seu lado (CRÍTICO — sem isso não saímos do zero)

### 0.1 — Página Facebook para AquariOS (5 minutos)
```
Meta Business Manager (businessmanager.facebook.com)
  → Contas
  → Páginas
  → Criar nova página
  
Nome: AquariOS
Categoria: App (ou Health & Wellness)
Descrição: AI Personal Operating System for Well-being
Foto de capa: logo-perfil-instagram.svg (convert para PNG primeiro)
Bio: 🌊 IA de bem-estar integral · Físico · Mental · Espiritual · Social
```
**Resultado esperado:** PAGE_ID (exemplo: 1234567890123456)

### 0.2 — Conectar página ao Business Manager
```
Após criar a página:
  → Atribuições
  → Adicionar página ao negócio
  → Selecionar PodiumTec (Business ID: 2274467833382298)
  → Confirmar
```

### 0.3 — Gerar Access Token (Page Access Token)
```
Meta Business Manager
  → Ferramentas
  → Meta App (fabianogleite-lab/aquarios)
  → Settings → Basic
  → Copia "Access Token" (longo, começa com EAAB...)
```
**Resultado esperado:** PAGE_ACCESS_TOKEN (formato: EAAB...)

### 0.4 — Submeter para Verificação Meta Business (CRÍTICO)
```
Meta Business Manager
  → Configurações
  → Empresa
  → Verificação
  → Enviar para verificação (identidade + selfie + documento)
```
**Tempo:** 3–7 dias
**Resultado esperado:** Email confirmando aprovação

---

## ⏳ FASE 1 — Meu lado (assim que recebo tokens)

### 1.1 — Criar arquivo `.env` seguro
```bash
# business-agent/.env (NÃO commitar este arquivo)
BUSINESS_ACCOUNT_ID=2274467833382298
PAGE_ID=[você passa aqui]
PAGE_ACCESS_TOKEN=[você passa aqui]
META_APP_SECRET=[após verificação Meta]
META_VERIFY_TOKEN=[gero aleatório]
META_TOKEN=[após verificação Meta]
PHONE_ID=[gerado ao criar WhatsApp Business Account]
SUPABASE_URL=https://agebsmjsjrmazbozphnh.supabase.co
SUPABASE_SERVICE_KEY=[já tem]
```

### 1.2 — Configurar WhatsApp Business API
```python
# metactl.py doctor (testa conexões)
python metactl.py doctor
# Resultado: ✅ BUSINESS_ACCOUNT_ID, ✅ PAGE_ACCESS_TOKEN, ✅ SUPABASE
```

### 1.3 — Criar WhatsApp Business Account (dentro de Meta)
```
Meta Business Manager
  → Contas
  → WhatsApp Business Accounts
  → Criar nova conta
  → Número de telefone: [seu número]
  → Confirmar código recebido no WhatsApp
```
**Resultado esperado:** PHONE_ID (seu número de telefone registrado)

### 1.4 — Wiring do routing.py
```python
# business-agent/main.py (atualizar imports)
from routing import detect_channel, extract_id, country_from_phone, country_info
# Remove lógica mono-canal (só WhatsApp)
# Adiciona detect_channel(payload) → routing global
```

### 1.5 — Criar lead_capture.py
```python
# Quando mensagem chega via WhatsApp:
# 1. extract_id(payload) → telefone
# 2. country_from_phone(telefone) → ISO2 (BR, US, etc)
# 3. INSERT Supabase: leads (phone_hash, pais, canal, onda, criado_em)
# 4. RLS: só service_role pode ler/escrever (LGPD)
```

### 1.6 — Criar Instagram Graph API client
```python
# marketing-global/agencia/instagram_poster.py
# Quando SVG pronto:
# 1. Export Figma → PNG
# 2. Compress imagem (max 1080px)
# 3. POST /media (IG Graph API)
# 4. Agenta → caption local + hashtags
```

### 1.7 — Meta Pixel setup
```html
<!-- docs/meta-pixel-config.html -->
<!-- Pixel ID: gerado após setup -->
<script>
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  // ... (código padrão Meta)
  fbq('init', '[PIXEL_ID]');
  fbq('track', 'PageView');
  fbq('track', 'ViewContent');
</script>
```

### 1.8 — Compliance gates automáticos
```python
# business-agent/cerber_shield.py (já existe)
# Cada resposta ProteOS passa por:
# ✅ claim_check (nenhuma "cura de doença")
# ✅ cultural_check (sem Buda em TH, paridade religiosa em NG, RTL audit IL/IR)
# ✅ identity_protection (LGPD: phone_hash, nunca número raw)
```

---

## 📋 Checklist resumido pra você

**Hoje:**
- [ ] Criar página AquariOS no Facebook
- [ ] Conectar página ao Business Manager (PodiumTec)
- [ ] Gerar PAGE_ACCESS_TOKEN
- [ ] Submeter para verificação Meta Business

**Resultado esperado:**
```
PAGE_ID = [seu ID aqui]
PAGE_ACCESS_TOKEN = EAABxxxxxx...
```

**Ação:** você me passa esses dois valores, e eu começo a FASE 1.

**Tempo:** 15 minutos (setup) + 3–7 dias (aprovação Meta)

---

## 🔐 Segurança

- `.env` entra em `.gitignore` (NÃO commitar)
- Access Token só em memória do servidor (Oracle VM)
- Nenhum token logado em stdout
- Webhook Meta valida assinatura antes de processar (HMAC)

---

*Atualizar este arquivo com seus PAGE_ID + PAGE_ACCESS_TOKEN quando pronto.*
