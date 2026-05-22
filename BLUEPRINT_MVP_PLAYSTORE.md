# 📋 BLUEPRINT MVP → PLAY STORE

**Status**: 🔄 TEMPLATE PARA PRÓXIMA SESSÃO  
**Data Criação**: 20 Maio 2026  
**Objetivo**: Roadmap claro: Phase 1 → Produção (com tradução + conformidade)

---

## 📍 ÍNDICE

1. **Pilar 1: Sistema Estável + Auditável** (Architecture)
2. **Pilar 2: Tradução + Conteúdo** (Localization)
3. **Pilar 3: Conformidade Regulatória** (Compliance)
4. **Play Store Submission Guide**
5. **Timeline & Milestones**

---

## 🏗️ PILAR 1: SISTEMA ESTÁVEL + AUDITÁVEL

### 1.1 Requisitos de Produção

**TO BE DEFINED IN NEXT SESSION:**

- [ ] SLA: Uptime % (99.5%? 99.9%?)
- [ ] RPO/RTO: Recovery objectives
- [ ] Latência P95: Target ms
- [ ] Throughput: Usuarios/minuto
- [ ] Storage: GB por usuário por mês

### 1.2 Monitoramento & Alertas

**TO BE DEFINED:**

```
□ Health checks (ping/status)
□ Error rate monitoring (Sentry/DataDog)
□ Performance metrics (latência, CPU, memória)
□ Database metrics (conexões, queries lentas)
□ API rate limiting
□ DDoS protection
```

### 1.3 Segurança

**TO BE DEFINED:**

```
□ SSL/TLS (HTTPS obrigatório)
□ JWT token rotation
□ CORS policy
□ SQL injection prevention
□ XSS protection
□ Rate limiting per IP
□ WAF (Web Application Firewall)
```

### 1.4 Auditoria

**TO BE DEFINED:**

```
□ Audit log (quem fez o quê, quando)
□ Data access logging
□ Configuration changes tracking
□ API call logging (anônimo)
□ Compliance logging (LGPD/GDPR)
```

### 1.5 Backup & Recovery

**TO BE DEFINED:**

```
□ Backup frequency (diário? horário?)
□ Backup location (múltiplas regiões?)
□ Recovery test (monthly?)
□ RTO target (1h? 4h?)
□ Data retention policy
```

---

## 🌍 PILAR 2: TRADUÇÃO + CONTEÚDO

### 2.1 Idiomas Suportados

**TO BE DEFINED:**

```
□ Português (Brasil) — PRIMARY
□ English (USA) — SECONDARY
□ Español (Mexico) — FUTURE
□ Français (France) — FUTURE
```

### 2.2 Conteúdo para Traduzir

#### Copy do App (UI/UX)
```
[ ] Menu principal (Início, Perfil, Configurações, etc)
[ ] Botões (Salvar, Cancelar, Enviar, etc)
[ ] Mensagens de erro (404, timeout, etc)
[ ] Placeholders (Digite seu nome, Email, etc)
[ ] Titles/Headers
```

#### Mensagens HygeiOS (IVI)
```
[ ] Status CRÍTICO ("Sua saúde mental está baixa...")
[ ] Status NORMAL ("Tudo bem com você...")
[ ] Status ÓTIMO ("Parabéns! Você está em ótima forma!")
[ ] Recomendações por status
[ ] Alertas (dose, hidratação, etc)
```

#### Sugestões ProteOS (Chat)
```
[ ] Contexto Brasil (referências culturais)
[ ] Contexto USA (idioma, exemplos)
[ ] Contexto México (gírias, expressões)
[ ] Frases de abertura (bom-dia, boa tarde, etc)
[ ] Respostas empáticas
```

#### Descrição App Store
```
[ ] Título (máx 50 chars)
[ ] Subtitle (máx 30 chars)
[ ] Description (máx 4000 chars)
[ ] Key features (bullet points)
[ ] Privacy policy link
[ ] Support email
```

#### Landing Page
```
[ ] Hero section
[ ] Features section
[ ] Benefits section
[ ] Testimonials
[ ] CTA (Call to Action)
[ ] FAQ
```

### 2.3 Estratégia de Tradução

**TO BE DEFINE:**

```
□ Machine translation (Google Translate) + human review?
□ Professional translator?
□ Community translation (crowdsourced)?
□ Native speaker validation per language?
□ Testing framework (translation QA)
```

