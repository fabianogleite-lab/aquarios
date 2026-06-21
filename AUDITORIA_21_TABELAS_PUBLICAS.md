# AUDITORIA: 21 TABELAS PÚBLICAS (ANON READ) — CLASSIFICAÇÃO DE RISCO

**Data:** 21/Jun/2026  
**Escopo:** Sonda REST live em 12/Jun + inspeção conteúdo 21/Jun  
**Anon Key:** `sb_publishable_ZGPfiFo6dBXgnyi4Xq_UYw_7o8R4Kob` (extraível do APK)  
**Baseline:** feedback_sites_pro_template.md — "páginas públicas NUNCA expõem IP, código HVP, DRE real, SAFE/IPO, schema DB"

---

## RESUMO EXECUTIVO

| Status | Qtde | Ação | Urgência |
|--------|------|------|----------|
| 🟢 PÚBLICO legítimo | 6 | Manter como está | Nenhuma |
| 🟡 AMBÍGUO (negócio decide) | 7 | Aguardar decisão | Média |
| 🔴 SENSÍVEL (fix imediato) | 8 | Aplicar RLS | ALTA |

---

## TABELAS CLASSIFICADAS

### 🟢 PÚBLICO LEGÍTIMO (manter como está)

#### 1. `personas` (6 linhas)
- **Conteúdo:** 3 personas fase 1 (Zé/Maria/Carlos) + 3 fase 2 (Lucas/Fernanda/Zé das Bets)
- **Uso no app:** Comunitário (faces visíveis para usuários)
- **Risco:** BAIXO
- **Policy:** `Anyone can read personas` ✅
- **Recomendação:** ✅ PÚBLICO OK — manter
- **Por quê:** Personas são faces públicas; usuários veem elas em comunidades

#### 2. `panaceia_pack_manual_definition` (4 linhas)
- **Conteúdo:** 4 packs de tokens (Starter/Basic/Pro/Elite) — preços em centavos BRL
- **Uso no app:** Marketplace público — usuários veem opções de compra
- **Risco:** BAIXO
- **Policy:** Sem policy explícita; tabela vazia ou RLS desabilitada
- **Recomendação:** ✅ PÚBLICO OK — manter (preços são públicos)
- **Por quê:** Catálogo de oferta; usuário precisa ver pra decidir comprar

#### 3. `plans` (6 linhas)
- **Conteúdo:** 6 planos (Free Anônimo, Free Comunidade, Starter, Premium, Professional, B2B) com tier_order, trial_days, IVI visibility
- **Uso no app:** Onboarding + pricing — usuário vê planos antes de login
- **Risco:** BAIXO
- **Policy:** `Anyone can read plans` ✅
- **Recomendação:** ✅ PÚBLICO OK — manter
- **Por quê:** Estrutura de planos é parte da proposta de valor pública

#### 4. `aquarios_modules` (16 linhas)
- **Conteúdo:** Catálogo de 16 módulos (Comunidades, Diário, HygeiOS, ProteOS, etc.) com status, descrição, icon
- **Uso no app:** Dashboard home (`mobile/app/(app)/index.tsx:123`) — anon lê para saber quais módulos estão "built" vs "coming_soon"
- **Risco:** BAIXO
- **Policy:** `Anyone can read modules` ✅
- **Recomendação:** ✅ PÚBLICO OK — manter
- **Por quê:** Dashboard precisa renderizar módulos. Feature flag legítima; usuário vê iterativamente.

#### 5. `panaceia_offering_categories` (9 linhas)
- **Conteúdo:** 9 categorias marketplace (mentorias, terapias, grupos pagos, cursos, wearables, suplementos, sensores IoT, financeiro, protocolos)
- **Uso no app:** Marketplace — usuário navega categorias antes de comprar
- **Risco:** BAIXO
- **Policy:** `Anyone can read offering_categories` ✅
- **Recomendação:** ✅ PÚBLICO OK — manter
- **Por quê:** Catálogo público; não expõe dados sensíveis (só nomes/descrições)

