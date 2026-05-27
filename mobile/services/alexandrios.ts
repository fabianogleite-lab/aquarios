// ============================================================
// AlexandriOS — Help Engine Conversacional (Manual V1.0612 §03)
// ============================================================
// Item 25 do Intellectual Property Registry (Lei 9.610)
// Origem: services/faqEngine.ts (S14) · renomeado em 27/05/2026
// Decisão D-13/D-31: Manual V1.0512 nomeia AlexandriOS como help engine
//
// Próximos passos: migrar FAQs locais para alexandrios_kb (PARTE 5 migration 12)
// ============================================================

import FAQsData from '../config/faqs.json';

export interface AlexandriosResult {
  id: string;
  question: string;
  answer: string;
  persona: string;
  category: string;
  relatedFAQs: string[];
  tone?: string;
  qualisLevel?: 'A1' | 'A2' | 'B1' | 'B2' | 'B3' | 'B4' | 'C' | 'general';
  sourceAuthor?: string;
  isCanonical?: boolean;
}

// Backward-compatible alias (preserva contratos antigos durante transição)
export type FAQResult = AlexandriosResult;

const KB: AlexandriosResult[] = FAQsData.faqs;

/**
 * Busca na base de conhecimento AlexandriOS por query + persona + categoria.
 * Manual V1.0612: futuramente integrará alexandrios_kb (Supabase) com qualis_level.
 */
export async function searchKB(
  query: string,
  persona?: string,
  category?: string
): Promise<AlexandriosResult[]> {
  const queryLower = query.toLowerCase();

  const results = KB.filter(item => {
    const matchesQuery = item.question.toLowerCase().includes(queryLower) ||
                         item.answer.toLowerCase().includes(queryLower);
    const matchesPersona = !persona || item.persona === persona || item.persona === 'COMPARTILHADA';
    const matchesCategory = !category || item.category === category;

    return matchesQuery && matchesPersona && matchesCategory;
  });

  return results.length > 0 ? results : [];
}

/**
 * Retorna FAQs canônicas de uma persona oficial (Roberto/Maria/Carlos · Manual §21).
 */
export async function getKBByPersona(persona: string): Promise<AlexandriosResult[]> {
  if (!['ZÉ_DO_APERTO', 'DONA_MARIA', 'CARLOS'].includes(persona)) {
    return [];
  }

  return KB.filter(item =>
    item.persona === persona || item.persona === 'COMPARTILHADA'
  );
}

export async function getKBByCategory(category: string): Promise<AlexandriosResult[]> {
  if (!FAQsData.categories.includes(category)) {
    return [];
  }

  return KB.filter(item => item.category === category);
}

export function getTotalKBEntries(): number {
  return KB.length;
}

export function getPersonaDistribution(): Record<string, number> {
  const dist: Record<string, number> = {};
  KB.forEach(item => {
    dist[item.persona] = (dist[item.persona] || 0) + 1;
  });
  return dist;
}

export function getKBEntryById(id: string): AlexandriosResult | undefined {
  return KB.find(item => item.id === id);
}

// ============================================================
// Backward-compatible exports (manter contratos antigos por 1 sprint)
// Remover na S19 quando todas as referências migrarem para searchKB/getKBBy*
// ============================================================

export const searchFAQ = searchKB;
export const getFAQsByPersona = getKBByPersona;
export const getFAQsByCategory = getKBByCategory;
export const getTotalFAQs = getTotalKBEntries;
export const getFAQById = getKBEntryById;
