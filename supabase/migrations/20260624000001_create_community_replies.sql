-- Create community_replies table
CREATE TABLE IF NOT EXISTS public.community_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    rating INT,
    helpful_count INT DEFAULT 0,
    is_marked_solution BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for queries by post_id
CREATE INDEX IF NOT EXISTS idx_community_replies_post_id ON public.community_replies(post_id);
CREATE INDEX IF NOT EXISTS idx_community_replies_user_id ON public.community_replies(user_id);

-- Enable RLS
ALTER TABLE public.community_replies ENABLE ROW LEVEL SECURITY;

-- Policies: anyone can read, authenticated users can insert their own, service_role can do anything
DROP POLICY IF EXISTS "Anyone can read replies" ON public.community_replies;
DROP POLICY IF EXISTS "Users can insert own replies" ON public.community_replies;

CREATE POLICY "Anyone can read replies" ON public.community_replies
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own replies" ON public.community_replies
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role full access" ON public.community_replies
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