#### 6. `evolution_levels` (7 linhas)
- **Conteúdo:** 7 níveis de gamificação XP (Semente→Raiz→Tronco→Galho→Flor→Fruto→Mestre) com thresholds, descrição, unlocks
- **Uso no app:** Leaderboard + achievements — usuário vê seu nível e próximo objetivo
- **Risco:** BAIXO
- **Policy:** `Anyone can read evolution_levels` ✅
- **Recomendação:** ✅ PÚBLICO OK — manter
- **Por quê:** Gamificação é pública; usuário precisa saber que "Semente=0 XP, Raiz=100 XP" pra motivar

---

### 🟡 AMBÍGUO (negócio decide)

#### 7. `panaceia_offerings` (6 linhas)
- **Conteúdo:** 6 offerings (Mentorias, Terapias, Grupos, Cursos, Wearables, Suplementos) com revenue_share_creator (70%), revenue_share_arkhe (30%), is_active=false
- **Sensibilidade:** **MÉDIA** — expõe percentuais de split financeiro (70/30) publicamente
- **Risco:** Concorrente vê estrutura de split; pode ser interpretado como "captação irregular" se publicado como comunicação de investimento
- **Uso no app:** Marketplace — usuário vê ofertas antes de comprar (legítimo)
- **Policy:** `Anyone can read offerings` ✅
- **Current status:** Todas com `is_active=false` (marketplace ainda em coming_soon)
- **Recomendação:** ❓ **DECISÃO DE NEGÓCIO**
  - Manter ANON se: marketplace é realmente público (usuários antes de login veem opções)
  - Restringir AUTH-ONLY se: % de split é secreto de negócio (não expor estrutura financeira)
- **Recomendação técnica:** AMBÍGUO — fica a critério do founder

#### 8. `ecumenic_references` (39 linhas)
- **Conteúdo:** 39 referências (3 por tradição × 13 tradições: Bíblia, Alcorão, Tao Te Ching, Bhagavad Gita, etc.)
- **Sensibilidade:** **BAIXA** — são obras publicadas, Qualis A1/A2, autores conhecidos
- **Risco:** NENHUM — não é segredo industrial
- **Uso no app:** EcumenicOS — usuário lê textos (público por design)
- **Policy:** `Anyone can read ecumenic_references` ✅
- **Recomendação:** ✅ **PÚBLICO OK** — é literalmente biblioteca ecumênica
- **Por quê:** Fondação cultural do projeto; design intencional expor

#### 9. `ecumenic_traditions` (13 tradições, não listada entre 21 mas relacionada)
- **Status:** Bloqueada no probe (sem rota ou RLS desabilitada)
- **Observação:** Não está entre as 21 públicas, mas tem colunas ocultas (`oracle_modern`, `oracle_label`) que Migration 23 já fixa
- **Skip:** Não fazer mudanças (já tem fix pendente)

#### 10. `aquarios_eixo_distribution` (46 linhas)
- **Conteúdo:** 46 eixos de funcionalidade distribuídos (social, token, experiência, dados, IA, util) com arcana_revealed, target_module, implementation_status
- **Sensibilidade:** **BAIXA-MÉDIA** — é um mapa de roadmap futuro (features planejadas, estágio de implementação)
- **Risco:** MÉDIO — concorrente vê que há "DAO governance", "yield farming", "staking", "data marketplace" planejados; pode informar roadmap rival
- **Uso no app:** Documentação (docs/44_EIXOS_DISTRIBUTION_MAP.md) — não há consumidor em runtime
- **Policy:** `Anyone can read eixo_distribution` ✅
- **Recomendation:** ❓ **DECISÃO DE NEGÓCIO**
  - Manter ANON se: roadmap é parte da transparência pública (hype para comunidade)
  - Restringir AUTH-ONLY se: features futuras são secreto competitivo
- **Recomendação técnica:** AMBÍGUO — moderadamente sensível; fica a critério do founder

#### 11. `panaceia_offerings` (descrição acima — duplicado de #7)

---

### 🔴 SENSÍVEL — FIX IMEDIATO RECOMENDADO

