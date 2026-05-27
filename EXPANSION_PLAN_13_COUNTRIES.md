# AquariOS — Plano de Expansão Internacional
**13 Países/Regiões | Big Bang Launch | EcumenicOS Compatibility**
**Data:** 26 maio 2026 | **Status:** Planning

---

## 1. MAPA DOS 13 PAÍSES

| # | País/Região | Idioma(s) | Script | RTL | Religião Dominante |
|---|---|---|---|---|---|
| 1 | 🇧🇷 Brasil (home) | pt-BR | Latino | ❌ | Católica + Evangélica |
| 2 | 🇺🇸 EUA | en-US | Latino | ❌ | Pluralista |
| 3 | 🇮🇷 Iran | fa-IR (Farsi) | Árabe-Persa | ✅ | Islam Shia |
| 4 | 🇮🇱 Israel | he-IL (Hebraico) | Hebraico | ✅ | Judaísmo |
| 5 | 🇻🇪 Venezuela | es-VE | Latino | ❌ | Católica + Espiritismo |
| 6 | 🇵🇹 Portugal | pt-PT | Latino | ❌ | Católica |
| 7 | 🇹🇭 Tailândia | th-TH | Tailandês | ❌ | Budismo Theravada |
| 8 | 🇰🇷 Coreia do Sul | ko-KR | Hangul | ❌ | Pluralista |
| 9 | 🇸🇬 HK/Singapura | zh-HK + en-SG | CJK | ❌ | Pluralista |
| 10 | 🇳🇴 Noruega | nb-NO | Latino | ❌ | Luterana/Secular |
| 11 | 🇳🇬 Nigéria | en-NG | Latino | ❌ | Islam + Cristã + Tradicional |
| 12 | 🇨🇭 Suíça | de-CH + fr-CH | Latino | ❌ | Católica + Protestante |
| 13 | 🇵🇪 Peru | es-PE | Latino | ❌ | Católica + Andina |

---

## 2. MAPA REGULATÓRIO (Dados + Saúde)

### 🔴 TIER CRÍTICO

#### 🇮🇷 Iran
```
BLOQUEIOS:
- Google Play Store: BLOQUEADO pelo governo iraniano
- Alternativas: Cafe Bazaar, Myket, Sibapp (lojas locais)
- Pagamentos: Cartões internacionais BLOQUEADOS (sanções)
  → Alternativa: cryptocurrency, cartões locais (Shetab)
- Censura: VPN amplamente usado mas ilegal
- Conteúdo: Moderação religiosa obrigatória (FATA)
- Health data: Sob supervisão do Ministério da Saúde

IMPACTO NO APP:
⚠️  Precisa distribuir APK fora do Google Play
⚠️  Nenhum conteúdo que contrarie o Islã Shia oficial
⚠️  Sem mention de Baha'i (religião perseguida)
⚠️  Pagamentos: freemium forçado ou crypto
RECOMENDAÇÃO: Launch SEPARADO com APK side-loading
```

#### 🇻🇪 Venezuela
```
REGULAÇÃO: Lei de Responsabilidade Social + CONATEL
PAGAMENTOS: Hiperinflação (bolívar). Dolarização informal.
  → Stripe funciona parcialmente, Zelle popular
  → Precisa de pricing em USD
CENSURA: Moderada, alguns sites bloqueados
SAÚDE: Sem regulação específica de health data
GOOGLE PLAY: Acessível mas pagamentos complexos

IMPACTO NO APP:
⚠️  Pricing em USD (não em bolívares)
⚠️  Freemium agressivo (poder aquisitivo baixo)
✅  Sem bloqueio técnico de distribuição
```

---

### 🟡 TIER REGULATÓRIO MÉDIO

#### 🇺🇸 EUA
```
HIPAA: Se o app coletar "Protected Health Information" (PHI)
  → HygeiOS armazena dados de saúde = HIPAA territory
  → Obrigações: Business Associate Agreements, audit logs, encryption
  → Já temos: E2E encryption (S16) ✅, audit_logs ✅
CCPA/CPRA (California): Opt-out de venda de dados
  → Botão "Do Not Sell My Personal Information" obrigatório
FTC Health Breach Rule: Notificação em 60 dias em caso de breach
COPPA: Sem usuários menores de 13 anos → verificação de idade
```

#### 🇳🇬 Nigéria
```
NDPR 2019 + NDPA 2023: Similar ao GDPR
  → Data Protection Officer obrigatório para >2000 registros
  → Consentimento explícito para dados sensíveis de saúde
  → Localização de dados: recomendada mas não obrigatória
PAGAMENTOS: Flutterwave, Paystack (locais) + Stripe
GOOGLE PLAY: Acessível, pagamentos em NGN suportados
```

