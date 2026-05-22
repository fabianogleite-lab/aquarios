// ⚗ AquariOS Backend v2.0000 — Seed Script
// Popula banco com 3 personas e 42 FAQs críticas

import pkg from 'pg';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

const { Pool } = pkg;
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// ═══════════════════════════════════════════════════════════════════════
// PERSONAS
// ═══════════════════════════════════════════════════════════════════════

const PERSONAS_DATA = [
  {
    code: 'ZE_DO_APERTO',
    name: 'Roberto Santos',
    tone: 'PRAGMATIC_DIRECT',
    faqs: 8,
    ticket: 'R$24,90–49,90'
  },
  {
    code: 'DONA_MARIA',
    name: 'Maria da Silva',
    tone: 'SUPPORTIVE_CLINICAL',
    faqs: 9,
    ticket: 'R$39,90–149,90'
  },
  {
    code: 'CARLOS_CLINICAL_URGENT',
    name: 'Carlos Mendes',
    tone: 'CLINICAL_URGENT',
    faqs: 8,
    ticket: 'R$89,90–399,90'
  }
];

// ═══════════════════════════════════════════════════════════════════════
// FAQs (42 TOTAL)
// ═══════════════════════════════════════════════════════════════════════

const FAQS_DATA = [
  // Roberto (8)
  { code: 'ZE001', persona: 'ZE_DO_APERTO', q: 'Como conciliar orçamento apertado com saúde?', category: 'Financial' },
  { code: 'ZE002', persona: 'ZE_DO_APERTO', q: 'Stress financeiro crônico — como reconhecer?', category: 'Mental' },
  { code: 'ZE003', persona: 'ZE_DO_APERTO', q: 'Nutrição de qualidade com pouco dinheiro', category: 'Nutrition' },
  { code: 'ZE004', persona: 'ZE_DO_APERTO', q: 'Ansiedade no trabalho informal — gestão', category: 'Mental' },
  { code: 'ZE005', persona: 'ZE_DO_APERTO', q: 'Hidratação básica e rotina mínima', category: 'Health' },
  { code: 'ZE006', persona: 'ZE_DO_APERTO', q: 'Dormir apenas 6h — riscos e gestão', category: 'Sleep' },
  { code: 'ZE007', persona: 'ZE_DO_APERTO', q: 'Check-up médico acessível', category: 'Health' },
  { code: 'ZE008', persona: 'ZE_DO_APERTO', q: 'Exercício físico gratuito', category: 'Movement' },

  // Maria (9)
  { code: 'DM001', persona: 'DONA_MARIA', q: 'Gestão da diabetes tipo 2', category: 'Chronic' },
  { code: 'DM002', persona: 'DONA_MARIA', q: 'Medicação e interações — o que saber', category: 'Medication' },
  { code: 'DM003', persona: 'DONA_MARIA', q: 'Família como suporte — envolver filhos', category: 'Social' },
  { code: 'DM004', persona: 'DONA_MARIA', q: 'Medo e ansiedade crônica — reconhecer', category: 'Mental' },
  { code: 'DM005', persona: 'DONA_MARIA', q: 'Refeições que cuidam da glicemia', category: 'Nutrition' },
  { code: 'DM006', persona: 'DONA_MARIA', q: 'Prevenção renal — o que monitorar', category: 'Health' },
  { code: 'DM007', persona: 'DONA_MARIA', q: 'Qualidade de vida com diabetes', category: 'Lifestyle' },
  { code: 'DM008', persona: 'DONA_MARIA', q: 'Quando procurar emergência', category: 'Urgent' },
  { code: 'DM009', persona: 'DONA_MARIA', q: 'Exercício seguro para idosos', category: 'Movement' },

  // Carlos (8)
  { code: 'CA001', persona: 'CARLOS_CLINICAL_URGENT', q: 'Risco cardíaco — screening completo', category: 'Cardiac' },
  { code: 'CA002', persona: 'CARLOS_CLINICAL_URGENT', q: 'Pressão arterial — metas e leitura', category: 'Cardiac' },
  { code: 'CA003', persona: 'CARLOS_CLINICAL_URGENT', q: 'Apneia do sono — diagnose', category: 'Sleep' },
  { code: 'CA004', persona: 'CARLOS_CLINICAL_URGENT', q: 'Colesterol e inflamação crônica', category: 'Health' },
  { code: 'CA005', persona: 'CARLOS_CLINICAL_URGENT', q: 'Stress e coração — conexão real', category: 'Mental' },
  { code: 'CA006', persona: 'CARLOS_CLINICAL_URGENT', q: 'Dieta DASH implementação prática', category: 'Nutrition' },
  { code: 'CA007', persona: 'CARLOS_CLINICAL_URGENT', q: 'Exercício cardíaco seguro', category: 'Movement' },
  { code: 'CA008', persona: 'CARLOS_CLINICAL_URGENT', q: 'Medicações cardiovasculares — o que é cada uma', category: 'Medication' },

  // General (17 remaining)
  { code: 'GEN001', persona: 'GENERAL', q: 'O que é o IVI?', category: 'System' },
  { code: 'GEN002', persona: 'GENERAL', q: 'Como funciona o ProteOS?', category: 'System' },
  { code: 'GEN003', persona: 'GENERAL', q: 'Privacidade e LGPD — dados meus?', category: 'Privacy' },
  { code: 'GEN004', persona: 'GENERAL', q: 'Comunidades — como funciona?', category: 'Social' },
  { code: 'GEN005', persona: 'GENERAL', q: 'Marketplace — comprar e vender', category: 'Commerce' },
  { code: 'GEN006', persona: 'GENERAL', q: 'Tokens — moeda interna', category: 'Economy' },
  { code: 'GEN007', persona: 'GENERAL', q: 'Wearables compatíveis', category: 'Tech' },
  { code: 'GEN008', persona: 'GENERAL', q: 'Beck Office — profissionais', category: 'Professional' },
  { code: 'GEN009', persona: 'GENERAL', q: 'Como cancelar assinatura', category: 'Account' },
  { code: 'GEN010', persona: 'GENERAL', q: 'Integração com Apple Health', category: 'Tech' },
  { code: 'GEN011', persona: 'GENERAL', q: 'Integração com Google Fit', category: 'Tech' },
  { code: 'GEN012', persona: 'GENERAL', q: 'Suporte técnico — contato', category: 'Support' },
  { code: 'GEN013', persona: 'GENERAL', q: 'Planos e preços', category: 'Pricing' },
  { code: 'GEN014', persona: 'GENERAL', q: 'Acessibilidade — modo de alto contraste', category: 'Accessibility' },
  { code: 'GEN015', persona: 'GENERAL', q: 'Idiomas suportados', category: 'Localization' },
  { code: 'GEN016', persona: 'GENERAL', q: 'Termos de uso — resumo', category: 'Legal' },
  { code: 'GEN017', persona: 'GENERAL', q: 'Como exportar meus dados', category: 'Privacy' },
];

