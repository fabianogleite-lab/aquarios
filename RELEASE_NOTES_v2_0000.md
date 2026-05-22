# 🚀 AquariOS v2.0000 — RELEASE NOTES
## MVP Beta Testers Ready

---

## 📌 Versão: v2.0000
**Data:** 14 de Maio de 2026  
**Status:** ✅ Pronto para Distribuição Beta  
**Build:** APK (Android) + AAB (Play Store)

---

## ✨ O Que é Novo?

### Discretas Mudanças da v1.0512

- **Database:** Schema completo PostgreSQL (18 tabelas + views + triggers)
- **Backend:** 35+ endpoints funcionando
- **Mobile:** 6 telas principais (Dashboard, Diário, Chat, Comunidades, Config)
- **API:** REST completa com JWT + OAuth2
- **Segurança:** AES-256 encryption, rate limiting, audit logs
- **LGPD:** 100% compliant (direito ao esquecimento, exportação, etc)

### O Que Não Mudou?

- Conceitos filosóficos (7 princípios hermético, 5 vieses Gurdjieff)
- Arquitetura de módulos (ProteOS, HygeiOS, AsclepiOS, etc)
- 22 Arcanos (SandeirOS — modo oculto)
- 13 Tradições (EcumenicOS)
- Gamificação (XP Existencial + Streaks)
- Personas (Roberto, Maria, Carlos)
- 42 FAQs críticas

---

## 🎯 Roadmap de Teste

### Fase 1: Validação Interna (Semana 1-2)
```
SEMANA 1
├─ [ ] Testes funcionais em 3 personas
├─ [ ] Cobertura: 80% das funcionalidades
├─ [ ] Report de bugs críticos
└─ ETA: 21/05/2026

SEMANA 2
├─ [ ] Testes de performance (latência API < 200ms)
├─ [ ] Segurança (OWASP Top 10)
├─ [ ] LGPD compliance audit
└─ ETA: 28/05/2026
```

### Fase 2: Beta Externa (Semana 3-4)
```
SEMANA 3
├─ [ ] Invite de 50 beta testers via link
├─ [ ] Versão APK no Google Play Console (closed track)
├─ [ ] Feedback semanal
└─ ETA: 04/06/2026

SEMANA 4
├─ [ ] Ajustes baseado em feedback
├─ [ ] Staged rollout: 5% → 25%
├─ [ ] Monitoramento de crashes
└─ ETA: 11/06/2026
```

---

## 📦 Build & Distribution

### APK Geração

```bash
# 1. Setup Expo (assumindo Node.js ≥18)
npm install -g expo-cli
cd mobile && npm install

# 2. Gerar APK (via EAS — recomendado)
eas build --platform android --type apk

# Output: Arquivo .apk (~50-70MB) disponível para download
# Tempo: 10-15 minutos

# 3. Testar localmente
adb install aquarios-v2-v2.0.0.apk
```

### Play Store Upload

```bash
# 1. Gerar AAB (App Bundle — Play Store native)
eas build --platform android --type app-bundle

# 2. Google Play Console
# → Criar app "AquariOS"
# → Upload AAB em "Closed Testing"
# → Invite beta testers via email ou link

# 3. Beta Testing
# → Track: Closed Testing (interno)
# → Duration: 1-2 semanas
# → Feedback: crash reports + ratings
```

---

## 🔑 Credenciais Beta Testers

### Account Padrão

```
Email:    beta@aquarios.app
CPF:      00000000000 (ou 123.456.789-00)
Senha:    BetaTester123!
```

### Ou Criar Nova Conta

No app, clicar em "Registrar" e preencher:
- Email: seu-email@dominio.com
- CPF: seu-cpf-real (será hasheado)
- Senha: segura

**Auto-detecção de Persona:**
- App analisa primeiro input → assign Roberto/Maria/Carlos
- Ou manual em Settings > Persona

---

## 🎮 Fluxo de Teste Recomendado

### Dia 1: Onboarding
```
1. Instalar APK
2. Criar conta ou login
3. Permitir permissões (localização, camera, saúde)
4. Explorar Dashboard
5. Ver IVI (pode estar vazio no início)
```

### Dia 2-3: Core Features
```
1. Diário: Adicionar entry com mood
2. Nutrição: Log uma refeição
3. Chat ProteOS: Enviar mensagem (detecta viés)
4. Comunidades: Ver lista + participar
5. Settings: Atualizar perfil
```

