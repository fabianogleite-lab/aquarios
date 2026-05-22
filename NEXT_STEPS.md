# ⚗ AquariOS v2.0000 — PRÓXIMOS PASSOS IMEDIATOS

**Para:** Fabiano Gomes Leite  
**De:** Auditor Estratégico (Claude)  
**Data:** 14 de Maio de 2026  
**Assunto:** APK v2.0000 — Pronto para Distribuição

---

## 🎯 Situação Atual

✅ **Completo:**
- Backend Node.js (35+ endpoints) — 800 linhas
- Database PostgreSQL (18 tabelas, LGPD) — 600 linhas
- Mobile React Native (6 telas) — 200+ linhas
- Documentação (README, Release Notes, Index)
- Seed data (42 FAQs + 5 comunidades)

❌ **Falta:**
- Assets (icon.png, splash.png) — **CRIAR/FAZER**
- Deploy em servidor (DigitalOcean/AWS) — **VOCÊ DECIDE**
- APK final para Play Store — **PRÓXIMO PASSO**

---

## 🚀 PLANO DE AÇÃO (Próximos 7 dias)

### DIA 1-2: Setup Local & Validação

```bash
# 1. Clonar arquivos
mkdir -p ~/projects/aquarios-v2
cp -r aquarios-v2-complete/* ~/projects/aquarios-v2/

# 2. Backend
cd ~/projects/aquarios-v2/backend
npm install
cp .env.example .env

# 🔴 VOCÊ EDITA .env:
# DATABASE_URL = sua conexão PostgreSQL
# JWT_SECRET = gere uma chave 64-caracteres
# ENCRYPTION_KEY = idem
# ANTHROPIC_API_KEY = seu token Claude
# NODE_ENV = development (por enquanto)

# 3. Database
createdb aquarios_v2
psql aquarios_v2 < schema_v2_0000.sql
npm run seed:database

# 4. Start
npm run dev
# → Deve responder em http://localhost:3000/api/v2/health
```

### DIA 3-4: Mobile & Assets

```bash
# 1. Mobile setup
cd ../mobile
npm install

# 2. 🔴 VOCÊ CRIA ASSETS em: mobile/assets/
# Precisam de:
#   - icon.png (512x512)
#   - splash.png (1080x1920)
#   - adaptive-icon.png (108x108 core)
#
# Sugestão: usar Figma ou Canva
# Tema: Dourado (#b8952a) + Azul Escuro (#090c14)

# 3. Testar mobile localmente
npm run android
# (ou npm run ios se Mac)
```

### DIA 5-6: Build APK

```bash
cd mobile

# 1. Login no Expo
expo login
# Email: seu-email@gmail.com
# Senha: sua-senha

# 2. Configure EAS
eas build:configure
# Responde "android", "app-bundle"

# 3. Build APK
eas build --platform android --type apk
# ⏱️ Espera 10-15 minutos
# Recebe link para download do .apk

# 4. Testar no dispositivo/emulador
adb install aquarios-v2-v2.0.0.apk
# Abre app, testa login + chat + journal

# 5. Renomear arquivo (se necessário)
# aquarios-v2-v2.0.0.apk → AquariOS_v2.0.0_beta.apk
```

### DIA 7: Deploy & Play Store

```bash
# 1. Build AAB (formato Play Store)
eas build --platform android --type app-bundle
# Espera arquivo .aab

# 2. Acessar Google Play Console
# https://play.google.com/console
# → Criar app "AquariOS"
# → Internal Testing → Upload AAB

# 3. Invite beta testers (seu email)
# Vai receber link de teste

# 4. Monitorar crashes
# Play Console → Crashes & ANRs
```

---

## 📋 Arquivos Que Você Precisa

### Criar (Design)
```
mobile/assets/
├── icon.png (512x512, PNG)
├── splash.png (1080x1920, PNG)
└── adaptive-icon.png (108x108, PNG)
```

### Editar (Configuração)
```
backend/.env
├── DATABASE_URL = postgres://...
├── JWT_SECRET = min-64-chars
├── ENCRYPTION_KEY = min-64-chars
├── ANTHROPIC_API_KEY = sk-ant-...
└── NODE_ENV = development | production
```

### Deploy (Sua Escolha)
```
Opções:
1. DigitalOcean App Platform (recomendado)
2. AWS ECS + RDS
3. Render.com (mais simples)
4. Railway.app (mais simples ainda)

Recomendação: Use DigitalOcean App Platform
Tempo setup: 30 minutos
Custo: $5-10/mês (backend + database)
```

---

## 🎯 Versão Final Esperada

```
Arquivo             Tamanho   Local Download
─────────────────────────────────────────────
AquariOS_v2.0.0_beta.apk  ~50-70 MB   EAS Build link
Schema + Seed SQL          ~2 MB      Este projeto
Backend Server             ~800 linhas Este projeto
Mobile App                 ~200 linhas Este projeto
```