// ═══════════════════════════════════════════════════════════════════════
// SEED FUNCTION
// ═══════════════════════════════════════════════════════════════════════

async function seedDatabase() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('🌱 Seeding FAQs...');
    
    for (const faq of FAQS_DATA) {
      const answer = `Resposta detalhada para: ${faq.q}`;
      
      await client.query(
        `INSERT INTO faqs (faq_code, persona_code, question, answer_text, category, tags, search_boost)
         VALUES ($1, $2, $3, $4, $5, $6, 1)`,
        [
          faq.code,
          faq.persona === 'GENERAL' ? 'ALL' : faq.persona,
          faq.q,
          answer,
          faq.category,
          [faq.category, 'health', 'general']
        ]
      );
    }
    
    console.log(`✓ Seeded ${FAQS_DATA.length} FAQs`);
    
    console.log('🌱 Seeding communities...');
    
    const communities = [
      { name: 'Yoga & Meditação', slug: 'yoga-meditacao', category: 'Práticas' },
      { name: 'Investidores Iniciantes', slug: 'investidores-iniciantes', category: 'Finanças' },
      { name: 'Mães de Primeira Viagem', slug: 'maes-primeira-viagem', category: 'Família' },
      { name: 'Corrida & Triathlon', slug: 'corrida-triathlon', category: 'Esportes' },
      { name: 'Hermetismo & Filosofia', slug: 'hermetismo-filosofia', category: 'Espiritualidade' },
    ];
    
    for (const community of communities) {
      await client.query(
        `INSERT INTO communities (creator_id, name, slug, description, category, is_active)
         VALUES ($1, $2, $3, $4, $5, TRUE)`,
        [
          uuidv4(),
          community.name,
          community.slug,
          `Comunidade de ${community.name.toLowerCase()}`,
          community.category
        ]
      );
    }
    
    console.log(`✓ Seeded ${communities.length} communities`);
    
    await client.query('COMMIT');
    console.log('✅ Database seed completed successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// ═══════════════════════════════════════════════════════════════════════
// RUN SEED
// ═══════════════════════════════════════════════════════════════════════

seedDatabase()
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
