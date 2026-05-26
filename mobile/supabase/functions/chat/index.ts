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

    const { messages, persona, locale } = await req.json();
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
        system: (() => {
          const base = PERSONAS[persona as keyof typeof PERSONAS];
          const addendum = getCulturalAddendum(locale as string);
          return addendum ? `${base}\n\nVoz Cultural Ativa: ${addendum}` : base;
        })(),
        messages,
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
