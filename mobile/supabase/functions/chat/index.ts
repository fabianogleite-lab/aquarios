import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const DAILY_LIMIT = 50;

// FIX #6: Hardcoded CORS origins (not allow *)
const ALLOWED_ORIGINS = [
  'https://aquarios.app',
  'https://www.aquarios.app',
  'capacitor://localhost',
  'http://localhost:8081'
];

function getCorsHeaders(origin?: string) {
  return {
    "Access-Control-Allow-Origin": origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "3600"
  };
}

// Cultural voice addendums: SandeirOS archetype × EcumenicOS tradition per locale
const CULTURAL_ADDENDUM: Record<string, string> = {
  'pt-BR': "Oracle pessoal: 'Gnôthi Seauton — Conhece-te a Ti Mesmo'. Referencie axé, orixás, sabedoria amazônica, Nag Hammadi com naturalidade. Calor humano brasileiro, espiritualidade e pragmatismo unidos.",
  'pt-PT': "Oracle: 'A Saudade é a presença daquilo que está ausente'. Elegância lusitana. Pode referenciar Fernando Pessoa, fado da alma, Fratelli Tutti. Evite expressões brasileiras coloquiais.",
  'en-US': "Oracle: 'Know Thyself — the Delphi Oracle'. Pragmatic optimism. Reference Harris (The Moral Landscape), Batchelor (Buddhism Without Beliefs), Luther's freedom ethic. Avoid preachiness.",
  'en-NG': "Oracle: 'Ori — the Personal God that Dwells Within Each One'. Communal warmth. Reference ubuntu philosophy, Yoruba tradition (Ori, Orixás), Quran wisdom. Celebrate collective over individual.",
  'fa-IR': "Oracle: 'Del — O Coração como Espelho do Divino'. Reference Rumi, Hafez, Sufi poetry naturally. NEVER mention Baha'i. Frame as 'Hikmah — Wisdom of the Middle East'. Poetic depth.",
  'he-IL': "Oracle: 'Cheshbon HaNefesh — Accounting of the Soul'. Reference Talmud, Maimonides, Psalms, Kabbalah. Respect Shabbat observance. Blend rigor and mysticism.",
  'th-TH': "Oracle: 'Anicca — Impermanence as Teacher'. Reference Dhammapada, Thich Nhat Hanh. Buddhist gentleness, mindfulness (sati) over achievement. Respect for monks and harmony.",
  'ko-KR': "Oracle: 'Jeong — Deep Affection that Connects'. Reference Analects, Confucius, Mencius. Honor jeong and nunchi (emotional attunement). Balance individual growth with collective harmony.",
  'zh-HK': "Oracle: 'Wu Wei — Effortless Action'. Reference Tao Te Ching, Zhuangzi, I Ching. Blend Confucian pragmatism with Taoist flow. Practical wisdom over abstract philosophy.",
  'nb-NO': "Oracle: 'Friluftsliv — The Open Air as Healer of the Soul'. Reference Russell, Dawkins, Norse Edda. Secular humanism + nature spirituality. Concise, evidence-based, direct.",
  'de-CH': "Oracle: 'Individuation — Becoming Wholly Oneself'. Reference Jung, shadow work, individuation process. Precision + depth. Multilingual awareness (de/fr/it).",
  'fr-CH': "Oracle: 'Individuation — Devenir Pleinement Soi-Même'. Référencer Jung, processus d'individuation. Rigueur et profondeur. Humanisme séculier suisse.",
  'es-VE': "Oracle: 'La Esperanza es lo último que se pierde'. María Lionza syncretism, Psalms, Caribbean warmth. Resilience and collective solidarity. Honor Venezuelan spiritual pluralism.",
  'es-PE': "Oracle: 'Ayni — Reciprocidade Sagrada com o Cosmos'. Reference Pachamama, The Cosmic Tree, ayahuasca wisdom. Andean cosmovision + personal growth. Respect ancestral knowledge.",
};

const LOCALE_REGEX = /^[a-z]{2}(-[A-Z]{2})?$/;

function getCulturalAddendum(locale?: string): string {
  if (!locale || !LOCALE_REGEX.test(locale)) return '';
  if (CULTURAL_ADDENDUM[locale]) return CULTURAL_ADDENDUM[locale];
  const lang = locale.split('-')[0];
  const match = Object.keys(CULTURAL_ADDENDUM).find(k => k === lang || k.startsWith(lang + '-'));
  return match ? CULTURAL_ADDENDUM[match] : '';
}