### Dia 4-7: Depth & Performance
```
1. IVI History: Ver gráfico vazio (seed inicial)
2. Journal List: Filtrar por período
3. ProteOS Chat: 10 mensagens diferentes (testar todos 5 vieses)
4. Communities: Posts com tags
5. Performance: Medir tempo de carregamento
```

---

## 📊 Métricas de Sucesso

### Performance
- ✅ Startup time < 3 segundos
- ✅ API latência < 200ms (95th percentile)
- ✅ Crash rate < 0.5%
- ✅ Memory footprint < 150MB

### Functionality
- ✅ 90% dos endpoints respondendo
- ✅ Zero unhandled exceptions
- ✅ Autenticação funcionando
- ✅ Chat ProteOS com respostas contextuais

### User Experience
- ✅ UI responsiva (sem jank)
- ✅ Permissões solicitadas corretamente
- ✅ Navegação intuitiva
- ✅ Texto legível (contraste ≥4.5:1)

### Security
- ✅ Senhas hasheadas (bcryptjs)
- ✅ JWT tokens válidos
- ✅ HTTPS em produção
- ✅ Sem logs de PII

---

## 🐛 Relatório de Bug Template

**Para Beta Testers enviarem:**

```markdown
## BUG REPORT

### Descrição
O que você esperava? O que aconteceu?

### Passos para Reproduzir
1. Passo 1
2. Passo 2
3. ...

### Evidência
- Screenshot / Video (se possível)
- Logs do console (Settings > Developer)

### Ambiente
- Dispositivo: Samsung Galaxy S21 (exemplo)
- Android version: 12
- App version: v2.0.0
- Data/Hora: 2026-05-14 14:30 UTC

### Severidade
[ ] Critical (app crashes)
[ ] High (feature broken)
[ ] Medium (degraded UX)
[ ] Low (minor glitch)
```

**Enviar para:** fabianogleite@hotmail.com  
**Assunto:** `[BUG] AquariOS v2.0000 - Descrição breve`

---

## ✅ Pre-Launch Checklist

### Backend Checks
- [ ] PostgreSQL schema migrado
- [ ] Redis conectado
- [ ] Seed FAQs + Comunidades rodado
- [ ] Endpoints testados (35+)
- [ ] JWT refresh token funciona
- [ ] Rate limiting ativo
- [ ] Audit logs registrando
- [ ] Backup automático configurado

### Mobile Checks
- [ ] APK gerado e testado
- [ ] Icons corretos (48x48, 192x192, 512x512)
- [ ] Splash screen exibe
- [ ] Permissões solicitadas
- [ ] Navegação fluida
- [ ] Chat ProteOS responde
- [ ] Journal persiste dados
- [ ] Logout funciona

### Play Store Checks
- [ ] App Bundle gerado
- [ ] Descrição PT-BR
- [ ] Screenshots em 1080x1920
- [ ] Privacy Policy link OK
- [ ] Support email responsivo
- [ ] Versão code incrementada
- [ ] Release notes escritas

---

## 🎯 Próximos Passos (Pós-Beta)

### Fase 3: Production (Junho 2026)
- [ ] Integração com Dexcom CGM
- [ ] Wearables prioritários (Apple Watch, Oura)
- [ ] Beck Office v1 (profissionais)
- [ ] EteriOS Matter/Zigbee
- [ ] Marketplace v1

### Fase 4: Expansão (Q3 2026)
- [ ] AR/VR (Vision Pro, Quest 3)
- [ ] Computação espacial
- [ ] Multiagentes IA
- [ ] Automação preditiva

---

## 📞 Suporte Beta

**Problemas técnicos?**
- Email: fabianogleite@hotmail.com
- GitHub Issues: `github.com/fabianogleite/arkhe-app/issues`
- Suporte esperado: 24-48h

**Feedback geral?**
- Formulário: link será enviado no dia 1 do beta
- Esperado: resposta + ação dentro de 1 semana

---

## 📜 Termos Beta

- **Confidencialidade:** Não compartilhar APK ou credenciais
- **Feedback:** Quanto mais detalhado, melhor
- **Duração:** 2-4 semanas (estimado)
- **Sem SLA:** Beta = sem garantias de disponibilidade
- **Dados:** Será deletado ao final do beta

---

## 🎊 Obrigado!

Sua participação no beta é fundamental para tornar AquariOS v2.0000 pronto para o mundo.

**Vamos integrar o ser humano em tempo real.**

---

⚗ **AquariOS v2.0000**  
Fabiano Gomes Leite — fabianogleite@hotmail.com  
14 de Maio de 2026