#### 🇮🇱 Israel
```
Privacy Protection Law (PPL) + Amendment 2023 (quasi-GDPR)
  → Registro de banco de dados com dados sensíveis: OBRIGATÓRIO
  → Dados de saúde = "sensitive data" → proteção especial
  → Privacy Impact Assessment para health apps
Calendário judaico: Shabbat (sexta-pôr do sol a sábado-noite)
  → Notificações push DESABILITADAS no Shabbat (boas práticas)
```

#### 🇹🇭 Tailândia
```
PDPA 2022 (Personal Data Protection Act): GDPR-equivalente
  → Consentimento explícito e granular
  → Dados de saúde = categoria especial
  → DPO obrigatório para processamento em larga escala
  → Multas: até 5M THB (~R$750k)
GOOGLE PLAY: Acessível, pagamentos em THB
```

#### 🇰🇷 Coreia do Sul
```
PIPA (Personal Information Protection Act): UM DOS MAIS RÍGIDOS DO MUNDO
  → Consentimento separado para CADA finalidade
  → Dados de saúde: consentimento adicional + armazenamento local
  → Localização de dados: fortemente recomendada na Coreia
  → KISA (regulador): multas severas
  → App Stores: Google Play + ONE Store (local)
PAGAMENTOS: Kakao Pay, Naver Pay populares
```

---

### 🟢 TIER GDPR (mais simples)

#### 🇵🇹 Portugal
```
GDPR + CNPD (autoridade local)
  → Já coberto por arquitetura S16
  → Dados de saúde: consentimento explícito + DPO
  → Idioma: pt-PT (diferente de pt-BR) obrigatório
✅  Sem bloqueio técnico
```

#### 🇳🇴 Noruega
```
GDPR (EEA member) + Datatilsynet
  → Idêntico ao GDPR EU
  → Transferência de dados: SCCs necessárias
✅  Sem bloqueio técnico
```

#### 🇨🇭 Suíça
```
nFADP 2023 (novo Federal Act on Data Protection): GDPR-like
  → Não é EU/EEA mas adequação reconhecida
  → 4 idiomas oficiais (de, fr, it, rm) → mínimo de/fr
✅  Sem bloqueio técnico
```

#### 🇸🇬 HK/Singapura
```
Singapore PDPA 2012 + amendamentos 2021
  → Notification + Consent + Purpose Limitation
  → Health data: Enhanced Obligation
  → Business-friendly, fácil compliance
Hong Kong: PDPO → similar ao PDPA SG
✅  Sem bloqueio técnico
```

#### 🇵🇪 Peru
```
Lei 29733 (Protección de Datos Personales)
  → GDPR-inspired mas menos estrita
  → Registro do banco de dados na ANPD: obrigatório
  → Dados de saúde: consentimento específico
✅  Sem bloqueio técnico
```

---

## 3. ANÁLISE EcumenicOS — COMPATIBILIDADE RELIGIOSA

> **Estado atual (S17):** 13 tradições confirmadas + 39 livros de referência aprovados.
> Migration `08_s17_ecumenicos.sql` pronta. Deploy pendente.

### 3.1 Matriz de Cobertura — 13 Tradições × 13 Países

As 13 tradições do EcumenicOS são:
`CAT` Catolicismo · `PRO` Protestantismo Luterano · `ISL` Islamismo · `JUD` Judaísmo · `HIN` Hinduísmo · `BUD` Budismo · `TAO` Taoísmo · `CON` Confucionismo · `CAN` Candomblé · `ZOR` Zoroastrismo · `XAM` Xamanismo Amazônico · `GNO` Gnosticismo · `ATE` Ateísmo/Secularismo

