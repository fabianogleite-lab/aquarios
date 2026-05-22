# ⚗ AquariOS v2.0000
## Sistema Operacional de Integração Humana

**Autor:** Fabiano Gomes Leite  
**Email:** suporte@aquarios.app  
**Data:** 14 de Maio de 2026  

---

## 📋 ÍNDICE

1. [Setup Rápido](#setup-rápido)
2. [Arquitetura](#arquitetura)
3. [Backend Setup](#backend-setup)
4. [Mobile Setup](#mobile-setup)
5. [Build APK](#build-apk)
6. [Play Store Upload](#play-store-upload)
7. [Beta Tester Info](#beta-tester-info)
8. [Troubleshooting](#troubleshooting)

---

## 🚀 Setup Rápido

### Pré-requisitos

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **PostgreSQL** >= 14
- **Redis** >= 7.0
- **Expo CLI** (para mobile)
- **Android Studio** ou **EAS Build** (para APK)

### Clone & Install

```bash
# Backend
cd backend
npm install

# Mobile
cd ../mobile
npm install

# Expo CLI (se não tiver)
npm install -g expo-cli
```

---

## 🏗️ Arquitetura

```
⚗ ARKHE (Holding Legal)
├── AquariOS Backend (Node.js + Express + PostgreSQL + Redis)
├── AquariOS Mobile (React Native + Expo)
└── Documentation

MÓDULOS BACKEND:
├── ProteOS (Hub Conversacional)
├── HygeiOS (ETL + IVI)
├── AsclepiOS (Risk Score + Decisão)
├── SandeirOS (Engine Simbólica — oculto)
├── EcumenicOS (13 Tradições)
├── EteriOS (IoT/Wearables)
├── Comunidades (Social + Gamificação)
└── Marketplace (Economia Interna)

MÓDULOS MOBILE:
├── Dashboard (IVI + Status)
├── Diário do Ser (Journal)
├── Nutrição (Meals)
├── ProteOS Chat
├── Comunidades
└── Configurações
```

---

## 🛠️ Backend Setup

### 1. Database Setup

```bash
# Criar banco de dados
createdb aquarios_v2

# Restaurar schema
psql aquarios_v2 < backend/schema_v2_0000.sql

# Verificar
psql aquarios_v2 -c "SELECT version();"
```

### 2. Environment Configuration

```bash
# Copiar template
cp backend/.env.example backend/.env

# Editar .env com seus valores
nano backend/.env
```

**Valores críticos:**

```env
DATABASE_URL=postgresql://user:password@localhost:5432/aquarios_v2
REDIS_URL=redis://localhost:6379
JWT_SECRET=sua-chave-64-caracteres-minimo
ENCRYPTION_KEY=sua-chave-aes-256-64-caracteres
ANTHROPIC_API_KEY=sk-ant-xxxxxxx
NODE_ENV=production
PORT=3000
```

### 3. Start Server

```bash
cd backend

# Development (com auto-reload)
npm run dev

# Production
npm start
```

Servidor estará em: `http://localhost:3000`

### 4. Seed Database

```bash
# Popular com personas e FAQs
npm run seed:database
```

---

## 📱 Mobile Setup

### 1. Install Dependencies

```bash
cd mobile
npm install
```

### 2. Configure API URL

```bash
# .env ou eas.json
EXPO_PUBLIC_API_URL=https://seu-api-endpoint.com
```

### 3. Test on Device

```bash
# iOS (Mac only)
npm run ios

# Android (via Expo Go app)
npm run android

# Web (debug)
npm run web
```

---

## 📦 Build APK

### Opção 1: EAS Build (Recomendado)

```bash
cd mobile

# Login no Expo
eas login

# Configurar EAS
eas build:configure

# Build APK
eas build --platform android --type apk

# Ou AAB (recomendado para Play Store)
eas build --platform android --type app-bundle
```

**Tempo estimado:** 10-15 minutos

### Opção 2: Local Build (Avançado)

```bash
# Requer Android SDK + JDK
expo build:android --type apk --local

# Output: `./build/` com arquivo .apk
```

### Opção 3: Development APK (Teste Rápido)

```bash
# APK debug — válido por ~24h
eas build --platform android --type apk --profile preview

# Instalar no dispositivo
adb install aquarios-v2.apk
```

---

## 🏪 Play Store Upload

### 1. Preparar App Bundle

```bash
# Gerar AAB (formato Play Store)
eas build --platform android --type app-bundle

# Download do arquivo (EAS fornece link)
```

### 2. Google Play Console

1. Acessar: https://play.google.com/console
2. Criar novo app ou usar existente
3. **Release > Production**
4. Upload do AAB
5. Preencher:
   - Title: "AquariOS"
   - Description: "Infraestrutura Operacional de Integração Humana"
   - Screenshots (5-8 em 1080x1920)
   - Privacy Policy (LGPD compliant)
   - Support Email: fabianogleite@hotmail.com

### 3. Beta Testing

**Antes de Production:**

1. **Closed Testing (Interno)**
   - Invite: equipe interna
   - Duration: 1-2 semanas
   - Feedback: relatórios de crash, performance

2. **Open Testing (Beta Pública)**
   - Invite: beta testers via link
   - Limite: até 10.000 testadores
   - Duration: 2-4 semanas

3. **Staged Rollout (Production)**
   - Start: 5% dos users
   - Escalate: 25% → 50% → 100% (conforme estabilidade)

### 4. Checklist Pre-Launch

- [ ] Versão compilada: v2.0000
- [ ] Testada em Android 11, 12, 13, 14
- [ ] Permissões (health, location, camera) solicitadas e justificadas
- [ ] Icons e banners (1080x1920, 512x512)
- [ ] Privacidade (LGPD) — link funcional
- [ ] Support email — respondendo 24-48h
- [ ] Descrição em PT-BR
- [ ] Rating esperado: ≥4.0 stars

---

## 👥 Beta Tester Info

### Para Beta Testers (Interno)

**Credenciais Padrão:**

```
Email: beta@aquarios.app
CPF: 00000000000 (fictício)
Senha: BetaTester123!

OU criar novo account via app
```

**Personas Pré-configuradas:**

1. **Roberto Santos** (ZE_DO_APERTO)
   - Ticket: R$24,90–49,90
   - FAQs: stress financeiro, nutrição low-cost, sono 6h
   - Use case: Micro-empreendedor com orçamento apertado

2. **Maria da Silva** (DONA_MARIA)
   - Ticket: R$39,90–149,90
   - FAQs: diabetes, medicações, família
   - Use case: Idosa com condição crônica

3. **Carlos Mendes** (CARLOS_CLINICAL_URGENT)
   - Ticket: R$89,90–399,90
   - FAQs: pressão, colesterol, stress cardíaco
   - Use case: Executivo de alta performance

### Feedback Loop

**Relatório esperado a cada semana:**

```
Semana de: ___________

❌ BUGS CRÍTICOS (travamentos, crashes)
─────────────────────────────────────
[ ] Item 1: "App fecha ao..." (passos para reproduzir)
[ ] Item 2: ...

⚠️ BUGS MENORES (UI glitches, validações)
──────────────────────────────────────────
[ ] Item: ...

✅ FUNCIONA BEM
──────────────
✓ Login
✓ IVI display
✓ Journal
✓ Chat ProteOS

📊 PERFORMANCE
──────────────
- Tempo startup: ___ seg
- Latência API: ___ ms
- Uso memória: ___ MB

💭 FEEDBACK QUALITATIVO
───────────────────────
- Usabilidade: ___/5
- Clareza: ___/5
- Velocidade: ___/5
- Obs: ...
```

**Enviar para:** suporte@aquarios.app

---

## 🐛 Troubleshooting

### Backend Issues

**Erro: `could not connect to database`**
```bash
# Check PostgreSQL
psql -U postgres -d aquarios_v2 -c "SELECT 1"

# Restart service
sudo systemctl restart postgresql
```

**Erro: `Redis connection refused`**
```bash
# Start Redis
redis-server

# Ou via Docker
docker run -d -p 6379:6379 redis:latest
```

**Erro: `JWT token expired`**
- Normal. Implementar refresh token automaticamente no mobile.
- Backend responde com `401 Unauthorized` → mobile usa refresh token.

### Mobile Issues

**Erro: `expo: command not found`**
```bash
npm install -g expo-cli
```

**APK não instala**
```bash
# Verificar Android SDK
adb devices

# Desinstalar versão anterior
adb uninstall com.arkhe.aquarios

# Reinstalar
adb install aquarios-v2.apk
```

**App não conecta ao backend**
- Verificar: `EXPO_PUBLIC_API_URL` no `.env`
- Verificar: backend rodando em `http://localhost:3000`
- Verificar: CORS configurado (móvel != localhost)

**Erro: `Unsupported grant type`**
- Implementar OAuth2 corretamente (Google Login)
- Verificar PKCE flow nos requests

### Database Issues

**Erro: `permission denied for schema public`**
```sql
GRANT ALL ON SCHEMA public TO aquarios_user;
```

**Tabelas vazias após seed**
```bash
npm run seed:database
psql aquarios_v2 -c "SELECT COUNT(*) FROM faqs;"
```

---

## 📊 Monitoramento (Production)

### Sentry (Error Tracking)

```bash
# Setup Sentry DSN em .env
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
```

### DataDog (Performance)

```bash
# Metrics: response time, DB queries, memory usage
# Configure em backend/monitoring.js
```

### Logs

```bash
# Backend logs (Winston)
tail -f logs/aquarios-v2.log

# CloudWatch (se AWS)
aws logs tail /ecs/aquarios-v2 --follow
```

---

## 🔐 Security Checklist

- [ ] JWT secrets rotacionados
- [ ] Database backups diários
- [ ] HTTPS ativado em produção
- [ ] LGPD compliance 100%
- [ ] Rate limiting ativo
- [ ] SQL injection prevention (prepared statements)
- [ ] CORS restringido
- [ ] Admin console protegido (2FA)

---

## 📝 Versioning

```
v2.0000 (14/05/2026)
├── Backend: server_v2_0000.js
├── Mobile: APK v2.0.0
├── Database: schema_v2_0000.sql
└── Docs: este README

Histórico:
v1.0512 (12/05/2026) — Manual completo ARKHE
v1.0411 (11/05/2026) — Especificação inicial
```

---

## 🔗 Links Úteis

- **GitHub:** `github.com/fabianogleite/arkhe-app` (privado)
- **Expo Dashboard:** `https://expo.dev/dashboard`
- **Google Play Console:** `https://play.google.com/console`
- **PostgreSQL Docs:** `https://www.postgresql.org/docs/`
- **React Native Docs:** `https://reactnative.dev/docs/`

---

## 📞 Suporte

**Autor:** Fabiano Gomes Leite  
**Email:** suporte@aquarios.app  
**Telefone:** (conforme disponibilidade)  
**GitHub Issues:** `github.com/fabianogleite/arkhe-app/issues`

---

## ⚖️ Licença

Lei 9.610/1998 | Convenção de Berna | Acordo TRIPS | LGPD 13.709/2018

**Propriedade intelectual:** Fabiano Gomes Leite  
**Proibida reprodução total ou parcial sem autorização expressa.**

---

**AquariOS v2.0000 — Pronto para Beta Testers e Play Store Submission**
