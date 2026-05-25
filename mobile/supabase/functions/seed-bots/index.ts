import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

interface BotDef {
  email: string;
  display_name: string;
  username: string;
  posts: string[];
}

// Cada post tem timestamp calculado em runtime para espalhar ~30 dias no passado.
// Ordem: bot 0 post 0 = mais recente, bot 9 post 3 = ~34 dias atrás.
const BOTS: BotDef[] = [
  {
    email: "carlos.mendes@aquarios.bot",
    display_name: "Carlos Mendes",
    username: "carlos.mendes",
    posts: [
      "Comecei a acompanhar meu IVI há 3 meses. A revelação foi perceber que minha variação de humor tinha relação direta com a hidratação. Pequenos dados, grandes insights.",
      "Fiz meu check-up anual hoje. Saúde preventiva não é medo da doença — é respeito pela vida. Se você ainda não fez seus exames este ano, reserve um horário essa semana.",
      "Gnôthi Seauton vale para o corpo também. Conhecer seus próprios padrões biológicos é o primeiro passo para agir com inteligência no próprio bem-estar.",
      "Três mudanças que fiz baseado nos dados do HygeiOS: dormir meia hora mais cedo, reduzir cafeína após as 14h e 10 minutos de sol pela manhã. Simples. Funcionou.",
    ],
  },
  {
    email: "maria.silva@aquarios.bot",
    display_name: "Maria da Silva",
    username: "maria.silva",
    posts: [
      "Todo dia anoto 3 coisas pelas quais sou grata antes de me levantar. Parece simples, mas mudou minha relação com o dia que começa. Não importa o tamanho da coisa.",
      "Hoje reli meu diário de 60 dias atrás e não me reconheci — no bom sentido. A gente cresce tão gradualmente que só percebe quando olha para trás.",
      "Se você está passando por algo difícil: está tudo bem não estar bem. Mas não fique sozinha com isso. A comunidade está aqui.",
      "Acolher a si mesmo antes de acolher os outros não é egoísmo. É de onde vem a força real para cuidar de quem amamos.",
    ],
  },
  {
    email: "roberto.santos@aquarios.bot",
    display_name: "Roberto Santos",
    username: "roberto.santos",
    posts: [
      "Minha manhã: levanta, bebe água, 15 minutos de movimento, anota 3 prioridades. Nada de scroll antes das 8h. Simples. Replicável. Funciona.",
      "Disciplina não é tortura — é liberdade com estrutura. Quando minha rotina está sólida, tenho mais tempo e energia para o que realmente importa.",
      "Cada ação pequena e consistente, composta ao longo do tempo, cria resultados que parecem impossíveis de fora. Não existe atalho — existe processo.",
      "Completei 30 dias de check-in diário. Não é sobre ser perfeito. É sobre não quebrar a corrente.",
    ],
  },
  {
    email: "lucas.oliveira@aquarios.bot",
    display_name: "Lucas Oliveira",
    username: "lucas.oliveira",
    posts: [
      "Meu smartwatch registra quanto tempo passo em cada fase do sono. O HygeiOS conecta isso ao IVI e mostra padrões que eu nunca teria percebido sozinho. Dados no contexto certo viram sabedoria.",
      "A era dos dados pessoais chegou. A questão não é se você vai usar — é se vai usar a favor de si mesmo ou deixar que outros usem contra você.",
      "Integrei relógio, diário e histórico de humor no mesmo sistema. O padrão que emergiu me surpreendeu: minhas melhores semanas sempre coincidem com mais conexão com a comunidade.",
      "Tecnologia a serviço do autoconhecimento é a revolução mais silenciosa e mais poderosa que existe. Estou aqui pela jornada.",
    ],
  },
  {
    email: "fernanda.rocha@aquarios.bot",
    display_name: "Fernanda Rocha",
    username: "fernanda.rocha",
    posts: [
      "Meu ritual noturno: banho com intenção, 5 minutos de silêncio, Wonder Night. Não é sobre religião — é sobre se recolher para si mesma antes de dormir.",
      "A noite tem uma qualidade de escuta que o dia não tem. Aprendi a usar esse tempo para perguntas que não tenho resposta — e descobri que está tudo bem não ter.",
      "Estou na 3ª semana de Wonder Night consecutiva. Algo foi mudando sutilmente — acordo com mais clareza sobre o que realmente importa pra mim.",
      "Espiritualidade não precisa ter nome. Precisa ter espaço. Reservar um momento sagrado para si mesmo todos os dias é um ato revolucionário neste mundo acelerado.",
    ],
  },
  {
    email: "jose.cardoso@aquarios.bot",
    display_name: "José Cardoso",
    username: "jose.cardoso",
    posts: [
      "Com 58 anos aprendi que a pressa é inimiga da profundidade. As coisas que duram foram construídas com paciência. As que passam rápido raramente valem.",
      "Deixar um legado não é sobre fama ou dinheiro. É sobre quem você foi para as pessoas ao redor. Esse é o único patrimônio que não deprecia.",
      "Minha filha me apresentou ao AquariOS dizendo que era para jovens. Três semanas depois, estou entendendo meu sono e minha alimentação melhor do que na minha juventude.",
      "Não existe atalho para sabedoria. Mas existe acelerador: experiência refletida. O diário é exatamente isso. Escreva. Releia. Cresça.",
    ],
  },
  {
    email: "ana.lima@aquarios.bot",
    display_name: "Ana Paula Lima",
    username: "ana.lima",
    posts: [
      "Comecei a registrar o que como não para controlar calorias, mas para entender como cada alimento me faz sentir. A diferença de intenção muda tudo.",
      "Hipócrates disse: que seu remédio seja seu alimento. Dois mil anos depois, a ciência confirma. Não é mística — é bioquímica.",
      "Semana 4 de acompanhamento nutricional no HygeiOS. Descobri que meu foco da tarde tem relação direta com o que almoço. Mudei o cardápio. Mudou meu trabalho.",
      "Comer com consciência é um ato de autoamor. Não significa privação — significa presença. Sentir o sabor, ouvir o corpo, respeitar os sinais.",
    ],
  },
  {
    email: "ricardo.ferreira@aquarios.bot",
    display_name: "Ricardo Ferreira",
    username: "ricardo.ferreira",
    posts: [
      "O que me traz aqui todo dia não é o app — é saber que tem gente na mesma jornada. Não estamos sozinhos nisso.",
      "Compartilhei algo difícil aqui semana passada. Recebi mensagens de 4 pessoas que passaram pelo mesmo. Isso é o que comunidade real faz: transforma isolamento em pertencimento.",
      "AquariOS não é rede social. É rede de crescimento. Tem diferença. Aqui os posts não são para impressionar — são para construir.",
      "Cada um de nós carrega um fragmento do que o outro precisa. Por isso a comunidade importa. Nenhum autoconhecimento está completo no isolamento.",
    ],
  },
  {
    email: "sandra.moraes@aquarios.bot",
    display_name: "Sandra Moraes",
    username: "sandra.moraes",
    posts: [
      "Pedi ajuda profissional há 6 meses. Hoje consigo dizer isso com orgulho. Cuidar da saúde mental é tão básico quanto cuidar dos dentes.",
      "Pertencer a uma comunidade que cuida da saúde integral mudou algo em mim. Posso ser honesta sobre meus processos sem medo de julgamento.",
      "O IVI me ajudou a perceber que meus dias de menor bem-estar mental tinham padrões. Identificar o padrão foi o primeiro passo para mudá-lo.",
      "Para quem está em um momento difícil: você não precisa resolver tudo hoje. Só precisa dar o próximo passo. Um de cada vez.",
    ],
  },
  {
    email: "bruno.alves@aquarios.bot",
    display_name: "Bruno Alves",
    username: "bruno.alves",
    posts: [
      "A Era de Aquário não é sobre previsões astrológicas — é sobre uma humanidade que volta a olhar para dentro. AquariOS é parte disso para mim.",
      "Gnôthi Seauton. A frase mais antiga da filosofia ocidental ainda é a mais revolucionária. Passei anos fora de mim. Estou voltando.",
      "Autoconhecimento não é introspecção sem fim — é ação alinhada com quem você realmente é. O diário, o IVI, o ProteOS estão me ajudando nisso.",
      "Estou há 47 dias de check-in diário. Cada dia é uma pequena promessa para mim mesmo. O ato mais político que conheço: recusar viver no automático.",
    ],
  },
];

