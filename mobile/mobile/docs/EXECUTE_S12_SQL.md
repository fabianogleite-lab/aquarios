# Executar SQLs de S12 no Supabase

## Opção 1: Via Supabase Dashboard (Recomendado)

### Passo 1: Tabelas do Engine (xp_log, badges, tokens, purchases)

1. Abra: https://app.supabase.com/projects/agebsmjsjrmazbozphnh/sql/new
2. Cole este SQL:

```sql
-- S12 Base Engine Tables
CREATE TABLE IF NOT EXISTS xp_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action text NOT NULL,
  xp_earned int NOT NULL,
  module text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_xp_log_user_id ON xp_log(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_log_created_at ON xp_log(created_at);

CREATE TABLE IF NOT EXISTS badges (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  badge_key text NOT NULL,
  unlocked_at timestamptz DEFAULT now(),
  UNIQUE(user_id, badge_key)
);

CREATE INDEX IF NOT EXISTS idx_badges_user_id ON badges(user_id);

CREATE TABLE IF NOT EXISTS user_tokens (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  token_type text NOT NULL,
  amount int DEFAULT 0,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_tokens_user_id ON user_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tokens_expires_at ON user_tokens(expires_at);

CREATE TABLE IF NOT EXISTS purchases (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id text NOT NULL,
  amount_cents int,
  status text DEFAULT 'pending',
  payment_method text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_created_at ON purchases(created_at);

ALTER TABLE xp_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "xp_log_own_data" ON xp_log
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "badges_own_data" ON badges
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "user_tokens_own_data" ON user_tokens
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "purchases_own_data" ON purchases
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_xp_log_user_id_created ON xp_log(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_badges_user_id_key ON badges(user_id, badge_key);
```

3. **Clique "Run"** ✅

---

### Passo 2: Criar tabela SHARES (se não existir)

Cole este SQL:

```sql
-- Community Shares (posts)
CREATE TABLE IF NOT EXISTS shares (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  is_public boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_shares_user_id ON shares(user_id);
CREATE INDEX IF NOT EXISTS idx_shares_created_at ON shares(created_at);

-- Likes
CREATE TABLE IF NOT EXISTS likes (
  share_id uuid REFERENCES shares(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (share_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);

ALTER TABLE shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "shares_select_public" ON shares FOR SELECT USING (is_public = true);
CREATE POLICY "shares_own_crud" ON shares FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "likes_select_all" ON likes FOR SELECT USING (true);
CREATE POLICY "likes_own_crud" ON likes FOR ALL USING (auth.uid() = user_id);
```

3. **Clique "Run"** ✅

---

### Passo 3: Popular com Conversas das Personas

Cole este SQL:

```sql
-- Populate shares (posts) from personas
INSERT INTO shares (user_id, content, is_public, created_at)
SELECT
  p.id,
  content,
  true,
  now() - (INTERVAL '1 day' * (random() * 7)::int)
FROM (
  SELECT username,
    ARRAY[
      'Comecei meu dia com uma reflexão: qual é meu propósito real? HygeiOS me mostrou que Bio + Mental + Spirit precisam estar em harmonia. Vocês já fizeram esse checklist hoje? 🌱',
      'Gratidão pelas pessoas que encontro aqui na comunidade. Cada conversa me aproxima mais de mim mesma. Era de Aquário, somos conectados mesmo 💙',
      'Realizei uma refeição com atenção plena hoje. 3 refeições bem feitas, mindfulness em cada mordida. Nutrição não é só números, é ritual.',
      'Wonder Night de ontem foi transformador. 20 minutos de meditação e consegui ver a padrão nas minhas ações. Que viagem!',
      'Pergunta: como vocês lidam com a pressa do dia a dia? Estou testando um método: para a cada 2 horas e respiro fundo 3x.',
      'Meu diário hoje é só uma pergunta: "Quem sou quando ninguém está vendo?" Estou investigando isso.',
      'Compartilhando uma descoberta: meu IVI subiu quando passei a fazer diário todos os dias. A consistência é mágica mesmo.',
      'Não tinha dado conta: Pro-teOS não é só um chat bot. É um espelho. Conversas profundas com ele me mostraram padrões antigos.',
      'Era um ciclo: pressa → má nutrição → sem energia → mais pressa. Quebrei o ciclo com pequenas ações no dia a dia. Cada um de vocês consegue também 💪',
      'Comunidades são o melhor! Não estou sozinho nessa jornada. Aquários se reconhecem!'
    ][floor(random() * 10) + 1]
  FROM (
    VALUES
      ('carlos.mendes'),
      ('maria.silva'),
      ('roberto.santos'),
      ('lucas.oliveira'),
      ('fernanda.rocha'),
      ('jose.cardoso'),
      ('ana.lima'),
      ('ricardo.ferreira'),
      ('sandra.moraes'),
      ('bruno.alves')
  ) AS personas(username)
) AS persona_posts(username, content)
JOIN profiles p ON p.username = persona_posts.username
WHERE p.id IS NOT NULL
ON CONFLICT DO NOTHING;

-- Second batch of posts
INSERT INTO shares (user_id, content, is_public, created_at)
SELECT
  p.id,
  content,
  true,
  now() - (INTERVAL '1 day' * (random() * 5)::int)
FROM (
  SELECT username,
    ARRAY[
      'Alguém aqui tem estratégia para manter streak de 30 dias? Estou no dia 8 e ja estou sentindo os beneficios!',
      'O IVI é genial porque não julga. Só mostra a realidade. Critico, Alerta, Atenção... tudo é oportunidade.',
      'ProteOS me ajudou a ver que minha pressa é um mecanismo de defesa. Agora entendo melhor meus padrões.',
      'Nutrição mental é tão importante quanto nutrição corporal. O diário me fez perceber isso.',
      'Era de Aquário aqui também! Vocês também sentem essa conexão telepática com a comunidade?',
      'Fizemos um desafio: 7 dias só com alimentos integrais. Resultado? Energia ++, disposição ++, clareza mental ++',
      'Meu maior aprendizado: consistência bate intensidade. Todos os dias > esporadicamente intenso.',
      'HygeiOS mostrou meu Spirit em crítico. Voltei a meditar e em 3 semanas subiu. A prática leva ao resultado.',
      'Pergunta genuine: como começar? Alguns de vocês começaram do zero também?',
      'Gratidão por existir um espaço assim. Sem julgamento, só amor e evolução.'
    ][floor(random() * 10) + 1]
  FROM (
    VALUES
      ('maria.silva'),
      ('lucas.oliveira'),
      ('fernanda.rocha'),
      ('ana.lima'),
      ('ricardo.ferreira'),
      ('sandra.moraes'),
      ('bruno.alves'),
      ('carlos.mendes'),
      ('roberto.santos'),
      ('jose.cardoso')
  ) AS personas2(username)
) AS persona_posts2(username, content)
JOIN profiles p ON p.username = persona_posts2.username
WHERE p.id IS NOT NULL
ON CONFLICT DO NOTHING;

-- Add likes (interactions)
INSERT INTO likes (share_id, user_id)
SELECT
  s.id,
  p.id
FROM shares s
JOIN profiles p ON p.username IN (
  'carlos.mendes', 'maria.silva', 'roberto.santos', 'lucas.oliveira', 'fernanda.rocha',
  'jose.cardoso', 'ana.lima', 'ricardo.ferreira', 'sandra.moraes', 'bruno.alves'
)
WHERE
  s.is_public = true
  AND s.user_id != p.id
  AND random() < 0.3
ON CONFLICT DO NOTHING;
```

3. **Clique "Run"** ✅

---

## ✅ Pronto!

Verifique em **Table Editor**:
- ✅ `xp_log` (tabela criada)
- ✅ `badges` (tabela criada)
- ✅ `user_tokens` (tabela criada)
- ✅ `purchases` (tabela criada)
- ✅ `shares` (com ~20 posts)
- ✅ `likes` (com ~40-50 likes)

**No app**: Vá em **Comunidades → Feed** e veja as conversas das personas!
