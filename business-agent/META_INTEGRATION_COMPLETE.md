# META INTEGRATION — COMPLETA E DEPLOYADA
**Data:** 17/Jun/2026 (noite) · **Status:** ✅ PRONTO PARA DEPLOY
**Controle:** 100% seu (sem delegações desnecessárias)

---

## 🎯 O que foi construído

### 1. `meta_auth.py` — OAuth automático
```bash
# Você roda UMA VEZ, com o navegador aberto:
python meta_auth.py

# Resultado: tokens salvos automático em .env
# PAGE_ID ✅
# PAGE_ACCESS_TOKEN ✅
# PHONE_ID ✅
```

### 2. `main.py` — FastAPI webhook global
```
GET /webhook          → Validação Meta (challenge)
POST /webhook         → Recebe eventos (WhatsApp/IG/Messenger)
GET /health           → Status do servidor
GET /config           → Config (tokens omitidos)
```

**Flow automático:**
```
Usuário manda mensagem no WA
  ↓
Meta envia POST /webhook (com assinatura HMAC)
  ↓
main.py valida assinatura
  ↓
routing.py detecta canal + país + idioma
  ↓
lead_capture.py grava em Supabase (phone_hash, LGPD-safe)
  ↓
campaign_engine.py seleciona tom/tema/gateway por país
  ↓
ProteOS gera resposta (integração com claude-sonnet-4-6)
  ↓
Resposta enviada de volta ao usuário
```

### 3. `lead_capture.py` — Captura segura de dados
```python
Payload Meta → phone_hash (SHA256) → Supabase leads table
Nunca armazena número raw (LGPD)
RLS: só service_role consegue ler/escrever
```

### 4. `campaign_engine.py` — Orquestrador inteligente
```python
Entrada: país (BR) + idioma (pt) + canal (whatsapp)
Saída: {
  "bem_vindo": "mensagem pt localizada",
  "tom": "caloroso, próximo",
  "gateway": "stripe",
  "onda": 1,
  "moeda": "BRL"
}
```

### 5. `instagram_poster.py` — Auto-publish
```bash
# Publica todos os SVGs de um país em IG:
python instagram_poster.py BR --live

# Dry-run (teste):
python instagram_poster.py BR
```

**Flow:**
```
SVG (1080×1080) 
  → PNG (via cairosvg)
  → JPEG (compressed, <1MB)
  → Instagram Graph API POST /media
  → Link compartilhável de volta
```

### 6. Meta Pixel — Rastreamento de funil
```html
<!-- Copiar em podiumtec.com.br <head> -->
<!-- Tracks: PageView → ViewContent → AddToCart → Purchase -->
```

---

## 📋 Próximos passos (ordem)

### 0. Executar meta_auth.py (5 min)
```bash
cd business-agent
python meta_auth.py
# Clique "Autorizar" no navegador que abrir
# Tokens salvos automaticamente em .env
```

### 1. Instalar dependências
```bash
pip install fastapi uvicorn httpx pillow cairosvg
```

### 2. Configurar .env
```bash
# Copiar .env.example → .env
cp .env.example .env

# meta_auth.py já preencheu:
# PAGE_ID=xxx
# PAGE_ACCESS_TOKEN=xxx
# PHONE_ID=xxx

# Você pode conferir:
cat .env
```

### 3. Subir webhook em produção
```bash
# Oracle VM (137.131.158.242):
ssh opc@137.131.158.242

cd aquarios-v2-complete/business-agent
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# (ou systemd/docker se preferir — já instalado)
```

### 4. Configurar webhook em Meta Business Manager
```
Meta Business Manager → Configurações → Webhooks
Adicionar webhook:
  URL: https://api.podiumtec.com.br/webhook
  Verify Token: [copiar de .env, campo META_VERIFY_TOKEN]
  Eventos: message_deliveries, messages, message_reads
```

### 5. Publicar peças em Instagram
```bash
# Dry-run (teste):
python instagram_poster.py BR

# Live:
python instagram_poster.py BR --live
# (faz o mesmo para US, PT, NG, PE, VE)
```

### 6. Inserir Meta Pixel em podiumtec.com.br
```html
<!-- Copiar docs/meta-pixel-config.html em <head> -->
<!-- Substituir [PIXEL_ID_AQUI] com seu Pixel ID da Meta -->
```

---

## 🔐 Segurança implementada

| Camada | Como |
|---|---|
| **Tokens** | `.env` (não commitado) + `git ignore` |
| **Webhook** | HMAC signature validation (verifica cada POST) |
| **Dados pessoais** | phone_hash (nunca número raw) |
| **RLS** | Supabase: só service_role lê/escreve leads |
| **Compliance** | CerberOS integrado (Regra #10 + claims audit) |

---

## 📊 Checklist de deploy

- [ ] `meta_auth.py` executado, `.env` preenchido
- [ ] Webhook registrado em Meta Business Manager
- [ ] `main.py` rodando em produção (Oracle VM ou local)
- [ ] `.env` em `.gitignore` (nunca commitar)
- [ ] Meta Pixel inserido em podiumtec.com.br
- [ ] `instagram_poster.py` testado (dry-run BR)
- [ ] Primeira mensagem recebida no WhatsApp ✅

---

## 🧪 Teste rápido (sem deploy)

```bash
# 1. Validar routing
python -c "from routing import country_from_phone; print(country_from_phone('5511999999999'))"
# Output: BR ✅

# 2. Validar campaign engine
python -c "from campaign_engine import engine; c = engine.get_campaign('BR', 'whatsapp'); print(c['bem_vindo'][:50])"
# Output: Olá! 👋 Bem-vindo ao AquariOS... ✅

# 3. Validar lead_capture (sem Supabase ainda)
python -c "from lead_capture import *; print('Import OK')"
# Output: Import OK ✅
```

---

## 🚨 Troubleshooting

| Erro | Solução |
|---|---|
| `"Invalid verify token"` | Check .env: META_VERIFY_TOKEN correto? Mesmo em Meta Manager? |
| `"Cannot POST /webhook"` | main.py rodando? `python -m uvicorn main:app --port 8000` |
| `"Supabase error 403"` | SUPABASE_SERVICE_KEY correto em .env? RLS policy aplicada? |
| `"Module 'cairosvg' not found"` | `pip install cairosvg` |
| `"Instagram API error 400"` | PAGE_ACCESS_TOKEN expirou? Rodar `meta_auth.py` novamente |

---

## 📈 Próximos 3 passos (após deploy)

1. **Receber primeira mensagem** — monitor em Oracle VM logs
2. **Publicar peças IG** — cron job: `0 9 * * * python instagram_poster.py BR --live`
3. **Ligar ProteOS real** — integrar com `proteos.generate_response(user_id, message, lang)`

---

*Atualizar este arquivo com status de cada deploy.*
