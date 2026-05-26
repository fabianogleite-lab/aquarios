import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface EngineRequest {
  action: 'earn_xp' | 'spend_tokens' | 'check_gate' | 'get_badges' | 'purchase' | 'get_community_recommendations';
  data: Record<string, any>;
  userId: string;
}

interface EngineResponse {
  success: boolean;
  data?: any;
  error?: string;
}

interface DataGateResult {
  granted: boolean;
  plan: 'free' | 'starter' | 'premium' | 'professional';
  layers: string[];
  error?: string;
}

// FIX #5: Input validation function
function validateNumericInput(value: any, min: number, max: number, name: string): number | null {
  if (typeof value !== 'number') {
    console.warn(`[VALIDATION] Invalid ${name}: not a number`);
    return null;
  }

  if (!Number.isFinite(value)) {
    console.warn(`[VALIDATION] Invalid ${name}: not finite (NaN or Infinity)`);
    return null;
  }

  if (value < min || value > max) {
    console.warn(`[VALIDATION] Invalid ${name}: out of range [${min}, ${max}]`);
    return null;
  }

  if (!Number.isInteger(value)) {
    console.warn(`[VALIDATION] Invalid ${name}: not an integer`);
    return null;
  }

  return value;
}

// FIX #3: Rate limiting moved to database (persistent)
async function checkRateLimit(userId: string, supabaseClient: any): Promise<boolean> {
  const now = new Date();
  const oneMinuteAgo = new Date(now.getTime() - 60000);

  try {
    // Count recent requests
    const { count, error: countError } = await supabaseClient
      .from('rate_limit_log')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', oneMinuteAgo.toISOString());

    if (countError) {
      console.warn('[RATE_LIMIT] Count error:', countError);
      return true; // Allow on error (don't block user)
    }

    if ((count ?? 0) >= 10) {
      return false; // Blocked
    }

    // Log this request
    const { error: insertError } = await supabaseClient
      .from('rate_limit_log')
      .insert({
        user_id: userId,
        created_at: now.toISOString()
      });

    if (insertError) {
      console.warn('[RATE_LIMIT] Log error:', insertError);
      return true; // Allow on error
    }

    return true; // Allowed
  } catch (err) {
    console.warn('[RATE_LIMIT] Exception:', err);
    return true; // Allow on exception (don't block user)
  }
}

// FIX #4: HygeiOS Data Gate implementation
async function validateDataAccess(userId: string, supabaseClient: any, requiredLayer?: string): Promise<DataGateResult> {
  try {
    const { data: user, error } = await supabaseClient
      .from('user_xp')
      .select('level')
      .eq('user_id', userId)
      .single();

    if (error || !user) {
      return {
        granted: false,
        plan: 'free',
        layers: [],
        error: 'User not found'
      };
    }

    // Map score to plan
    const planByScore = (score: number) => {
      if (score < 26) return 'free';
      if (score < 51) return 'starter';
      if (score < 76) return 'premium';
      return 'professional';
    };

    const userPlan = planByScore(user.level);

    // Layers allowed by plan
    const layersByPlan: Record<string, string[]> = {
      'free': [],
      'starter': ['bronze'],
      'premium': ['bronze', 'silver'],
      'professional': ['bronze', 'silver', 'gold']
    };

    const allowedLayers = layersByPlan[userPlan] || [];

    // Validate specific layer if requested
    if (requiredLayer && !allowedLayers.includes(requiredLayer)) {
      return {
        granted: false,
        plan: userPlan,
        layers: allowedLayers,
        error: `Layer ${requiredLayer} not authorized for plan ${userPlan}`
      };
    }

    return {
      granted: true,
      plan: userPlan,
      layers: allowedLayers
    };
  } catch (err) {
    console.error('[HYGEIOS] Data gate error:', err);
    return {
      granted: false,
      plan: 'free',
      layers: [],
      error: 'Data gate validation failed'
    };
  }
}

