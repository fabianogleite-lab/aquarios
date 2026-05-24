-- S15 — Community Tables Schema
-- Project: agebsmjsjrmazbozphnh

-- 1. community_posts (feed de perguntas/tópicos)
CREATE TABLE IF NOT EXISTS community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL, -- 'SAÚDE', 'BEM_ESTAR', 'VITALIDADE', 'GERAL'
  tags TEXT[] DEFAULT '{}',
  view_count INT DEFAULT 0,
  reply_count INT DEFAULT 0,
  helpful_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. community_replies (respostas dos helpers)
CREATE TABLE IF NOT EXISTS community_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  rating INT CHECK (rating >= 1 AND rating <= 5), -- 1-5 stars
  helpful_count INT DEFAULT 0,
  is_marked_solution BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. community_ratings (ratings de respostas)
CREATE TABLE IF NOT EXISTS community_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reply_id UUID NOT NULL REFERENCES community_replies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  helpful BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(reply_id, user_id) -- Um user só pode dar 1 rating por reply
);

-- 4. community_helper_stats (agregações de helpers)
CREATE TABLE IF NOT EXISTS community_helper_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  reply_count INT DEFAULT 0,
  average_rating FLOAT DEFAULT 0,
  helpful_count INT DEFAULT 0,
  total_helpful_ratings INT DEFAULT 0,
  last_reply_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- INDEXES
CREATE INDEX idx_community_posts_user_id ON community_posts(user_id);
CREATE INDEX idx_community_posts_category ON community_posts(category);
CREATE INDEX idx_community_posts_created_at ON community_posts(created_at DESC);
CREATE INDEX idx_community_replies_post_id ON community_replies(post_id);
CREATE INDEX idx_community_replies_user_id ON community_replies(user_id);
CREATE INDEX idx_community_replies_created_at ON community_replies(created_at DESC);
CREATE INDEX idx_community_ratings_reply_id ON community_ratings(reply_id);
CREATE INDEX idx_community_ratings_user_id ON community_ratings(user_id);

-- RLS POLICIES
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_helper_stats ENABLE ROW LEVEL SECURITY;

-- POSTS: Read all, Write own
CREATE POLICY "Posts readable by all" ON community_posts FOR SELECT USING (true);
CREATE POLICY "Posts writable by owner" ON community_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Posts updatable by owner" ON community_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Posts deletable by owner" ON community_posts FOR DELETE USING (auth.uid() = user_id);

-- REPLIES: Read all, Write own
CREATE POLICY "Replies readable by all" ON community_replies FOR SELECT USING (true);
CREATE POLICY "Replies writable by owner" ON community_replies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Replies updatable by owner" ON community_replies FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Replies deletable by owner" ON community_replies FOR DELETE USING (auth.uid() = user_id);

-- RATINGS: Read all, Write own
CREATE POLICY "Ratings readable by all" ON community_ratings FOR SELECT USING (true);
CREATE POLICY "Ratings writable by rater" ON community_ratings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Ratings updatable by rater" ON community_ratings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Ratings deletable by rater" ON community_ratings FOR DELETE USING (auth.uid() = user_id);

-- HELPER_STATS: Read all (public), Update only via trigger
ALTER TABLE community_helper_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Helper stats readable by all" ON community_helper_stats FOR SELECT USING (true);

-- TRIGGER: Auto-update helper_stats quando reply for criada
CREATE OR REPLACE FUNCTION update_helper_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO community_helper_stats (user_id, reply_count, last_reply_at)
  VALUES (NEW.user_id, 1, NEW.created_at)
  ON CONFLICT (user_id)
  DO UPDATE SET
    reply_count = reply_count + 1,
    last_reply_at = NEW.created_at;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_stats_on_reply
AFTER INSERT ON community_replies
FOR EACH ROW
EXECUTE FUNCTION update_helper_stats();

-- TRIGGER: Auto-update helpful_count em replies
CREATE OR REPLACE FUNCTION update_reply_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.helpful THEN
    UPDATE community_replies SET helpful_count = helpful_count + 1 WHERE id = NEW.reply_id;
    UPDATE community_helper_stats SET total_helpful_ratings = total_helpful_ratings + 1 WHERE user_id = (SELECT user_id FROM community_replies WHERE id = NEW.reply_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_reply_helpful
AFTER INSERT ON community_ratings
FOR EACH ROW
EXECUTE FUNCTION update_reply_helpful_count();