#### 12. `arkhe_holding` (1 linha) 🚨 CRÍTICO
- **Conteúdo:**
  ```json
  {
    "legal_name": "ARKHE — Ecossistema · AquariOS Infrastructure",
    "is_legal_entity": true,
    "author_cpf": "52136388649",  // ← CPF REAL DO FUNDADOR
    "author_name": "Fabiano Gomes Leite",
    "founder_birth": "1968-06-19",
    "founder_locale": "pt-BR",
    "protection_laws": ["Lei 9.610/1998", "Convenção de Berna", ...]
  }
  ```
- **Risco:** CRÍTICO
  - ✅ Expõe CPF real do fundador (PII)
  - ✅ Expõe data de nascimento (PII)
  - ✅ Expõe estrutura de holding (estratégia corporativa)
- **Compliance:** Viola LGPD art. 5 (dado pessoal), LGPD art. 13 (transparência requerida só em acesso autorizado)
- **Uso no app:** NENHUM (só docs)
- **Policy:** `Anyone can read arkhe_holding` ✅
- **Fix pending:** ❌ Nenhuma migration fixa ainda
- **Recomendação:** 🚨 **APLICAR RLS IMEDIATAMENTE**
  - Remover policy de anon read
  - Criar policy `authenticated_read` (usuários logados podem ler estrutura — não há segredo corporativo real, é só branding)
  - OU service_role-only se segredo

#### 13. `intellectual_property_registry` (30 linhas) 🚨 CRÍTICO
- **Conteúdo:**
  - Item 1: Holding + AquariOS infrastructure
  - Items 2-10: Nomes e arquitetura de módulos (ProteOS, SandeirOS, AsclepiOS, EteriOS, HermeOS, EcumenicOS, CerberOS, Beck Office)
  - Items 11-22: XP system, personasm, AlexandriOS, KB Foundation, etc.
  - Items 23-30: Pilar 2 (Psicologia Social), 130 personas, etc.
  - **Cada linha:** `author_cpf="52136388649"` ← **CPF EXPOSTO 30 VEZES**
  - **Code anchors:** Apontam direto pra código-fonte (migrations, ficheiros, funções)
- **Risco:** CRÍTICO
  - ✅ Expõe CPF do fundador 30 vezes
  - ✅ Documenta arquitetura completa (nomes de agentes, módulos, algoritmos, _code anchors_)
  - ✅ Expõe lista de decisões arquiteturais (item_number, title, description, implementation_status)
  - ❌ Viola feedback_sites_pro_template: "NUNCA expõe... código... schema DB... arquitetura técnica"
- **Uso no app:** Documentação interna (COMPARATIVE_MANUAL_VS_DEVPACK.md referencia) — NÃO há consumidor em runtime
- **Policy:** `Anyone can read ip_registry` (implícito via RLS geral)
- **Fix pending:** ❌ Nenhuma migration fixa ainda
- **Recomendation:** 🚨 **APLICAR RLS IMEDIATAMENTE**
  - Opção A: service_role-only (totalmente oculta)
  - Opção B: authenticated + owner filter (usuário vê só itens atribuídos a si mesmo — impractical aqui)
  - Recomendação técnica: **service_role-only** (é registro interno de IP; não há motivo para usuário ler)

#### 14. `aquarios_constitution` (20 linhas) 🚨 CRÍTICO
- **Conteúdo:**
  - 10 linhas pillar='sandeiros' com `is_public=false` (os 7 princípios estruturais e as fontes basais)
  - 10 linhas pillar='psicologia_social' com `is_public=true` (Vigotski, Foucault, Freire, etc.)
- **Risco:** CRÍTICO
  - ✅ Expõe os 7 princípios estruturais (segredo de design, nunca deve ser visto pelo usuário per design intent)
  - ❌ A coluna `is_public=false` é **ignorada** pela policy `Anyone can read constitution`
  - Policy atualmente usa `USING (true)` — faz leitura não-discriminatória