### 2.4 Adaptação por Tradição

#### Linguagem de Notificações
```
[ ] Brazil: Informal, emojis liberais
[ ] USA: Formal, professional tone
[ ] Mexico: Warm, empathetic
```

#### Exemplos de Mentorias
```
[ ] Brazil: Cenários brasileiros (saúde do SUS, economia local)
[ ] USA: Cenários americanos (insurance, healthcare)
[ ] Mexico: Cenários mexicanos (segurança, educação)
```

#### Template de Grupos
```
[ ] Nomes de grupos localizados
[ ] Moderação guidelines por país
[ ] Horários de meetups (timezone-aware)
[ ] Moeda padrão por país
```

#### Cores/UI (Opcional)
```
[ ] Paleta de cores por mercado?
[ ] Ícones regionais?
[ ] Fontes localizadas?
```

---

## ⚖️ PILAR 3: CONFORMIDADE REGULATÓRIA

### 3.1 LGPD (Brasil)

**Status**: 🟡 PARCIAL (v2 tem estrutura)

```
[ ] Designar DPO (Data Protection Officer)
[ ] Consentimento explícito (checkbox)
[ ] Direito de acesso (endpoint GET /api/meu-dados)
[ ] Direito de portabilidade (export JSON)
[ ] Direito de exclusão (endpoint DELETE)
[ ] Breach notification protocol (48h)
[ ] Anonimização irreversível (já existe: handler_anonimizador)
[ ] Privacy policy em PT (traduzido)
[ ] Terms of Service em PT (traduzido)
[ ] Data residency (servidor Brasil?)
```

### 3.2 GDPR (Europa)

**Status**: 🔴 CRÍTICO (não feito)

```
[ ] Consentimento inicial (cookie consent banner)
[ ] DPIA (Data Protection Impact Assessment)
[ ] DPA assinado (Data Processing Agreement)
[ ] Direito ao esquecimento (Right to be forgotten)
[ ] Portabilidade de dados
[ ] Notificação de violação (72h)
[ ] Privacy policy em EN (traduzido)
[ ] Terms of Service em EN (traduzido)
[ ] Sub-processadores listados
```

### 3.3 Payment Compliance

**Status**: 🟡 PARCIAL

```
[ ] PCI DSS (credit card handling)
   □ Usar Stripe (não armazenar cards)
   □ Usar MercadoPago (Brasil)
   □ Usar Wise (transferências)
   □ Não armazenar full CC numbers
   □ Tokenização (Stripe tokens)

[ ] Regional payment methods
   □ PIX (Brasil)
   □ Boleto (Brasil)
   □ Credit card (global)
   □ Bank transfer (global)

[ ] Anti-money laundering (AML)
   □ KYC (Know Your Customer)
   □ Transaction monitoring
   □ Suspicious activity reporting

[ ] Refund policy
   □ Timeframe (7 dias? 30 dias?)
   □ Process automation
   □ Documentation
```

### 3.4 Privacy Policy Template

**Status**: 🔴 CRÍTICO (não feito)

Incluir seções:
```
[ ] 1. Controller & DPO contact
[ ] 2. Data collected
[ ] 3. Legal basis for processing
[ ] 4. Retention periods
[ ] 5. Rights of data subjects
[ ] 6. Cookies & tracking
[ ] 7. Third-party sharing
[ ] 8. International transfers
[ ] 9. Security measures
[ ] 10. Changes to policy
[ ] 11. Contact procedure
```

### 3.5 Terms of Service

**Status**: 🔴 CRÍTICO (não feito)

Incluir seções:
```
[ ] 1. Acceptance of terms
[ ] 2. User eligibility
[ ] 3. User responsibilities
[ ] 4. Intellectual property
[ ] 5. Limitation of liability
[ ] 6. Indemnification
[ ] 7. Governing law
[ ] 8. Dispute resolution
[ ] 9. Termination
[ ] 10. Severability
```

### 3.6 Insurance & Liability

**Status**: 🔴 TODO

```
[ ] Product liability insurance
   □ Coverage limit (1M? 5M?)
   □ Medical malpractice exclusion?
   □ Cyber liability?

[ ] Professional indemnity
[ ] Errors & omissions

[ ] Disclaimer (saúde)
   □ "Não substitui consultório médico"
   □ "Não diagnosticamos doenças"
   □ "Procure profissional qualificado"
```

### 3.7 Data Residency