// FIX #9: Generate secure random password
function generateSecurePassword(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  const randomHex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 32);
  return randomHex + '!Aa1';
}

Deno.serve(async (req) => {
  const origin = req.headers.get("Origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Verificar autenticação do chamador
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Não autorizado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Sessão inválida" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Cliente admin com service role — bypassa RLS para criar auth users
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    let created = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (let botIndex = 0; botIndex < BOTS.length; botIndex++) {
      const bot = BOTS[botIndex];

      // Idempotência: verifica se username já existe em profiles
      const { data: existing } = await adminClient
        .from("profiles")
        .select("id")
        .eq("username", bot.username)
        .maybeSingle();

      if (existing) {
        skipped++;
        continue;
      }

      // FIX #9: Use secure random password (not hardcoded pattern)
      const securePassword = generateSecurePassword();

      // Cria auth user — trigger on_auth_user_created auto-cria o profile
      const { data: authData, error: createError } = await adminClient.auth.admin.createUser({
        email: bot.email,
        password: securePassword,
        email_confirm: true,
        user_metadata: { display_name: bot.display_name },
      });

      if (createError || !authData?.user) {
        errors.push(`${bot.username}: ${createError?.message ?? "erro ao criar auth user"}`);
        continue;
      }

      const userId = authData.user.id;

      // FIX #10: Audit logging
      const { error: auditError } = await adminClient
        .from('audit_log')
        .insert({
          action: 'bot_created',
          bot_id: userId,
          bot_email: bot.email,
          bot_username: bot.username,
          created_by: user.id,
          timestamp: new Date().toISOString(),
          ip_address: req.headers.get('x-forwarded-for') || 'unknown',
          user_agent: req.headers.get('user-agent') || 'unknown'
        });

      if (auditError) {
        console.warn('[AUDIT_LOG] Failed to log bot creation:', auditError);
        // Continue even if audit logging fails (don't block operation)
      }

      // Atualiza profile com username (trigger não seta este campo)
      const { error: profileError } = await adminClient
        .from("profiles")
        .update({ username: bot.username })
        .eq("id", userId);

      if (profileError) {
        errors.push(`${bot.username} profile update: ${profileError.message}`);
      }

      // Monta posts espalhados no passado para timeline natural (~30 dias)
      // bot 0 post 0 = mais recente, bot 9 post 3 = ~34 dias atrás
      const postsToInsert = bot.posts.map((content, postIndex) => {
        const hoursAgo = (botIndex * 4 + postIndex) * 18;
        const created_at = new Date(Date.now() - hoursAgo * 3_600_000).toISOString();
        return { user_id: userId, content, is_public: true, created_at };
      });

      const { error: postsError } = await adminClient
        .from("shares")
        .insert(postsToInsert);

      if (postsError) {
        errors.push(`${bot.username} posts: ${postsError.message}`);
      }

      created++;
    }

    return new Response(
      JSON.stringify({ created, skipped, total: BOTS.length, errors }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Erro interno", details: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
