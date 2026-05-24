import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface EngineRequest {
  action: 'earn_xp' | 'spend_tokens' | 'check_gate' | 'get_badges' | 'purchase';
  data: Record<string, any>;
  userId: string;
}

interface EngineResponse {
  success: boolean;
  data?: any;
  error?: string;
}

// Rate limiting: max 10 req/min per user
const rateLimitStore = new Map<string, number[]>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const oneMinuteAgo = now - 60000;

  if (!rateLimitStore.has(userId)) {
    rateLimitStore.set(userId, [now]);
    return true;
  }

  const timestamps = rateLimitStore.get(userId)!;
  const recentRequests = timestamps.filter((t) => t > oneMinuteAgo);

  if (recentRequests.length >= 10) {
    return false;
  }

  recentRequests.push(now);
  rateLimitStore.set(userId, recentRequests);
  return true;
}

async function earnXP(userId: string, amount: number): Promise<EngineResponse> {
  if (!amount || amount <= 0 || amount > 10000) {
    return { success: false, error: 'Invalid XP amount (0-10000)' };
  }

  const { data: user } = await supabase
    .from('user_xp')
    .select('total_xp, level')
    .eq('user_id', userId)
    .single();

  if (!user) {
    return { success: false, error: 'User not found' };
  }

  const newTotalXP = user.total_xp + amount;
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

async function spendTokens(userId: string, amount: number): Promise<EngineResponse> {
  if (!amount || amount <= 0) {
    return { success: false, error: 'Invalid token amount' };
  }

  // For now, assume unlimited tokens (production would check balance)
  // TODO S14: Integrar com tabela user_tokens quando DataCommunity estiver pronto

  return { success: true, data: { spent: amount, newBalance: 999999 } };
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

async function handleRequest(req: Request): Promise<Response> {
  // CORS headers
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body: EngineRequest = await req.json();
    const { action, data, userId } = body;

    // Validate auth
    if (!userId) {
      return new Response(JSON.stringify({ success: false, error: 'No user ID' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Rate limit check
    if (!checkRateLimit(userId)) {
      return new Response(JSON.stringify({ success: false, error: 'Rate limited' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
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
      default:
        result = { success: false, error: 'Unknown action' };
    }

    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Server error' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}

serve(handleRequest);