| País | Tradição Principal | Tradições Cobertas pelo Módulo | Score | Gaps a Criar |
|------|-------------------|-------------------------------|-------|--------------|
| 🇧🇷 Brasil | Catolicismo + Candomblé | CAT ✅ CAN ✅ XAM ✅ PRO ✅ ATE ✅ | **10/13** | Umbanda, Espiritismo Kardecista |
| 🇺🇸 EUA | Pluralista | PRO ✅ ATE ✅ JUD ✅ ISL ✅ BUD ✅ HIN ✅ GNO ✅ | **11/13** | New Age, Evangelical, Nativos |
| 🇮🇷 Iran | Islam Shia | ISL ✅ ZOR ✅ GNO ✅ | **5/13** | Sufismo Shia, Baha'i (⚠️ proibido) |
| 🇮🇱 Israel | Judaísmo | JUD ✅ GNO ✅ ATE ✅ ISL ✅ | **7/13** | Kabbalah, Hassidismo, Mussar |
| 🇻🇪 Venezuela | Catolicismo + Espiritismo | CAT ✅ CAN ✅ XAM ✅ GNO ✅ ATE ✅ | **8/13** | Maria Lionza, Yoruba caribenho |
| 🇵🇹 Portugal | Catolicismo | CAT ✅ PRO ✅ ATE ✅ JUD ✅ ISL ✅ | **9/13** | Sebastianismo, misticismo lusitano |
| 🇹🇭 Tailândia | Budismo Theravada (95%) | BUD ✅ HIN ✅ TAO ✅ CON ✅ | **7/13** | Theravada profundo, Wai Khru |
| 🇰🇷 Coreia do Sul | Pluralista | BUD ✅ CON ✅ CAT ✅ PRO ✅ ATE ✅ | **9/13** | Xamanismo coreano (Musok) |
| 🇸🇬 HK/Singapura | Taoísmo + Budismo + Pluralista | TAO ✅ BUD ✅ CON ✅ HIN ✅ ISL ✅ | **10/13** | — (cobertura excelente) |
| 🇳🇴 Noruega | Secular + Luterano | PRO ✅ ATE ✅ GNO ✅ | **6/13** | Asatru/Norse, Humanismo secular |
| 🇳🇬 Nigéria | Islam (Norte) + Cristão + Yoruba | ISL ✅ CAT ✅ PRO ✅ CAN ✅ ATE ✅ | **9/13** | Ifá aprofundado, Igbo, Hausa |
| 🇨🇭 Suíça | Secular + Cristão | CAT ✅ PRO ✅ ATE ✅ JUD ✅ GNO ✅ | **9/13** | Jung/Transpessoal, Reformed |
| 🇵🇪 Peru | Catolicismo + Andino | CAT ✅ XAM ✅ GNO ✅ ATE ✅ | **8/13** | Pachamama, Inkarrí, Andino |

### 3.2 Ranking de Compatibilidade Imediata (sem desenvolvimento extra)

| Rank | País | Score | Por quê é forte |
|------|------|-------|-----------------|
| 1 | 🇺🇸 EUA | 11/13 | Pluralismo amplo, todas as tradições têm público |
| 2 | 🇧🇷 Brasil | 10/13 | Home + Candomblé único diferencial |
| 3 | 🇸🇬 HK/Singapura | 10/13 | Taoísmo + Budismo + pluralismo asiático |
| 4 | 🇵🇹 Portugal | 9/13 | GDPR + Catolicismo + diáspora |
| 5 | 🇰🇷 Coreia do Sul | 9/13 | Pluralista + Budismo + Confucionismo |
| 6 | 🇨🇭 Suíça | 9/13 | Secular + Jung + pluralismo europeu |
| 7 | 🇳🇬 Nigéria | 9/13 | Candomblé conecta com Yoruba/Ifá |
| 8 | 🇻🇪 Venezuela | 8/13 | Maria Lionza é gap mas resto cobre |
| 9 | 🇵🇪 Peru | 8/13 | Xamanismo Amazônico é diferencial único |
| 10 | 🇮🇱 Israel | 7/13 | Gap crítico: Kabbalah não está na lista |
| 11 | 🇹🇭 Tailândia | 7/13 | Gap crítico: Theravada profundo falta |
| 12 | 🇳🇴 Noruega | 6/13 | Público secular-espiritual é nicho |
| 13 | 🇮🇷 Iran | 5/13 | Restrições políticas + gap Sufismo Shia |

### 3.3 Detalhamento crítico por país

#### 🇮🇷 Iran — Estratégia "Sufismo como ponte"
```
O que NÃO fazer:
- Mencionar Baha'i (religião perseguida)
- Conteúdo contrário ao Islam Shia oficial
- Misticismo ocidental explícito

O que FUNCIONA:
- Rumi (Jalāl ad-Dīn Rūmī) → poeta persa universal, aceito
- Hafez → também aceito culturalmente
- Sufismo como "dimensão interior do Islam"
- Filosofia islâmica (Avicena, Al-Ghazali)
- O "Quarto Caminho" de Gurdjieff tem raízes sufi → CONEXÃO VÁLIDA

EcumenicOS Iran = "Sabedoria do Oriente Médio" (frame seguro)
```