**TO BE DEFINED:**

```
[ ] Brasil: Dados dos usuários BR ficam em servidor BR?
[ ] USA: Dados dos usuários USA ficam em AWS US?
[ ] EU: Dados EU ficam em servidor EU (GDPR)?
[ ] Implicações de custo/latência
```

---

## 🎮 PLAY STORE SUBMISSION GUIDE

### Step 1: App Signing
```bash
# Gerar chave privada
keytool -genkey -v -keystore aquarios-release.keystore \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias aquarios-key

# Build signed APK
gradle build --release -Dorg.gradle.java.home=/path/to/java
```

### Step 2: Prepare Store Listing
```
[ ] App name (50 chars max)
[ ] Short description (80 chars max)
[ ] Full description (4000 chars)
[ ] Screenshots (1/5 required, 8 max)
[ ] Feature graphic (1024×500 px)
[ ] Privacy policy URL
[ ] Permissions justification
```

### Step 3: Content Rating Questionnaire
```
[ ] Violência?
[ ] Conteúdo sexual?
[ ] Drogas/álcool?
[ ] Linguagem imprópria?
[ ] Dados financeiros?
[ ] Dados pessoais?
```

### Step 4: Target Audience & Content
```
[ ] Age rating (3+, 7+, 12+, 16+, 18+)
[ ] Target countries (Brasil, USA, etc)
[ ] Languages (PT, EN, ES)
```

### Step 5: Pricing & Distribution
```
[ ] Free or paid?
[ ] Beta testing (internal, closed, open)
[ ] Staged rollout (10%, 50%, 100%)
[ ] Scheduling release date
```

### Step 6: Submit for Review
```
[ ] Google Play review (~24-48h)
[ ] Compliance check
[ ] Security check
[ ] Approval or rejection
```

---

## 📅 TIMELINE & MILESTONES

### Week 1 (This Week)
- [ ] Phase 1 deployment ✅
- [ ] v4.2 running locally ✅

### Week 2 (Next Week)
- [ ] Load testing (10+ users)
- [ ] Translation framework
- [ ] LGPD baseline docs

### Week 3-4 (Fortnight)
- [ ] PT/EN translations complete
- [ ] Privacy policy + ToS
- [ ] Payment compliance

### Week 5-6 (Month 2)
- [ ] Build signed APK
- [ ] App Store listing
- [ ] Beta testing (100 users)

### Week 7-8 (Month 2.5)
- [ ] Store submission
- [ ] Review & approval
- [ ] Play Store launch 🎉

---

## 📊 SUMMARY TABLE

| Item | Status | Priority | Week |
|---|---|---|---|
| Phase 1 Deployment | ✅ Done | — | 1 |
| System Architecture | 🔴 TODO | 🔴 CRITICAL | 2 |
| LGPD Compliance | 🟡 Partial | 🔴 CRITICAL | 3-4 |
| GDPR Compliance | 🔴 TODO | 🟡 HIGH | 5-6 |
| PT Translation | 🔴 TODO | 🔴 CRITICAL | 2-3 |
| EN Translation | 🔴 TODO | 🟡 HIGH | 3-4 |
| Payment Setup | 🟡 Partial | 🔴 CRITICAL | 4-5 |
| App Store Build | 🔴 TODO | 🟡 HIGH | 5 |
| Beta Testing | 🔴 TODO | 🟡 HIGH | 6 |
| Play Store Launch | 🔴 TODO | 🔴 CRITICAL | 7-8 |

---

## 🎯 SUCCESS CRITERIA

App é considerado "pronto para Play Store" quando:

```
✅ Phase 1 passes all tests
✅ System uptime ≥99.5% para 48h contínuos
✅ LGPD compliance checklist 100%
✅ GDPR compliance checklist ≥80%
✅ PT + EN translations 100%
✅ Privacy policy + ToS approved by legal
✅ Payment processing tested e funcional
✅ Beta tested com ≥100 users
✅ App Store listing aprovado
✅ Google Play review passed
```

---

**🔄 PRÓXIMA SESSÃO:**
1. Expandir cada seção (detalhes práticos)
2. Criar arquivos específicos por pilar
3. Definir timeline exato
4. Começar implementação Week 2

**Tempo estimado**: 90 minutos para complete blueprint  
**Esperado output**: 5+ arquivos + roadmap claro

🌊 Pronto para sair da água e caminhar na terra firme! 🚀