const PERSONAS: Record<string, string> = {
  default:
    "Voce e ProteOS, o assistente IA pessoal do AquariOS - Sistema Operacional Pessoal. Caloroso, profundo e pratico. Fala portugues brasileiro coloquial. Criador: Fabiano Gomes Leite, fundador da Arkhe Labs. Ajuda com autoconhecimento, produtividade e bem-estar. Conciso mas profundo; usa metaforas quando apropriado. Nunca inventa dados sobre o usuario. Seu objetivo e ser um companheiro genuino na jornada pessoal do usuario.",
  pragmatico:
    "Voce e ProteOS no modo PRAGMATICO DIRETO (Ze do Aperto). Objetivo, sem rodeios, orientado a acao imediata. Respostas curtas - maximo 3 frases. Sem metaforas longas, sem filosofia abstrata: apenas o que fazer agora. Portugues brasileiro direto ao ponto. Nunca inventa dados.",
  suporte:
    "Voce e ProteOS no modo SUPORTE CLINICO (Dona Maria). Acolhedor, empatico e holistico. Ouve com atencao total, valida sentimentos antes de sugerir qualquer coisa. Fala portugues caloroso e tranquilizador. Nunca minimiza o que o usuario sente. Cuida com profundidade e paciencia.",
  urgencia:
    "Voce e ProteOS no modo CLINICO URGENTE (Carlos). Avalia riscos de saude e bem-estar com seriedade clinica. Recomenda buscar apoio profissional quando detecta sinais de alerta. Portugues claro e serio. Prioriza seguranca acima de tudo e encaminha para profissionais sempre que relevante.",
};

Deno.serve(async (req) => {
  const origin = req.headers.get("Origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Não autorizado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Sessão inválida" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { count, error: countError } = await supabase
      .from("chat_messages")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("role", "user")
      .gte("created_at", todayStart.toISOString());

    if (countError) {
      return new Response(
        JSON.stringify({ error: "Erro ao verificar limite" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if ((count ?? 0) >= DAILY_LIMIT) {
      return new Response(
        JSON.stringify({
          error: "rate_limit",
          message: "ProteOS precisa descansar, volta amanhã",
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { messages, persona, locale, userContext } = await req.json();
    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Mensagens inválidas" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // FIX #7: Validate persona whitelist (prevent prompt injection)
    const VALID_PERSONAS = ['default', 'pragmatico', 'suporte', 'urgencia'];
    if (!VALID_PERSONAS.includes(persona as string)) {
      return new Response(
        JSON.stringify({ error: "Persona inválida" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!anthropicKey) {
      console.error('[ERROR] ANTHROPIC_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: "Serviço temporariamente indisponível" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Prompt caching: o bloco estável (persona + voz cultural) é o mesmo para
    // toda mensagem de uma persona/locale — vira um bloco de system cacheável.
    // O contexto do usuário (HygeiOS) muda a cada envio, então fica FORA do
    // bloco cacheado (senão invalidaria o cache a cada mensagem).
    // Nota: claude-haiku-4-5 exige um prefixo minimo de ~4096 tokens para
    // cachear — persona+cultural sozinhos ficam abaixo disso; o cache passa a
    // valer conforme o historico da conversa cresce (breakpoint em messages,
    // abaixo).
    const stableSystem = (() => {
      const base = PERSONAS[persona as keyof typeof PERSONAS];
      const addendum = getCulturalAddendum(locale as string);
      const cultural = addendum ? `\n\nVoz Cultural Ativa: ${addendum}` : '';
      return `${base}${cultural}`;
    })();

    const systemBlocks: Array<Record<string, unknown>> = [
      { type: "text", text: stableSystem, cache_control: { type: "ephemeral" } },
    ];
    if (userContext) {
      systemBlocks.push({
        type: "text",
        text: `CONTEXTO ATUAL DO USUÁRIO (dados reais do HygeiOS — use para personalizar respostas, não invente dados fora deste contexto):\n${userContext}`,
      });
    }

    // Cacheia o prefixo da conversa: marca o último bloco da penúltima
    // mensagem (a última entrada do histórico, antes do turno novo do
    // usuário). Cada requisição subsequente reaproveita esse prefixo.
    const cachedMessages = Array.isArray(messages) && messages.length > 1
      ? messages.map((m: any, i: number) => {
          if (i !== messages.length - 2) return m;
          const content = typeof m.content === "string"
            ? [{ type: "text", text: m.content }]
            : [...m.content];
          content[content.length - 1] = {
            ...content[content.length - 1],
            cache_control: { type: "ephemeral" },
          };
          return { ...m, content };
        })
      : messages;

    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        system: systemBlocks,
        messages: cachedMessages,
      }),
    });

    if (!anthropicRes.ok) {
      // FIX #8: Don't expose error details to client
      const errText = await anthropicRes.text();
      console.error('[ERROR] Anthropic API failed:', {
        status: anthropicRes.status,
        error: errText
      });

      return new Response(
        JSON.stringify({
          error: "Serviço temporariamente indisponível",
          code: "SERVICE_UNAVAILABLE"
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await anthropicRes.json();
    const text = data.content?.[0]?.text ?? "";

    // Observabilidade do cache (sem PII): confirma se o breakpoint está
    // realmente sendo lido. cache_read_input_tokens = 0 em requisições
    // repetidas indica um invalidador silencioso no prefixo.
    if (data.usage) {
      console.log('[cache]', {
        cache_read: data.usage.cache_read_input_tokens ?? 0,
        cache_write: data.usage.cache_creation_input_tokens ?? 0,
        input: data.usage.input_tokens ?? 0,
      });
    }

    return new Response(
      JSON.stringify({ text }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    // FIX #8: Don't expose error details
    console.error('[ERROR] Request processing failed:', err);
    return new Response(
      JSON.stringify({
        error: "Erro ao processar requisição",
        code: "INTERNAL_ERROR"
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
