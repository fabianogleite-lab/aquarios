const ALLOWED_ORIGINS = [
  'https://aquarios.app',
  'https://www.aquarios.app',
  'capacitor://localhost',
  'http://localhost:8081',
];

function getCorsHeaders(origin?: string) {
  return {
    'Access-Control-Allow-Origin': origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '3600',
  };
}

const SYSTEM_PROMPT = `Você é um nutricionista especialista em alimentos brasileiros com vasta experiência em estimativa visual de porções.

Analise a imagem fornecida e identifique o alimento ou refeição visível.

Retorne APENAS um objeto JSON válido, sem markdown, sem explicações, sem texto extra. Apenas o JSON puro:

{
  "name": "Nome descritivo do alimento ou refeição (ex: Prato de arroz com feijão e frango grelhado)",
  "calories": 450,
  "protein": 35.0,
  "carbs": 48.0,
  "fat": 12.0,
  "fiber": 4.5,
  "estimated_grams": 380,
  "confidence": "alta",
  "notes": "Estimativa visual baseada no tamanho aparente da porção"
}

Regras obrigatórias:
- calories, protein, carbs, fat, fiber: valores TOTAIS para a porção VISÍVEL, não por 100g
- estimated_grams: peso total estimado da porção em gramas
- confidence: "alta" (alimento claramente identificado), "média" (identificado com incerteza), "baixa" (estimativa aproximada)
- notes: observação curta sobre a estimativa (máx 80 caracteres)
- Se a imagem não contiver alimento ou não for possível identificar, retorne: {"error": "Não foi possível identificar um alimento nesta imagem"}
- Todos os valores numéricos devem ser números, não strings
- Considera porções típicas brasileiras (prato feito: ~400-500g, lanche: ~150-250g, fruta: peso real visível)`;

Deno.serve(async (req) => {
  const origin = req.headers.get('Origin') ?? undefined;
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Não autorizado' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!anthropicKey) {
      return new Response(JSON.stringify({ error: 'Serviço indisponível' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { imageBase64, mimeType } = await req.json();

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return new Response(JSON.stringify({ error: 'Imagem não fornecida' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const safeMimeType = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(mimeType)
      ? mimeType
      : 'image/jpeg';

    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 512,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: { type: 'base64', media_type: safeMimeType, data: imageBase64 },
              },
              { type: 'text', text: 'Analise este alimento e retorne o JSON nutricional.' },
            ],
          },
        ],
      }),
    });

    if (!anthropicRes.ok) {
      console.error('[food-vision] Anthropic error:', anthropicRes.status);
      return new Response(JSON.stringify({ error: 'Serviço de análise indisponível' }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await anthropicRes.json();
    const rawText = data.content?.[0]?.text ?? '';

    let result: Record<string, unknown>;
    try {
      // Strip possible markdown code fences
      const clean = rawText.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
      result = JSON.parse(clean);
    } catch {
      console.error('[food-vision] JSON parse failed:', rawText);
      return new Response(JSON.stringify({ error: 'Não foi possível interpretar a resposta da IA' }), {
        status: 422,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[food-vision] Unexpected error:', err);
    return new Response(JSON.stringify({ error: 'Erro interno' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