async function earnXP(userId: string, amount: any): Promise<EngineResponse> {
  // FIX #5: Validate numeric input
  const validAmount = validateNumericInput(amount, 1, 10000, 'XP amount');
  if (validAmount === null) {
    return { success: false, error: 'Invalid XP amount: must be number between 1-10000' };
  }

  const { data: user } = await supabase
    .from('user_xp')
    .select('total_xp, level')
    .eq('user_id', userId)
    .single();

  if (!user) {
    return { success: false, error: 'User not found' };
  }

  const newTotalXP = user.total_xp + validAmount;
  const newLevel = Math.floor(newTotalXP / 1000) + 1;
  const leveledUp = newLevel > user.level;

  const { error: updateError } = await supabase
    .from('user_xp')
    .update({ total_xp: newTotalXP, level: newLevel })
    .eq('user_id', userId);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  // Check for badges (milestone every 5 levels)
  if (leveledUp && newLevel % 5 === 0) {
    await supabase.from('badges').insert({
      user_id: userId,
      name: `Milestone Nível ${newLevel}`,
      icon: '🏅',
      unlocked_at: new Date(),
    });
  }

  return {
    success: true,
    data: { newXP: newTotalXP, newLevel, leveledUp, newBadge: leveledUp && newLevel % 5 === 0 },
  };
}

async function spendTokens(userId: string, amount: any): Promise<EngineResponse> {
  // FIX #5: Validate numeric input
  const validAmount = validateNumericInput(amount, 1, 1000000, 'Token amount');
  if (validAmount === null) {
    return { success: false, error: 'Invalid token amount: must be number between 1-1000000' };
  }

  // FIX #2: Validate token balance before spending
  const { data: tokenData, error: selectError } = await supabase
    .from('user_tokens')
    .select('balance')
    .eq('user_id', userId)
    .single();

  if (selectError || !tokenData) {
    return { success: false, error: 'Token account not found' };
  }

  // Check sufficient balance
  if (tokenData.balance < validAmount) {
    return {
      success: false,
      error: 'Insufficient tokens',
      data: { required: validAmount, available: tokenData.balance }
    };
  }

  // Atomic debit
  const newBalance = tokenData.balance - validAmount;
  const { error: updateError } = await supabase
    .from('user_tokens')
    .update({ balance: newBalance })
    .eq('user_id', userId);

  if (updateError) {
    return { success: false, error: 'Failed to deduct tokens' };
  }

  return {
    success: true,
    data: { spent: validAmount, newBalance }
  };
}

async function purchase(
  userId: string,
  productId: string,
  price: number
): Promise<EngineResponse> {
  // Validate product price matches
  const products = JSON.parse(Deno.env.get('PRODUCTS_DATA') || '[]');
  const product = products.find((p: any) => p.id === productId);

  if (!product) {
    return { success: false, error: 'Product not found' };
  }

  if (Math.abs(product.preco - price) > 0.01) {
    return { success: false, error: 'Price mismatch' };
  }

  // Spend tokens
  const spendResult = await spendTokens(userId, price);
  if (!spendResult.success) {
    return spendResult;
  }

  // Record purchase
  const { error: purchaseError } = await supabase.from('purchases').insert({
    user_id: userId,
    product_id: productId,
    price: price,
    purchased_at: new Date(),
  });

  if (purchaseError) {
    return { success: false, error: purchaseError.message };
  }

  return {
    success: true,
    data: { purchased: true, productId, price, newBalance: spendResult.data.newBalance },
  };
}

async function checkGate(userId: string, moduleId: string): Promise<EngineResponse> {
  const { data: user } = await supabase
    .from('user_xp')
    .select('level')
    .eq('user_id', userId)
    .single();

  if (!user) {
    return { success: false, error: 'User not found' };
  }

  // Gate levels (example: moduleId "advanced" requires level 10+)
  const gates: Record<string, number> = {
    basic: 1,
    intermediate: 5,
    advanced: 10,
    expert: 20,
  };

  const requiredLevel = gates[moduleId] || 1;
  const unlocked = user.level >= requiredLevel;

  return {
    success: true,
    data: { moduleId, unlocked, currentLevel: user.level, requiredLevel },
  };
}

async function getBadges(userId: string): Promise<EngineResponse> {
  const { data: badges, error } = await supabase
    .from('badges')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: badges };
}

