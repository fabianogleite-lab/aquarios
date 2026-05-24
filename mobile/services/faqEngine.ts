// S14 — ARKHE FAQ Engine (Algoritmo M-02)
// 42 FAQs estruturadas com persona + categoria + busca semântica

import FAQsData from '../config/faqs.json';

export interface FAQResult {
  id: string;
  question: string;
  answer: string;
  persona: string;
  category: string;
  relatedFAQs: string[];
  tone?: string;
}

const FAQs: FAQResult[] = FAQsData.faqs;

export async function searchFAQ(
  query: string,
  persona?: string,
  category?: string
): Promise<FAQResult[]> {
  const queryLower = query.toLowerCase();

  let results = FAQs.filter(faq => {
    const matchesQuery = faq.question.toLowerCase().includes(queryLower) ||
                        faq.answer.toLowerCase().includes(queryLower);
    const matchesPersona = !persona || faq.persona === persona || faq.persona === 'COMPARTILHADA';
    const matchesCategory = !category || faq.category === category;

    return matchesQuery && matchesPersona && matchesCategory;
  });

  return results.length > 0 ? results : [];
}

export async function getFAQsByPersona(persona: string): Promise<FAQResult[]> {
  if (!['ZÉ_DO_APERTO', 'DONA_MARIA', 'CARLOS'].includes(persona)) {
    return [];
  }

  return FAQs.filter(faq =>
    faq.persona === persona || faq.persona === 'COMPARTILHADA'
  );
}

export async function getFAQsByCategory(category: string): Promise<FAQResult[]> {
  if (!FAQsData.categories.includes(category)) {
    return [];
  }

  return FAQs.filter(faq => faq.category === category);
}

export function getTotalFAQs(): number {
  return FAQs.length;
}

export function getPersonaDistribution(): Record<string, number> {
  const dist: Record<string, number> = {};
  FAQs.forEach(faq => {
    dist[faq.persona] = (dist[faq.persona] || 0) + 1;
  });
  return dist;
}

export function getFAQById(id: string): FAQResult | undefined {
  return FAQs.find(faq => faq.id === id);
}
