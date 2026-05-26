// S14 — AsclepiOS Audit (Validação Socrática)
// Detecta evasão de conteúdo (banned phrases) + validação de estrutura
// Algoritmo M-05 (DevPack) — Persona-aware validation

type Persona = 'ZÉ_DO_APERTO' | 'DONA_MARIA' | 'CARLOS';

export interface AuditResult {
  passed: boolean;
  reasons?: string[];
  confidence: number;
}

const BANNED_PHRASES: Record<Persona, string[]> = {
  ZÉ_DO_APERTO: [
    'milagre', 'cura garantida', '100% seguro', 'não precisa de médico',
    'remédio caseiro cura', 'água benzida', 'nunca vai ficar doente',
    'sem efeito colateral', 'grátis sem pagamento', 'só você sabe melhor',
    'ignore o que médico diz', 'placebo é efetivo', 'natural é sempre bom',
    'ciência é conspiração', 'confie em testimonial'
  ],
  DONA_MARIA: [
    'seu filho vai sofrer', 'morte iminente', 'sem esperança',
    'ninguém pode ajudar', 'você é culpada', 'família é responsável',
    'sacrifício total necessário', 'negue ajuda profissional', 'só você entende',
    'médico não liga', 'abandone seus sonhos', 'sempre será assim',
    'aceite o destino', 'não merece ser feliz', 'love é suficiente'
  ],
  CARLOS: [
    'estatística é irrelevante', 'seu corpo é máquina', 'emoção não importa',
    'ciência está errada', 'único protocolo eficaz', 'bio-hacking resolve tudo',
    'números não mentem', 'estude sozinho melhor', 'médico não entende',
    'você é exceção', 'normal não aplica', 'mainstream é falso',
    'algoritmo sabe melhor', 'causalidade é óbvia', 'correlação prova tudo'
  ]
};

export function auditOutput(
  output: string,
  schema?: string,
  persona?: Persona
): AuditResult {
  const reasons: string[] = [];
  let passed = true;

  if (!output || typeof output !== 'string') {
    return {
      passed: false,
      reasons: ['Output não é string válida'],
      confidence: 0
    };
  }

  const lowerContent = output.toLowerCase();

  if (persona && BANNED_PHRASES[persona]) {
    for (const phrase of BANNED_PHRASES[persona]) {
      const regex = new RegExp(`\\b${phrase.toLowerCase()}\\b`, 'gi');
      if (regex.test(lowerContent)) {
        reasons.push(`[${persona}] Frase proibida: "${phrase}"`);
        passed = false;
      }
    }
  } else {
    for (const [p, phrases] of Object.entries(BANNED_PHRASES)) {
      for (const phrase of phrases) {
        const regex = new RegExp(`\\b${phrase.toLowerCase()}\\b`, 'gi');
        if (regex.test(lowerContent)) {
          reasons.push(`[${p}] Frase proibida: "${phrase}"`);
          passed = false;
        }
      }
    }
  }

  if (schema) {
    try {
      JSON.parse(output);
    } catch {
      reasons.push('Output não é JSON válido conforme schema');
      passed = false;
    }
  }

  const lengthValid = output.length > 0 && output.length < 10000;
  if (!lengthValid) {
    reasons.push('Output fora do intervalo esperado (0-10000 chars)');
    passed = false;
  }

  const confidence = passed ? 100 : Math.max(0, 100 - reasons.length * 20);

  return {
    passed,
    reasons: reasons.length > 0 ? reasons : undefined,
    confidence: Math.round(confidence)
  };
}

export function getBannedPhrasesForPersona(persona: Persona): string[] {
  return BANNED_PHRASES[persona] || [];
}