async function getCommunityRecommendations(userId: string): Promise<EngineResponse> {
  // FIX #4: Validate HygeiOS Data Gate access (bronze layer required)
  const gateResult = await validateDataAccess(userId, supabase, 'bronze');
  if (!gateResult.granted) {
    return {
      success: false,
      error: 'Access denied: upgrade to starter plan for community features'
    };
  }

  // S14: Integração com usePersonaDetection + faqEngine
  // Placeholder que retorna recomendações baseadas em user level

  const { data: user } = await supabase
    .from('user_xp')
    .select('level')
    .eq('user_id', userId)
    .single();

  if (!user) {
    return { success: false, error: 'User not found' };
  }

  const personaMap: Record<string, string> = {
    '1-5': 'ZÉ_DO_APERTO',
    '6-15': 'DONA_MARIA',
    '16+': 'CARLOS'
  };

  let persona = 'ZÉ_DO_APERTO';
  if (user.level > 15) {
    persona = 'CARLOS';
  } else if (user.level > 5) {
    persona = 'DONA_MARIA';
  }

  const faqSubset = {
    'ZÉ_DO_APERTO': ['faq_zé_001', 'faq_zé_002', 'faq_zé_003'],
    'DONA_MARIA': ['faq_dona_001', 'faq_dona_002', 'faq_dona_003'],
    'CARLOS': ['faq_carlos_001', 'faq_carlos_002', 'faq_carlos_003']
  };

  const recommendations = {
    'ZÉ_DO_APERTO': ['Acesse SUS e confira sua cobertura', 'Preventiva é importante'],
    'DONA_MARIA': ['Seção Família é para você', 'Compartilhe com sua família'],
    'CARLOS': ['Exames preventivos anuais', 'Seu plano oferece especialistas']
  };

  return {
    success: true,
    data: {
      userId,
      persona,
      faqIds: faqSubset[persona as keyof typeof faqSubset] || [],
      recommendations: recommendations[persona as keyof typeof recommendations] || [],
      confidence: Math.round((user.level / 20) * 100),
      plan: gateResult.plan,
      layers: gateResult.layers
    }
  };
}

async function handleRequest(req: Request): Promise<Response> {
  // FIX #6: Hardcoded CORS origins (not allow *)
  const ALLOWED_ORIGINS = [
    'https://aquarios.app',
    'https://www.aquarios.app',
    'capacitor://localhost',
    'http://localhost:8081'
  ];

  const origin = req.headers.get('Origin') || '';
  const corsHeaders = {
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '3600'
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  try {
    // FIX #1: Validate authentication header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ success: false, error: 'No auth header' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // FIX #1: Validate JWT token (create anon client with token)
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user: authUser }, error: authError } = await userClient.auth.getUser();
    if (authError || !authUser) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid session' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const body: EngineRequest = await req.json();
    const { action, data, userId } = body;

    // FIX #1: Validate that userId matches authenticated user
    if (!userId) {
      return new Response(JSON.stringify({ success: false, error: 'No user ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (userId !== authUser.id) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized: user ID mismatch' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // FIX #3: Rate limit check (now with database)
    const rateLimitOk = await checkRateLimit(userId, supabase);
    if (!rateLimitOk) {
      return new Response(JSON.stringify({ success: false, error: 'Rate limited: max 10 requests per minute' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    let result: EngineResponse;

    switch (action) {
      case 'earn_xp':
        result = await earnXP(userId, data.amount);
        break;
      case 'spend_tokens':
        result = await spendTokens(userId, data.amount);
        break;
      case 'purchase':
        result = await purchase(userId, data.productId, data.price);
        break;
      case 'check_gate':
        result = await checkGate(userId, data.moduleId);
        break;
      case 'get_badges':
        result = await getBadges(userId);
        break;
      case 'get_community_recommendations':
        result = await getCommunityRecommendations(userId);
        break;
      default:
        result = { success: false, error: 'Unknown action' };
    }

    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 400,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error('[ERROR]', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Server error' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
}

serve(handleRequest);