#### 🇮🇱 Israel — Estratégia "Kabbalah e Sabedoria Judaica"
```
O que NÃO fazer:
- Conteúdo anti-semita (óbvio)
- Cristologia explícita como superior ao Judaísmo
- Islamizar conteúdo sem contexto

O que FUNCIONA:
- Kabbalah (Árvore da Vida, Sefirot, Zohar)
- Hassidismo (histórias de Baal Shem Tov)
- Mussar (ética judaica)
- Shabbat integration (modo silencioso)
- Conexão com Quarto Caminho: Gurdjieff estudou tradições judaicas
- Calendário hebraico integrado ao app

EcumenicOS Israel = "Sabedoria da Tradição Hebraica" (frame respeitoso)
RTL obrigatório: Hebraico da direita para esquerda
```

#### 🇹🇭 Tailândia — Estratégia "Budismo como base"
```
95% da população é budista Theravada
O Budismo NÃO é uma "opção" — é o centro da cultura

O que ADICIONAR com profundidade:
- Vipassana (meditação de insight)
- Pali suttas (ensinamentos originais)
- Sangha, Dhamma, Buddha (3 joias)
- Ciclo do karma e renascimento
- Calendário budista tailandês (anos budistas: 2569)
- Wai Khru (reverência aos mestres)

O "Livro dos Mortos Tibetano" já existente = ponte Theravada/Tibetano
EcumenicOS Tailândia = OPORTUNIDADE ENORME — app muito raro no mercado thai
```

#### 🇳🇬 Nigéria — Estratégia "Ponte entre mundos"
```
Divisão geográfica: Norte = Islam | Sul = Cristão + Tradicional
Religiões tradicionais: Yoruba (Ifá, Orixás), Igbo (Chi), Hausa

O que FUNCIONA:
- Ifá/Orixás: conexão direta com Candomblé brasileiro (já no módulo)
- Islam Sunni (diferente do Shia iraniano) + Sufismo Qadiriyya
- Pentecostalismo (forte no sul)
- Ancestralidade como valor universal

O que EVITAR:
- Hierarquizar tradições (Islam vs Cristão = conflito real)
- Conteúdo que pareça "pagão" para públicos conservadores

EcumenicOS Nigéria = "Sabedoria Africana + Abraâmica" (frame unificador)
```

#### 🇵🇪 Peru — Estratégia "Espiritualidade das Américas"
```
Catolicismo (75%) + Tradições Andinas (muito vivas)
San Pedro, Ayahuasca, Pachamama = patrimônio espiritual ativo

O que FUNCIONA:
- Pachamama (Mãe Terra) — conexão com natureza
- Inkarrí (mitologia Inca)
- Apus (espíritos das montanhas)
- Curanderismo andino
- Festival Inti Raymi (solstício andino)
- Conexão com Amazônia (compartilhado com Brasil)

EcumenicOS Peru = MUITO RICO — espiritualidade indígena raramente representada
```

---

## 4. ARQUITETURA i18n — IMPLEMENTAÇÃO

### Stack Recomendada
```
react-i18next + expo-localization + i18next-resources-to-backend

Por quê:
- expo-localization: detecta idioma do dispositivo nativamente
- react-i18next: padrão da indústria, SSR-ready, lazy loading
- RTL: expo-router + I18nManager do React Native
```

### Estrutura de Arquivos
```
mobile/
  i18n/
    index.ts              ← inicialização i18next
    rtl.ts                ← detecta e aplica RTL
    locales/
      pt-BR.json          ← HOME (base)
      en-US.json
      fa-IR.json          ← Farsi RTL
      he-IL.json          ← Hebraico RTL
      es.json             ← Espanhol base (VE + PE)
      es-VE.json          ← overrides Venezuela
      es-PE.json          ← overrides Peru
      pt-PT.json          ← Português europeu
      th-TH.json          ← Tailandês
      ko-KR.json          ← Coreano
      zh-HK.json          ← Chinês Tradicional
      nb-NO.json          ← Norueguês
      en-NG.json          ← Inglês Nigeria
      de-CH.json          ← Alemão Suíço
      fr-CH.json          ← Francês Suíço
```

### Idiomas por Prioridade
| Idioma | Países | Prioridade | Complexidade |
|---|---|---|---|
| en-US | EUA, Nigéria, Singapura | 🔴 P1 | Baixa |
| pt-PT | Portugal | 🔴 P1 | Baixa (já temos pt-BR) |
| es | Venezuela + Peru | 🔴 P1 | Baixa |
| he-IL | Israel | 🟡 P2 | Alta (RTL + script) |
| fa-IR | Iran | 🟡 P2 | Alta (RTL + script) |
| ko-KR | Coreia do Sul | 🟡 P2 | Média |
| zh-HK | Hong Kong | 🟡 P2 | Média (CJK) |
| th-TH | Tailândia | 🟠 P3 | Alta (script próprio) |
| nb-NO | Noruega | 🟠 P3 | Baixa |
| de-CH | Suíça | 🟠 P3 | Baixa |
| fr-CH | Suíça | 🟠 P3 | Baixa |

