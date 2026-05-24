// S13 — Economia + Loja
// PLACEHOLDER para S14 — ARKHE FAQ Engine
// Vide: memory/integration_roadmap_s13_s15.md § 1.2, M-02

export interface FAQResult {
  id: string;
  question: string;
  answer: string;
  persona: string;
  category: string;
  relatedFAQs: string[];
}

export async function searchFAQ(
  query: string,
  persona?: string,
  category?: string
): Promise<FAQResult[]> {
  // TODO S14: Implementar ARKHE FAQ Engine aqui
  // 42 FAQs: 8 Zé + 9 Dona Maria + 8 Carlos
  // Busca por keyword, categoria, persona
  // Retorna com related FAQs
  throw new Error('S14: FAQEngine not implemented');
}

export async function getFAQsByPersona(persona: string): Promise<FAQResult[]> {
  // TODO S14: Retornar FAQs específicas por persona
  throw new Error('S14: getFAQsByPersona not implemented');
}

export async function getFAQsByCategory(category: string): Promise<FAQResult[]> {
  // TODO S14: Retornar FAQs por categoria
  throw new Error('S14: getFAQsByCategory not implemented');
}