- **Compliance:** Viola princípio de design: "oracle_modern + oracle_label NUNCA expostos como label"; esses princípios estruturais são equivalentes (oculto)
- **Uso no app:** NENHUM em runtime (SandeirOS usa as leis como constantes no código, não lê da tabela)
- **Policy:** `Anyone can read constitution` ✅ (linha 84, migration 10)
- **Fix pending:** ✅ **Migration 23 JÁ FIXA ISTO** (06/Jun) — muda policy pra `USING (is_public IS TRUE)`
  - Migration 23 ainda NÃO foi aplicada em produção
  - Comando: `DROP POLICY IF EXISTS "Anyone can read constitution"...` + `CREATE POLICY ... USING (is_public IS TRUE)`
- **Recomendation:** ✅ **APLICAR MIGRATION 23** (já existe, só precisa rodar)

#### 15. `aquarios_decisions` (18 linhas) 🟡 SENSÍVEL
- **Conteúdo:** Decisões arquiteturais (D-01 a D-38) com rationale, chosen_option, decisor, implementation_phase
- **Exemplos:**
  - "D-01: Híbrido: integrador + financeiro" / "Manual confirma financeiro. Híbrido amplia escopo"
  - "D-04: Manter como branding (não criar módulo)" / "Manual V1.0512 §03: ARKHE é holding, não módulo"
  - "D-38: IVI 4D vs 3D" / rationale com detalhes de fórmula
- **Sensibilidade:** **MÉDIA** — não é segredo (está no git history, visible em PR reviews), MAS é design thinking interno
- **Risco:** MÉDIO
  - ✅ Concorrente vê decisões não-tomadas ("why NOT X?"), pode informar estratégia
  - ✅ Expõe divergências internas (útil pra engenharia reversa)
  - ❌ Não é PII, não é código secreto, não é financeiro
- **Uso no app:** Documentação (AUDIT_MATRIX_DEVPACK_V4.md referencia) — NÃO há consumidor em runtime
- **Policy:** `Anyone can read decisions` ✅
- **Fix pending:** ❌ Nenhuma
- **Recomendation:** ❓ **DECISÃO DE NEGÓCIO**
  - Manter ANON se: transparência radical (comunidade vê pensamento)
  - Restringir AUTH-ONLY se: decisões são secreto competitivo
- **Recomendação técnica:** **Moderadamente sensível** — criar policy `authenticated_read` é prudente

#### 16. `aquarios_divergencias` (18 linhas) 🟡 SENSÍVEL
- **Conteúdo:** Similar a decisions — divergências entre DEVPACK v4, Manual, e realidade
- **Exemplos:**
  - "D-01: HermeOS — financeiro vs dashboard" / "devpack errado, Manual = financeiro"
  - "D-09: 44 eixos DataCommunity — distribuição" / "Devpack errado, distribuir nos 8 módulos"
- **Sensibilidade:** **BAIXA-MÉDIA** — é pensamento arquitetural, não secreto industrial
- **Risco:** BAIXO-MÉDIO
  - Exposição similar a `aquarios_decisions`
  - Mostra conflitos (ex-ante design), não segredo (post-facto)