### RTL — O que muda no layout
```typescript
// mobile/i18n/rtl.ts
import { I18nManager } from 'react-native';
import * as Localization from 'expo-localization';

const RTL_LOCALES = ['fa-IR', 'he-IL', 'ar'];

export function applyRTL(locale: string) {
  const isRTL = RTL_LOCALES.some(l => locale.startsWith(l));
  I18nManager.allowRTL(isRTL);
  I18nManager.forceRTL(isRTL);
}
```

---

## 5. ROADMAP DE EXPANSÃO (Big Bang)

### Clusters de Lançamento Simultâneo

#### Wave 1 — Dia 1 do Launch (Play Store)
```
🇧🇷 Brasil + 🇵🇹 Portugal + 🇻🇪 Venezuela + 🇵🇪 Peru
Razão: Português/Espanhol, sem bloqueio técnico, regulação simples
i18n: pt-BR ✅ já existe | pt-PT + es → 2-3 semanas de tradução
```

#### Wave 2 — Semana 2 do Launch
```
🇺🇸 EUA + 🇳🇴 Noruega + 🇨🇭 Suíça + 🇸🇬 HK/Singapura
Razão: Inglês base + GDPR-like compliance já coberto
i18n: en-US + nb-NO + de-CH/fr-CH + en-SG + zh-HK
Ação extra: CCPA opt-out button + HIPAA review
```

#### Wave 3 — Mês 2
```
🇰🇷 Coreia do Sul + 🇹🇭 Tailândia + 🇳🇬 Nigéria
Razão: Scripts não-latinos + compliance PIPA/PDPA
i18n: ko-KR + th-TH + en-NG
Ação extra: KISA registration (Coreia) + DPO designation
```

#### Wave 4 — Mês 3-4 (estratégia especial)
```
🇮🇱 Israel: RTL hebraico + Shabbat mode + PPL compliance
🇮🇷 Iran: APK side-loading + Cafe Bazaar + versão "Sufismo"
Razão: Máxima complexidade técnica + regulatória + cultural
```

---

## 6. RISCOS CRÍTICOS

| Risco | País | Impacto | Mitigação |
|---|---|---|---|
| Google Play bloqueado | 🇮🇷 Iran | 🔴 App inacessível | Cafe Bazaar + APK direto |
| PIPA violação | 🇰🇷 Coreia | 🔴 Multa + remoção | DPO + consentimento granular |
| Conteúdo religioso sensível | 🇮🇷 Iran + 🇳🇬 Nigéria | 🔴 Bloqueio/banimento | Curadoria por país |
| Pagamentos Iran | 🇮🇷 Iran | 🟠 Sem revenue | Freemium total ou crypto |
| RTL layout quebrado | 🇮🇱 Israel + 🇮🇷 Iran | 🟠 UX inutilizável | Testar antes do launch |
| HIPAA não-compliance | 🇺🇸 EUA | 🟠 Processo jurídico | BAA + audit logs (já temos) |
| Precificação Venezuela | 🇻🇪 Venezuela | 🟡 Revenue baixo | Preço em USD, freemium |

---

## 7. PRÓXIMOS PASSOS (S17+ implementação)

### Curto prazo (antes do Play Store)
```
1. Instalar: npm install react-i18next i18next expo-localization
2. Criar mobile/i18n/index.ts + estrutura de locales
3. Extrair strings hardcoded de TODAS as telas para pt-BR.json
4. Traduzir para en-US (Wave 1 mínimo viável)
5. Implementar RTL detection
```

### Médio prazo (pós-launch)
```
6. Contratar tradutores nativos (não Google Translate) para:
   - he-IL (Israel) — crítico para RTL
   - fa-IR (Iran) — crítico para RTL + contexto cultural
   - th-TH (Tailândia) — script complexo
   - ko-KR (Coreia) — PIPA compliance texts
7. EcumenicOS: adicionar módulos por região
8. Registrar DPO para Coreia + Tailândia + Nigéria
```

### Legal (paralelo)
```
9. Privacy Policy multilíngue por país
10. Terms of Service adaptados por jurisdição
11. HIPAA BAA template (para EUA)
12. Consultor jurídico local: Coreia, Tailândia, Israel
```

---

*Gerado em 26/05/2026 | AquariOS Expansion Planning*