---

## 💾 Estratégia: Dev vs Prod

### Desenvolvimento (Agora)

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://localhost/aquarios_v2
REDIS_URL=redis://localhost:6379
CORS_ORIGIN=http://localhost:8081,exp://localhost:8081
```

### Produção (Antes Play Store)

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgres://user:pass@prod-db.digitalocean.com/aquarios_v2
REDIS_URL=redis://prod-redis.digitalocean.com:6379
CORS_ORIGIN=https://yourdomain.com
SENTRY_DSN=https://xxx@sentry.io/xxx (para error tracking)
```

---

## ⚠️ Criticalidades Antes de Launch

### Security

```
❌ NUNCA:
- Commit .env com secrets
- Usar JWT_SECRET fraco
- Rodar em HTTP (sempre HTTPS)
- Expor database password em logs

✅ SEMPRE:
- Rotate secrets a cada 30 dias
- Use managed PostgreSQL (DigitalOcean, AWS RDS)
- Enable rate limiting
- Monitor Sentry para errors
```

### Compliance

```
✅ LGPD:
- Dados criptografados (AES-256)
- Direito ao esquecimento (DELETE endpoint)
- Auditoria (todos logs registrados)
- Consentimento (checkbox na signup)

✅ Google Play:
- Privacy Policy (link funcional)
- Perms justificadas (health, location, camera)
- App signing key configurada
- Crash reports monitorados
```

---

## 📞 Suporte Técnico

Se travar em algum passo:

```
Backend Issues?
→ Verificar: psql -U postgres -d aquarios_v2 "SELECT 1;"
→ Verificar: redis-cli ping
→ Logs: tail -f logs/aquarios-v2.log

Mobile Issues?
→ Verificar: npm list (dependencies ok?)
→ Verificar: eas --version (Expo CLI?)
→ Limpar: rm -rf node_modules && npm install

APK Issues?
→ Verificar: adb devices (dispositivo conectado?)
→ Verificar: Android SDK Path (ANDROID_HOME)
→ Testar: eas build --platform android --type apk --profile preview
```

---

## 📊 Estimativa de Tempo

| Atividade | Tempo | Complexidade |
|-----------|-------|--------------|
| Setup backend | 10 min | Baixa |
| Setup database | 15 min | Média |
| Setup mobile | 10 min | Baixa |
| Criar assets | 60 min | Alta (design) |
| Build APK | 15 min | Baixa (EAS faz) |
| Play Store upload | 30 min | Média (burocracia) |
| Beta testing | 2 semanas | Contínuo |
| **Total** | **~1.5 dias** (não-sequencial) | — |

---

## ✅ Checklist Final

- [ ] Backend rodando em http://localhost:3000
- [ ] Database seeded com 42 FAQs
- [ ] Mobile testada em Android/iOS
- [ ] Assets criados (icon, splash)
- [ ] APK gerado via EAS
- [ ] APK testado no dispositivo
- [ ] Play Console account criado
- [ ] Privacy Policy escrita
- [ ] Beta testers convidados
- [ ] Crash monitoring (Sentry) ativado

---

## 🎬 Comando Rápido (Copy-Paste)

```bash
# Tudo junto (assumindo dependências OK)
mkdir -p ~/aquarios-v2 && cd ~/aquarios-v2
# COPIE FILES AQUI

cd backend && npm install && npm run dev &
cd ../mobile && npm install && npm run android

# Novo terminal:
cd backend
createdb aquarios_v2 2>/dev/null || true
psql aquarios_v2 < schema_v2_0000.sql
npm run seed:database

# Já está rodando!
# Backend: http://localhost:3000
# Mobile: Emulador/dispositivo
```

---

## 🚨 Atenção Final

**Seu app é de saúde.** Antes de ir a produção com usuários reais:

1. ✅ Testes de segurança (OWASP Top 10)
2. ✅ Testes de performance (latência < 200ms)
3. ✅ Backup automático (diário)
4. ✅ Monitoring 24/7 (Sentry + DataDog)
5. ✅ Suporte técnico (email respondendo)
6. ✅ Termos legais (advogado revisar)

---

## 🎯 Resultado Esperado (Dia 7)

```
✅ AquariOS v2.0.0 rodando em Android
✅ 3 personas (Roberto, Maria, Carlos) testadas
✅ 42 FAQs carregáveis via API
✅ Chat ProteOS respondendo contexto
✅ Journal + Nutrição persistindo dados
✅ APK pronto para Play Store
✅ Beta testers com acesso (Google Play closed testing)
✅ Crash monitoring ativo
```

---

**Pronto pra começar?** 🚀

Abra um terminal e rode:

```bash
cd aquarios-v2-complete
npm install --prefix backend
npm install --prefix mobile
cd backend && npm run dev
```

**Sucesso.** Vamos integrar o ser humano.

---

⚗ Fabiano Gomes Leite  
14 de Maio de 2026
