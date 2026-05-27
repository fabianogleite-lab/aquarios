/**
 * Audit DEVPACK v4 vs Código Real — fonte única de verdade do dashboard
 * Documento humano: mobile/docs/AUDIT_MATRIX_DEVPACK_V4.md
 */

export type Severity = 'critical' | 'medium' | 'low' | 'innovation';
export type Effort = 'XS' | 'S' | 'M' | 'L' | 'XL';
export type Priority = 'P1' | 'P2' | 'P3' | 'P4';

export interface Option {
  letter: 'A' | 'B' | 'C' | 'D' | 'E';
  title: string;
  description: string;
  effort: Effort;
  recommended?: boolean;
  chosen?: boolean;
}

export interface Divergencia {
  id: string;
  module: string;
  devpackRef: string;
  severity: Severity;
  priority: Priority;
  title: string;
  devpackSays: string;
  codeReality: string;
  type: string;
  options: Option[];
  blockedBy?: string;
  notes?: string;
}

export const SEVERITY_META: Record<Severity, { label: string; color: string; icon: string }> = {
  critical:   { label: 'Crítica',     color: '#e74c3c', icon: '🔴' },
  medium:     { label: 'Média',       color: '#b8952a', icon: '🟡' },
  low:        { label: 'Baixa',       color: '#6a7a8a', icon: '🟢' },
  innovation: { label: 'Inovação',    color: '#4ecdc4', icon: '⭐' },
};

export const PRIORITY_META: Record<Priority, { label: string; order: number }> = {
  P1: { label: 'Imediata',     order: 1 },
  P2: { label: 'Pré-launch',   order: 2 },
  P3: { label: 'Pós-launch',   order: 3 },
  P4: { label: 'Documentação', order: 4 },
};

