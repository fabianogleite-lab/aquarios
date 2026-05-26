// S14 — Intent Router (ProteOS Routing - Algoritmo M-03)
// Roteia baseado em vector similarity + system load + entropy calculation

type Destination = 'PROTEOS_ENGINE' | 'ASCLEPIOS_REFUTATION_QUEUE' | 'SANDEIROS_DEGRADED_WORKER';

export interface IntentRouterResult {
  destination: Destination;
  confidence: number;
  vectorSimilarity: number;
  systemLoad: number;
  entropy?: number;
}

const PROTEOS_EMBEDDINGS = [
  'saúde preventiva',
  'exercício físico',
  'alimentação saudável',
  'sono reparador',
  'bem-estar mental',
  'vacinação',
  'check-up',
  'crônica',
  'medicamento',
  'médico'
];

export function useIntentRouter() {
  const calculateVectorSimilarity = (query: string): number => {
    const queryLower = query.toLowerCase();
    const queryTokens = queryLower.split(/\s+/);

    let matches = 0;
    for (const embedding of PROTEOS_EMBEDDINGS) {
      const embeddingTokens = embedding.split(/\s+/);
      for (const token of queryTokens) {
        if (embeddingTokens.some(et => et.includes(token) || token.includes(et))) {
          matches += 1;
        }
      }
    }

    const maxMatches = Math.max(queryTokens.length, PROTEOS_EMBEDDINGS.length);
    const similarity = Math.min(1.0, matches / maxMatches);

    return parseFloat(similarity.toFixed(2));
  };

  const getSystemLoad = (): number => {
    const baseLoad = Math.random() * 0.3;
    const timeBasedLoad = new Date().getHours() / 24;
    const load = Math.min(1.0, baseLoad + timeBasedLoad * 0.3);

    return parseFloat(load.toFixed(2));
  };

  const calculateEntropy = (similarity: number, load: number): number => {
    const p1 = similarity;
    const p2 = 1 - similarity;

    const entropy1 = p1 > 0 ? -(p1 * Math.log2(p1)) : 0;
    const entropy2 = p2 > 0 ? -(p2 * Math.log2(p2)) : 0;

    const totalEntropy = entropy1 + entropy2;
    const maxEntropy = 1;

    return parseFloat((totalEntropy / maxEntropy).toFixed(3));
  };

  const route = async (query: string, context?: Record<string, any>): Promise<IntentRouterResult> => {
    if (!query || typeof query !== 'string') {
      return {
        destination: 'SANDEIROS_DEGRADED_WORKER',
        confidence: 0,
        vectorSimilarity: 0,
        systemLoad: 1.0,
        entropy: 0
      };
    }

    const vectorSimilarity = calculateVectorSimilarity(query);
    const systemLoad = getSystemLoad();
    const entropy = calculateEntropy(vectorSimilarity, systemLoad);

    let destination: Destination;
    let confidence: number;

    if (vectorSimilarity >= 0.85 && systemLoad <= 0.90) {
      destination = 'PROTEOS_ENGINE';
      confidence = Math.round((vectorSimilarity * (1 - systemLoad)) * 100);
    } else if (vectorSimilarity < 0.85) {
      destination = 'ASCLEPIOS_REFUTATION_QUEUE';
      confidence = Math.round((1 - vectorSimilarity) * 100);
    } else {
      destination = 'SANDEIROS_DEGRADED_WORKER';
      confidence = Math.round((1 - systemLoad) * 100);
    }

    confidence = Math.max(0, Math.min(100, confidence));

    return {
      destination,
      confidence,
      vectorSimilarity,
      systemLoad,
      entropy
    };
  };

  return { route };
}