- **Uso no app:** Documentação (mobile/data/divergencias.ts com copyleft local dos dados, não lê da Supabase)
- **Policy:** `Anyone can read divergencias` ✅
- **Fix pending:** ❌ Nenhuma
- **Recomendation:** ❓ **DECISÃO DE NEGÓCIO** (similar a #15)
- **Recomendação técnica:** Moderadamente sensível; considerar `authenticated_read`

#### 17. `aquarios_architecture` (4 linhas) 🚨 CRÍTICO
- **Conteúdo:**
  ```json
  [
    {
      "layer": "holding",
      "name": "ARKHE",
      "description": "Holding legal e proprietária intelectual de todo o ecossistema",
      "is_legal_entity": true,
      "manual_reference": "V1.0512 §03"
    },
    {
      "layer": "product_b2c",
      "name": "AquariOS",
      "description": "Sistema Operacional do Ser Humano",
      "parent_layer": "ARKHE"
    },
    {
      "layer": "product_b2b",
      "name": "Beck Office",
      "description": "Plataforma B2B para profissionais de saúde — matching por IVI",
      "parent_layer": "ARKHE"
    },
    {
      "layer": "infrastructure",
      "name": "HygeiOS+IVI",
      "description": "Núcleo analítico com filosofia encapsulada",
      "parent_layer": "AquariOS"
    }
  ]
  ```
- **Risco:** CRÍTICO
  - ✅ Expõe estratégia de holding (ARKHE > AquariOS + Beck Office)
  - ✅ Expõe segmentação B2C vs B2B
  - ✅ Expõe que HygeiOS é "núcleo analítico invisível ao usuário" (!)
  - ❌ Viola feedback_sites_pro_template: "NUNCA expõe... arquitetura técnica... schema"
- **Compliance:** Não é PII/sensível-legal, MAS é stratégia competitiva interna
- **Uso no app:** Documentação (COMPARATIVE_MANUAL_VS_DEVPACK.md) — NÃO há consumidor em runtime
- **Policy:** `Anyone can read architecture` ✅
- **Fix pending:** ❌ Nenhuma
- **Recomendation:** 🚨 **APLICAR RLS**
  - Opção A: service_role-only (totalmente oculta; usuário não precisa ler estratégia de holding)
  - Opção B: authenticated (usuário logado vê; menos secreto)
- **Recomendação técnica:** **service_role-only** (é organização interna; usuário não precisa saber)

#### 18. `kb_foundation` (12 linhas) 🟡 SENSÍVEL
- **Conteúdo:** 12 referências acadêmicas com Qualis levels
  - 7 livros filosóficos/canônicos (fontes basais, etc.) — Qualis A1
  - 5 livros de psicologia social (Freire, Foucault, Almeida, Butler, Han) — Qualis A1/A2
  - Cada um: `slug`, `title`, `author`, `qualis_level`, `abstract`, `related_modules`
- **Sensibilidade:** **BAIXA-MÉDIA** — bibliografias são tipicamente públicas (estão no livro definitivo AQUARIOS_LIVRO.md também)
- **Risco:** BAIXO-MÉDIO
  - Expõe que ProteOS/HygeiOS/Comunidades estão fundamentadas em bibliografia específica
  - Não é secreto (está escrito no Manual V1.0512)
  - ✅ Mostra proveniência (bom sinal)
  - ❌ Não é financeiro/estratégico, é só "estes são nossos pilares intelectuais"
- **Uso no app:** Documentação (migration 12 PARTE 6 referencia) — NÃO há consumidor em runtime
- **Policy:** `Anyone can read kb_foundation` ✅
- **Fix pending:** ❌ Nenhuma
- **Recomendation:** ❓ **DECISÃO DE NEGÓCIO**
  - Manter ANON se: transparência intelectual é parte da marca (mostra rigor filosófico)
  - Restringir AUTH-ONLY se: quer ocultar que foundation é principalmente PS crítica
- **Recomendação técnica:** Baixo risco; pode ficar público

#### 19. `roadmap_phase_log` (4 linhas) 🟡 SENSÍVEL
- **Conteúdo:** 4 fases do roadmap
  - Fase 1: "Fundação Social" — Diário, Comunidades, HermeOS básico — ✅ COMPLETA (05/27)
  - Fase 2: "Núcleo Analítico" — ProteOS real, HygeiOS ETL, AsclepiOS, Marketplace — ⏳ IN_PROGRESS (10/01 planejado)
  - Fase 3: "Integração Física" — EteriOS, Voz, HermeOS OpenBanking, Zé das Bets, AR/VR — 📅 PLANEJADO
  - Fase 4: "Autonomia Preditiva" — Multiagentes, edge AI, Enterprise API — 📅 PLANEJADO (2027+)
- **Sensibilidade:** **MÉDIA** — expõe roadmap público (mas vago; não é especificação)
- **Risco:** MÉDIO
  - ✅ Concorrente vê que fases 2-4 estão planejadas, pode acelerar seu próprio roadmap
  - ✅ Data "10/01" (setembro 2026) é prazo competitivo
  - ❌ Roadmaps são geralmente públicas (Figma, GitHub Projects, etc.)
- **Uso no app:** Documentação (handoffs) — NÃO há consumidor em runtime
- **Policy:** `Anyone can read roadmap_phase_log` ✅
- **Fix pending:** ❌ Nenhuma
- **Recomendation:** ❓ **DECISÃO DE NEGÓCIO** — manter roadmap vago é prudente
- **Recomendação técnica:** Moderadamente sensível; considerar `authenticated_read` ou excluir datas

#### 20. `alexandrios_kb` (10 linhas) 🟡 SENSÍVEL
- **Conteúdo:** 10 FAQs + 1 item crítico
  - Items 1-9: FAQs legítimas (o que é AquariOS, IVI, ProteOS, etc.)
  - **Item 10:** ⚠️ **"Como acesso área admin?"** — "Configurações → toque 5x em 'Arkhe Labs' → digite passphrase"
- **Risco:** CRÍTICO
  - ✅ **Documentação pública do mecanismo de acesso ao gate admin oculto**
  - ✅ Concorrente sabe exatamente como tentar quebrar acesso admin (toque 5x em "Arkhe Labs")
  - ❌ Não é segredo (pode ser reverse-engineered do código), MAS deixar público facilita ataque
- **Sensibilidade:** **ALTA** — item 10 não deveria estar aqui
- **Compliance:** Expõe mecanismo de autenticação/autorização (OWASP — security through obscurity é fraco, MAS por que publicar?)
- **Uso no app:** HelpEngine (alexandrios.ts busca local em FAQsData.faqs — não lê da tabela)
- **Policy:** `Anyone can read alexandrios_kb` ✅
- **Fix pending:** ❌ Nenhuma
- **Recomendation:** 🚨 **APLICAR RLS**
  - **Remover ou ocultar item 10** (ou mover para docs internas)
  - Policy: `authenticated_read` (usuários logados podem ler FAQ, mas item admin é visível só pra admin)
  - OU **mover FAQ do admin pra docs privadas** (deletar da tabela, manter em wiki interna)
- **Recomendação técnica:** **Deletar item 10 da tabela pública** (ou movê-lo pra `admin_docs` table RLS service_role-only)

#### 21. `persona_management` (130 linhas) 🟡 SENSÍVEL
- **Conteúdo:** 130 personas de comunidade com activity_level, interactions_today/week, last_active, managed_by='hygeios'
- **Sensibilidade:** **BAIXA-MÉDIA** — são bots IA (não são pessoas reais), MAS activity logs são rastreáveis
- **Risco:** BAIXO-MÉDIO
  - ✅ Expõe que há 130 personas (IA-driven communities)
  - ✅ Mostra last_active (último login do bot — desnecessário público)
  - ✅ Concorrente vê estratégia de comunidade (profundo, com 130 personas curadas)
  - ❌ Não é financeiro/estratégico (é relativamente óbvio que há bots)
- **Uso no app:** Comunidades — usuário interage com personas (legítimo; vê que há moderadores)
- **Policy:** `Anyone can read persona_mgmt` ✅
- **Fix pending:** ❌ Nenhuma
- **Recomendation:** ❓ **DECISÃO DE NEGÓCIO**
  - Manter ANON se: transparência de que há bots é importante (UX honesto)
  - Restringir AUTH-ONLY se: quer esconder escala de automação (130 personas)
- **Recomendação técnica:** Baixo risco; pode ficar público

---

## MIGRATIONS PENDENTES (JÁ CRIADAS, AINDA NÃO APLICADAS)

### Migration 23: `20260620120000_rls_hardening_constitution.sql`
- **Status:** ✅ Criada em 06/Jun, ❌ não aplicada em produção
- **O quê fixa:** `aquarios_constitution` (CRITICAL) + `ecumenic_traditions` (colunas ocultas oracle_*)
- **Comando:** `supabase db push` no env de produção
- **Efeito:** 
  - `aquarios_constitution` policy muda de `USING (true)` → `USING (is_public IS TRUE)` — oculta 10 linhas sandeiros
  - `ecumenic_traditions` revoga SELECT em oracle_modern/oracle_label das anon
- **Recomendação:** ✅ **APLICAR IMEDIATAMENTE** (é correção, não feature)

---

## RESUMO DE AÇÕES POR CLASSIFICAÇÃO

### 🔴 APLICAR AGORA (risco crítico, fixes prontos)
- ✅ Migration 23 (aquarios_constitution + ecumenic_traditions) — `supabase db push`

### 🔴 CRIAR NOVAS MIGRATIONS (risco crítico, sem fix)

**Migration A: `20260621_rls_fix_arkhe_intellectual_property.sql`**
- Fecha `arkhe_holding` (anon read → service_role-only)
- Fecha `intellectual_property_registry` (anon read → service_role-only)
- Rasão: CPF do fundador exposto, arquitetura completa exposta

**Migration B: `20260621_rls_fix_aquarios_architecture.sql`**
- Fecha `aquarios_architecture` (anon read → service_role-only)
- Razão: estratégia de holding exposta, HygeiOS descrito como "núcleo invisível"

**Migration C: `20260621_rls_fix_admin_doc_in_kb.sql`**
- Deleta item 10 de `alexandrios_kb` (admin access gate) OU move pra tabela privada
- Razão: mecanismo de autenticação admin documentado publicamente

### 🟡 AGUARDAR DECISÃO DE NEGÓCIO (ambíguo, risco médio)
1. `aquarios_decisions` (18 linhas) — decisões arquiteturais
2. `aquarios_divergencias` (18 linhas) — conflitos internos
3. `panaceia_offerings` (6 linhas) — percentuais de split (70/30)
4. `aquarios_eixo_distribution` (46 linhas) — roadmap de features futuras
5. `roadmap_phase_log` (4 linhas) — fases com datas
6. `kb_foundation` (12 linhas) — bibliografia (baixo risco, pode ficar público)
7. `persona_management` (130 linhas) — bots de comunidade (baixo risco, provavelmente OK manter)

---

## PRÓXIMOS PASSOS (PARA O FOUNDER)

**Decisão 1: Aplicar Migration 23?**
- ✅ Recomendação técnica: SIM — é correção de segurança, sem breaking changes
- Impact: `aquarios_constitution` volta a ter 10 linhas (sandeiros) invisível para anon; 10 linhas (PS) ainda legíveis

**Decisão 2: Criar Migrations A/B/C?**
- ✅ Recomendação técnica: SIM — CPF/arquitetura/admin gate são críticos ocultar
- Impact: 3 tabelas passam a service_role-only; nenhuma feature no app quebra

**Decisão 3: Das 7 tabelas ambíguas, quais restringir?**
- Opção 1: Todas para `authenticated_read` (usuários logados veem, anon não)
- Opção 2: Deixar `decisions`, `divergencias`, `eixo_distribution`, `roadmap` públicas (transparência radical)
- Opção 3: Híbrido (ex.: decisions/divergencias authenticated, oferrings/kb/personas públicas)

**Decisão 4: Item 10 de alexandrios_kb?**
- ✅ Recomendação técnica: DELETAR (ou mover pra admin_docs table)
- Admin gate deve estar em documentação INTERNA, não em FAQ pública

---

## CONFORMIDADE vs REGRAS DO PROJETO

| Regra | Tabela | Status | Ação |
|-------|--------|--------|------|
| Nunca expõe IP | N/A | ✅ OK | Nenhuma tabela tem IP |
| Nunca expõe código HVP | N/A | ✅ OK | Nenhuma tabela tem algoritmo HVP |
| Nunca expõe DRE real | N/A | ✅ OK | Nenhuma tabela tem financeiro interno |
| Nunca expõe SAFE/IPO | N/A | ✅ OK | Nenhuma tabela tem valuation |
| Nunca expõe schema DB | `intellectual_property_registry` | ❌ FALHA | code_anchor aponta pra migrations |
| Nunca expõe arquitetura | `aquarios_architecture` | ❌ FALHA | estrutura holding/camadas exposta |
| Nunca expõe segredos internos | `aquarios_constitution` | ❌ FALHA | 7 princípios estruturais (is_public ignorado) |

---

**Preparado por:** Claude Code Session  
**Data:** 21/Jun/2026  
**Próxima ação:** Aguardando decisão do founder em Decisões 1-4