export const DIVERGENCIAS: Divergencia[] = [
  {
    id: 'D-01',
    module: 'HermeOS',
    devpackRef: 'M-04',
    severity: 'critical',
    priority: 'P1',
    title: 'HermeOS — Papel completamente diferente',
    devpackSays: 'Dashboard executivo · todas as decisões · Pipeline por país · CRM · Google Reviews',
    codeReality: 'aquarios_modules.slug=hermeos · "Inteligência financeira pessoal" · coming_soon',
    type: 'Mudança conceitual radical',
    notes: 'DECIDIDO 27/05/2026: Opção C (Híbrido) — HermeOS = integrador + alertas financeiros',
    options: [
      { letter: 'A', title: 'Manter código',          description: 'HermeOS = finanças pessoais. Criar NOVO módulo aquarios_dashboard para o conceito DEVPACK.', effort: 'M' },
      { letter: 'B', title: 'Reposicionar conforme DEVPACK', description: 'HermeOS vira dashboard executivo total. Migrar finanças para novo "FinanceOS". Mais alinhado à mitologia (Hermes = integrador).', effort: 'L' },
      { letter: 'C', title: 'Híbrido',                description: 'HermeOS como integrador (dashboard + alertas financeiros). Mantém referência mitológica mas amplia escopo.', effort: 'L', chosen: true },
    ],
  },
  {
    id: 'D-02',
    module: 'AsclepiOS',
    devpackRef: 'M-05',
    severity: 'medium',
    priority: 'P1',
    title: 'AsclepiOS — Escopo "Toda saúde" não implementado',
    devpackSays: '7 eixos: Dental · Fisio · Nutrição · Oriental · Floresta · Mental · Psíquica · Rapidoc · 42 FAQs',
    codeReality: 'coming_soon · "Módulo médico, prontuário longitudinal" · Rapidoc citado',
    type: 'Escopo reduzido',
    options: [
      { letter: 'A', title: 'Lançamento gradual',     description: 'Começar por Nutrição (já existe!) + Mental + Dental nessa ordem. Cada eixo é uma feature flag.', effort: 'L', recommended: true },
      { letter: 'B', title: 'Gateway só de Rapidoc',  description: 'Manter como gateway de telemedicina. Nutrição fica como native_tool standalone.', effort: 'S' },
      { letter: 'C', title: 'Implementar tudo',       description: 'Escopo XL, não recomendado.', effort: 'XL' },
    ],
  },
  {
    id: 'D-03',
    module: 'ProteOS',
    devpackRef: 'M-03',
    severity: 'critical',
    priority: 'P2',
    title: 'ProteOS — Multi-modal não implementado',
    devpackSays: 'Texto · OCR · Imagem · Voz (input) · API Omnichannel · Questionários não-invasivos',
    codeReality: 'Chat texto only + Cultural Voice Layer (output) · 4 personas (default/pragmatico/suporte/urgencia)',
    type: 'Capacidades de entrada faltantes',
    options: [
      { letter: 'A', title: 'Voz primeiro',           description: 'Expo Speech-to-Text. ROI alto, esforço S.', effort: 'S', recommended: true },
      { letter: 'B', title: 'OCR + Imagem',           description: 'Tesseract.js ou Google Cloud Vision. ROI médio.', effort: 'M' },
      { letter: 'C', title: 'API Omnichannel',        description: 'WhatsApp Business — depende de aprovação Meta. ROI alto B2B.', effort: 'L' },
      { letter: 'D', title: 'Manter texto only',      description: 'Focar em qualidade da Voz Cultural.', effort: 'XS' },
    ],
  },
  {
    id: 'D-04',
    module: 'ARKHE',
    devpackRef: 'M-10',
    severity: 'medium',
    priority: 'P2',
    title: 'ARKHE — Módulo ausente',
    devpackSays: 'Documentação · tickets · garantia autoral · NÃO é saúde',
    codeReality: '"Arkhe Labs" só como branding · zero implementação',
    type: 'Módulo crítico ausente',
    options: [
      { letter: 'A', title: 'Módulo ARKHE com 3 funções', description: 'README in-app + Tickets + Garantia autoral via SHA-256 git commits.', effort: 'M' },
      { letter: 'B', title: 'Só branding',                  description: 'Docs externos via GitHub Pages.', effort: 'XS' },
      { letter: 'C', title: 'ARKHE = Help Engine + FAQ',   description: 'Substituir services/faqEngine.ts por aquarios_arkhe_kb table.', effort: 'S', recommended: true },
    ],
  },
  {
    id: 'D-05',
    module: 'Sophrosyne',
    devpackRef: 'M-09',
    severity: 'low',
    priority: 'P4',
    title: 'Sophrosyne Kernel — Ausente',
    devpackSays: 'Kernel barramento · core_kernel_state · cognitive_prompt_registry',
    codeReality: 'audit_logs + performance_metrics cumprem parcialmente · sem prompt registry',
    type: 'Conceito espalhado sem nome unificado',
    options: [
      { letter: 'A', title: 'Renomear conjunto',      description: 'Apelidar audit_logs + performance_metrics + persona_management de "Sophrosyne Layer".', effort: 'XS' },
      { letter: 'B', title: 'Implementar prompt registry', description: 'Versionamento de prompts ProteOS (atualmente hardcoded).', effort: 'S', recommended: true },
      { letter: 'C', title: 'Ignorar como nome',      description: 'Manter por funções.', effort: 'XS' },
    ],
  },
  {
    id: 'D-06',
    module: 'Nomenclatura',
    devpackRef: 'M-12',
    severity: 'low',
    priority: 'P4',
    title: 'Renomeação "Módulos → Eixos"',
    devpackSays: 'Inviolável: em TODO o ecossistema, "módulos" = "eixos"',
    codeReality: 'Tabela: aquarios_modules · UI: "MÓDULOS" em coming-soon.tsx',
    type: 'Cosmético inviolável',
    options: [
      { letter: 'A', title: 'Migração total',         description: 'Renomear tabela + todas referências. Breaking mas mecânico.', effort: 'M' },
      { letter: 'B', title: 'UI-only',                description: 'Manter "módulos" tecnicamente, exibir "eixos" só na UI.', effort: 'XS', recommended: true },
      { letter: 'C', title: 'Ignorar',                description: 'Admitir que "módulos" pegou.', effort: 'XS' },
    ],
  },
  {
    id: 'D-07',
    module: 'EteriOS',
    devpackRef: 'novo',
    severity: 'innovation',
    priority: 'P4',
    title: 'EteriOS — Inovação do código',
    devpackSays: 'Não menciona',
    codeReality: 'Wearables e IoT · coming_soon · depende de hygeios · telemetry_vitality_logs',
    type: 'Inovação',
    options: [
      { letter: 'A', title: 'Documentar em DEVPACK v5',   description: 'Adicionar como novo módulo.', effort: 'XS', recommended: true },
      { letter: 'B', title: 'Mesclar em AsclepiOS',         description: 'Biometria como sub-eixo.', effort: 'XS' },
      { letter: 'C', title: 'Manter independente',          description: '', effort: 'XS' },
    ],
  },
  {
    id: 'D-08',
    module: 'AeropagOS',
    devpackRef: 'novo',
    severity: 'innovation',
    priority: 'P4',
    title: 'AeropagOS — Gamificação já built',
    devpackSays: 'Gamificação em Comunidades (M-11), sem nome',
    codeReality: 'aquarios_modules slug=aeropagos status=built · XP, badges, leaderboard, mentor',
    type: 'Inovação',
    options: [
      { letter: 'A', title: 'Documentar DEVPACK v5', description: 'Referência: Areópago grego (conselho deliberativo).', effort: 'XS', recommended: true },
      { letter: 'B', title: 'Manter sem nome',        description: '', effort: 'XS' },
    ],
  },
  {
    id: 'D-09',
    module: 'DataCommunity',
    devpackRef: 'M-12',
    severity: 'critical',
    priority: 'P1',
    title: '44 Eixos DataCommunity — Não implementados',
    devpackSays: '44 eixos: 8 IA + 6 Token + 6 Dados + 8 Social + 8 Util + 8 Experiência',
    codeReality: 'Conceito inexistente. Tokens existem como 4 tipos (ai/sync/insight/community)',
    type: 'Escopo enorme não-implementado',
    notes: 'DECIDIDO 27/05/2026: Opção E (Distribuir) — 44 eixos viram features dos 8 módulos. Questionários ProteOS orientam personas a entenderem 22 arcanos SandeirOS. Mapa: docs/44_EIXOS_DISTRIBUTION_MAP.md',
    options: [
      { letter: 'A', title: 'Implementar todos',      description: 'Esforço XL+ (~6 meses). Não recomendado pré-launch.', effort: 'XL' },
      { letter: 'B', title: 'Mapear 4 tokens',        description: 'ai cobre 8 eixos IA. Taxonomia only.', effort: 'XS' },
      { letter: 'C', title: 'Top 10 prioritários',    description: 'OCR, Calc IA, Análise Sentimentos, Notas IA, Grupos, Indicações, NFTs, Biometria, Avatar, Code Gen.', effort: 'L' },
      { letter: 'D', title: 'Abandonar 44 eixos',    description: 'Focar nos 8 módulos + native_tools.', effort: 'XS' },
      { letter: 'E', title: 'DISTRIBUIR nos 8 módulos + questionários ProteOS → arquétipos', description: 'Cada eixo vira feature de um dos 8 módulos. Questionários conversacionais do ProteOS guiam usuário a descobrir seu arcano SandeirOS (1 de 22). Conecta DataCommunity ↔ SandeirOS ↔ Personas em sistema único.', effort: 'M', chosen: true },
    ],
  },
  {
    id: 'D-10',
    module: 'PanaceIA',
    devpackRef: 'M-13',
    severity: 'critical',
    priority: 'P1',
    title: 'PanaceIA — Conceito divergente',
    devpackSays: 'Marketplace de tokens de IA externos (BYOK + exchange) · 1 token Anthropic = 1 TKN',
    codeReality: 'Stripe payments globais (13 moedas) · 4 tipos token interno · 12 packages',
    type: 'Conceito completamente diferente',
    notes: 'DECIDIDO 27/05/2026: Opção C (Híbrido) — Stripe default + BYOK premium. Migration 11 fica. Adicionar tabela panaceia_user_api_keys (criptografada).',
    options: [
      { letter: 'A', title: 'Implementar BYOK',       description: 'Usuário traz API key Anthropic/OpenAI → ProteOS roteia sem cobrar TKN.', effort: 'M' },
      { letter: 'B', title: 'Manter Stripe-only',     description: 'Mais simples, mais lucrativo.', effort: 'XS' },
      { letter: 'C', title: 'Híbrido',                description: 'Stripe default + BYOK como feature premium ("Traga sua chave").', effort: 'S', chosen: true },
    ],
  },
  {
    id: 'D-11',
    module: 'Blockchain DCT',
    devpackRef: 'M-13',
    severity: 'medium',
    priority: 'P3',
    title: 'ERC-20 DCT Polygon — Não implementado',
    devpackSays: 'Solidity + Polygon · Supply 10M DCT · 1 DCT = 1000 TKN',
    codeReality: 'ZERO blockchain. Token economy off-chain (PostgreSQL)',
    type: 'Escopo blockchain ausente',
    options: [
      { letter: 'A', title: 'Deploy testnet Mumbai',  description: 'Validar conceito sem custo.', effort: 'M' },
      { letter: 'B', title: 'Deploy mainnet Polygon', description: 'Adiciona credibilidade Web3 + complexidade regulatória.', effort: 'L' },
      { letter: 'C', title: 'Adiar Web3',            description: 'Focar fiat/Stripe.', effort: 'XS', recommended: true },
    ],
  },
  {
    id: 'D-12',
    module: 'TKN unit',
    devpackRef: 'M-13',
    severity: 'medium',
    priority: 'P3',
    title: 'TKN unidade — Não existe',
    devpackSays: '1 USD = 5000 TKN · paridade explícita',
    codeReality: 'price_usd_cents + token_amount sem TKN unit unificada · 4 tipos isolados',
    type: 'Modelo de pricing divergente',
    options: [
      { letter: 'A', title: 'Migrar para TKN unificado', description: 'Quebra packages atuais.', effort: 'M' },
      { letter: 'B', title: 'Wrapper UI',                 description: 'Exibir "ai_50 = 50 TKN AI" sem mudar DB.', effort: 'XS', recommended: true },
      { letter: 'C', title: 'Manter divergente',          description: 'Modelo atual já é completo.', effort: 'XS' },
    ],
  },
  {
    id: 'D-13',
    module: 'AsclepiOS FAQ',
    devpackRef: 'M-05',
    severity: 'medium',
    priority: 'P2',
    title: 'FAQ 42 questões — Verificar',
    devpackSays: '42 FAQs em SQL: 8 ZE + 9 DM + 8 CA + 17 outros',
    codeReality: 'services/faqEngine.ts existe — precisa auditoria de contagem',
    type: 'Implementação parcial provável',
    options: [
      { letter: 'A', title: 'Auditar faqEngine.ts',   description: 'Confirmar 42 FAQs.', effort: 'XS', recommended: true },
      { letter: 'B', title: 'Migrar para tabela',     description: 'aquarios_arkhe_kb searchable + versionável.', effort: 'S' },
    ],
  },
  {
    id: 'D-14',
    module: 'HermeOS Pipeline',
    devpackRef: 'M-04',
    severity: 'low',
    priority: 'P2',
    title: 'Pipeline por país — Não implementado',
    devpackSays: '5 stages × 13 países · pré-kit cultural · funil por persona',
    codeReality: 'ZERO implementação',
    type: 'Depende de D-01',
    blockedBy: 'D-01',
    options: [
      { letter: 'A', title: 'Aguardar resolução D-01', description: 'HermeOS precisa ser reposicionado primeiro.', effort: 'XS', recommended: true },
    ],
  },
  {
    id: 'D-15',
    module: 'Google Reviews',
    devpackRef: 'M-04',
    severity: 'low',
    priority: 'P3',
    title: 'Google Reviews widget — Não implementado',
    devpackSays: 'Google Places API + widget React',
    codeReality: 'ZERO',
    type: 'Feature externa simples',
    options: [
      { letter: 'A', title: 'Places API',     description: 'API key Google + componente. ROI: trust signal.', effort: 'S' },
      { letter: 'B', title: 'Widget Elfsight', description: 'Sem código. Custo $5-10/mês.', effort: 'XS' },
      { letter: 'C', title: 'Adiar',          description: 'Não-crítico pré-launch.', effort: 'XS', recommended: true },
    ],
  },
  {
    id: 'D-16',
    module: 'Odontolar Plus',
    devpackRef: 'M-15',
    severity: 'low',
    priority: 'P4',
    title: 'Odontolar Plus — Não mencionado',
    devpackSays: 'Projeto de teste dentro de ProteOS',
    codeReality: 'ZERO referência',
    type: 'Projeto pessoal do fundador',
    options: [
      { letter: 'A', title: 'Projeto externo',        description: 'Não entra no app.', effort: 'XS', recommended: true },
      { letter: 'B', title: 'Feature flag admin',     description: 'aquarios_test_project, admin only.', effort: 'XS' },
    ],
  },
  {
    id: 'D-17',
    module: 'NicoChat/Shopify',
    devpackRef: 'M-15',
    severity: 'low',
    priority: 'P4',
    title: 'NicoChat / Shopify — Não integrados',
    devpackSays: 'Para Odontolar Plus',
    codeReality: 'ZERO',
    type: 'Dependente de D-16',
    blockedBy: 'D-16',
    options: [
      { letter: 'A', title: 'Ignorar pré-launch',     description: '', effort: 'XS', recommended: true },
    ],
  },
  {
    id: 'D-18',
    module: 'Personas',
    devpackRef: 'M-11',
    severity: 'medium',
    priority: 'P2',
    title: '130 personas vs 3 personas FAQ — Coexistência',
    devpackSays: 'Detalha 3 personas (Zé/Maria/Carlos) com 42 FAQs',
    codeReality: '130 personas culturais + 3 personas FAQ (engine/index.ts:355) — sistemas paralelos',
    type: 'Dois sistemas sem reconciliação',
    options: [
      { letter: 'A', title: 'Documentar coexistência', description: '3 personas = FAQ/segmentação · 130 personas = comunidade.', effort: 'XS', recommended: true },
      { letter: 'B', title: 'Unificar',                 description: 'Mapear 3 FAQ a 3 arquétipos (Zé→Sobrevivente, Maria→Curador, Carlos→Guerreiro).', effort: 'S' },
      { letter: 'C', title: 'Remover FAQ personas',     description: 'Substituir engine/index.ts:355 por arquétipos.', effort: 'M' },
    ],
  },
  {
    id: 'D-19',
    module: 'Constituição PS',
    devpackRef: 'novo',
    severity: 'innovation',
    priority: 'P4',
    title: 'Pilar 2 Psicologia Social — Inovação',
    devpackSays: 'Cita 7 Leis Herméticas + Quarto Caminho + Bardo Thodol. Sem Pilar 2.',
    codeReality: '10 itens PS: Vigotski, Foucault, Freire, Almeida, Butler, Han, Bauman, Basaglia, Pichon-Rivière, Ciampa',
    type: 'Inovação superior do código',
    options: [
      { letter: 'A', title: 'Atualizar DEVPACK v5',   description: 'Adicionar Pilar 2 PS na nova versão.', effort: 'XS', recommended: true },
      { letter: 'B', title: 'Remover Pilar 2',         description: 'Manter só DEVPACK original. Perde sofisticação.', effort: 'S' },
    ],
  },
  {
    id: 'D-20',
    module: '7 Leis Herméticas',
    devpackRef: 'M-01',
    severity: 'innovation',
    priority: 'P4',
    title: '7 Leis ocultas — Mais alinhada ao hermetismo real',
    devpackSays: 'Sugere uso explícito como "base do ecossistema"',
    codeReality: 'is_public=false · nunca expostas ao usuário',
    type: 'Decisão filosófica mais sólida',
    options: [
      { letter: 'A', title: 'Manter ocultas',         description: 'Alinhado com Hermetismo real (esotérico = oculto).', effort: 'XS', recommended: true },
    ],
  },
  {
    id: 'D-21',
    module: 'HygeiOS Data Gate',
    devpackRef: 'M-08',
    severity: 'low',
    priority: 'P3',
    title: 'HygeiOS Data Gate — 4 vs 5 níveis',
    devpackSays: '5 níveis: free_anonimo / free_comunidade / starter / premium / professional / beck_office',
    codeReality: '4 níveis: free / starter / premium / professional',
    type: 'Mapping incompleto',
    options: [
      { letter: 'A', title: 'Adicionar níveis faltantes', description: 'free_comunidade e beck_office.', effort: 'XS' },
      { letter: 'B', title: 'Manter 4 níveis',             description: 'beck_office vira "professional B2B" feature flag.', effort: 'XS', recommended: true },
    ],
  },
  {
    id: 'D-22',
    module: 'Personas LGPD',
    devpackRef: 'M-11',
    severity: 'low',
    priority: 'P3',
    title: 'Cadastro fundador — Sem profile_data_removed',
    devpackSays: 'profile_data_removed BOOLEAN + remove_persona_profile_data()',
    codeReality: 'persona_management sem coluna de remoção · profiles.is_bot=true',
    type: 'LGPD enhancement faltante',
    options: [
      { letter: 'A', title: 'Adicionar colunas',       description: 'profile_data_removed + at + by.', effort: 'XS', recommended: true },
      { letter: 'B', title: 'Usar is_active=false',    description: 'Soft delete simples.', effort: 'XS' },
    ],
  },
  {
    id: 'D-23',
    module: 'SandeirOS',
    devpackRef: 'novo',
    severity: 'innovation',
    priority: 'P4',
    title: 'SandeirOS 22 arcanos — Inovação',
    devpackSays: 'Não detalha',
    codeReality: '"22 arcanos + 3 livros basais + 7 leis herméticas"',
    type: 'Conceito proprietário do código',
    options: [
      { letter: 'A', title: 'Documentar DEVPACK v5', description: '', effort: 'XS', recommended: true },
    ],
  },
  {
    id: 'D-24',
    module: 'EcumenicOS Oracle',
    devpackRef: 'novo',
    severity: 'innovation',
    priority: 'P4',
    title: 'oracle_hidden / oracle_label — Inovação',
    devpackSays: 'Não menciona',
    codeReality: 'ecumenic_traditions.oracle_modern + oracle_label ocultos',
    type: 'Sistema esotérico proprietário',
    options: [
      { letter: 'A', title: 'Documentar',     description: '', effort: 'XS', recommended: true },
    ],
  },
  {
    id: 'D-25',
    module: 'Arquitetura SQL',
    devpackRef: 'novo',
    severity: 'innovation',
    priority: 'P4',
    title: 'SECURITY DEFINER functions — Arquitetura avançada',
    devpackSays: 'Não detalha funções SQL',
    codeReality: 'hygeios_log_content_audit · panaceia_deliver_tokens · log_audit_event · upsert_bot_persona',
    type: 'Arquitetura SQL madura',
    options: [
      { letter: 'A', title: 'Manter',         description: '', effort: 'XS', recommended: true },
    ],
  },
];

export function getSummary() {
  const total = DIVERGENCIAS.length;
  const bySeverity: Record<Severity, number> = { critical: 0, medium: 0, low: 0, innovation: 0 };
  const byPriority: Record<Priority, number> = { P1: 0, P2: 0, P3: 0, P4: 0 };

  for (const d of DIVERGENCIAS) {
    bySeverity[d.severity]++;
    byPriority[d.priority]++;
  }

  return { total, bySeverity, byPriority };
}
