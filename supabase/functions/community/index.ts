import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiter (simple in-memory)
const rateLimits = new Map<string, { count: number; reset: number }>();

function checkRateLimit(userId: string, limit = 10): boolean {
  const now = Date.now();
  const userLimit = rateLimits.get(userId);

  if (!userLimit || userLimit.reset < now) {
    rateLimits.set(userId, { count: 1, reset: now + 60000 });
    return true;
  }

  if (userLimit.count >= limit) {
    return false;
  }

  userLimit.count++;
  return true;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    const authHeader = req.headers.get('authorization');

    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: corsHeaders }
      );
    }

    // Extract user ID from JWT (simplified)
    const token = authHeader.replace('Bearer ', '');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: corsHeaders }
      );
    }

    const userId = user.id;

    // Rate limit check
    if (!checkRateLimit(userId, 10)) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Max 10 requests/min' }),
        { status: 429, headers: corsHeaders }
      );
    }

    // Routes
    if (req.method === 'POST' && action === 'create_post') {
      return await createPost(supabase, userId, req);
    }

    if (req.method === 'POST' && action === 'create_reply') {
      return await createReply(supabase, userId, req);
    }

    if (req.method === 'GET' && action === 'get_helpers') {
      return await getHelpers(supabase, userId);
    }

    if (req.method === 'POST' && action === 'rate_reply') {
      return await rateReply(supabase, userId, req);
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: corsHeaders }
    );
  } catch (err) {
    console.error('Function error:', err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: corsHeaders }
    );
  }
});

async function createPost(supabase: any, userId: string, req: Request) {
  const { title, content, category } = await req.json();

  if (!title || !content) {
    return new Response(
      JSON.stringify({ error: 'Missing title or content' }),
      { status: 400, headers: corsHeaders }
    );
  }

  const { data, error } = await supabase
    .from('community_posts')
    .insert({
      user_id: userId,
      title: title.trim(),
      content: content.trim(),
      category: category || 'GERAL',
      tags: [],
      view_count: 0,
      reply_count: 0,
      helpful_count: 0,
    })
    .select()
    .single();

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: corsHeaders }
    );
  }

  return new Response(
    JSON.stringify({ success: true, data }),
    { status: 201, headers: corsHeaders }
  );
}

async function createReply(supabase: any, userId: string, req: Request) {
  const { postId, content } = await req.json();

  if (!postId || !content) {
    return new Response(
      JSON.stringify({ error: 'Missing postId or content' }),
      { status: 400, headers: corsHeaders }
    );
  }

  const { data, error } = await supabase
    .from('community_replies')
    .insert({
      post_id: postId,
      user_id: userId,
      content: content.trim(),
      rating: null,
      helpful_count: 0,
      is_marked_solution: false,
    })
    .select()
    .single();

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: corsHeaders }
    );
  }

  // Update post reply_count
  await supabase.rpc('increment_reply_count', { post_id: postId });

  return new Response(
    JSON.stringify({ success: true, data }),
    { status: 201, headers: corsHeaders }
  );
}

async function getHelpers(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from('community_helper_stats')
    .select('user_id, reply_count, average_rating, helpful_count')
    .order('average_rating', { ascending: false })
    .limit(10);

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: corsHeaders }
    );
  }

  return new Response(
    JSON.stringify({ success: true, helpers: data }),
    { status: 200, headers: corsHeaders }
  );
}

async function rateReply(supabase: any, userId: string, req: Request) {
  const { replyId, rating } = await req.json();

  if (!replyId || !rating) {
    return new Response(
      JSON.stringify({ error: 'Missing replyId or rating' }),
      { status: 400, headers: corsHeaders }
    );
  }

  // Check if rating exists
  const { data: existing } = await supabase
    .from('community_ratings')
    .select('id')
    .eq('reply_id', replyId)
    .eq('user_id', userId)
    .single();

  if (existing) {
    const { error } = await supabase
      .from('community_ratings')
      .update({ rating })
      .eq('id', existing.id);

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: corsHeaders }
      );
    }
  } else {
    const { error } = await supabase
      .from('community_ratings')
      .insert({ reply_id: replyId, user_id: userId, rating, helpful: false });

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: corsHeaders }
      );
    }
  }

  return new Response(
    JSON.stringify({ success: true }),
    { status: 200, headers: corsHeaders }
  );
}
