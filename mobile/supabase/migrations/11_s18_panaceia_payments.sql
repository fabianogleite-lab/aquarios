-- ============================================================
-- 11_s18_panaceia_payments.sql
-- PanaceIA Global Payment Architecture + Stripe + Token Economy
-- Performance Telemetry + HygeiOS Audit Integration
-- ============================================================

-- ============================================================
-- PARTE 1: STRIPE CUSTOMERS + MULTI-CURRENCY
-- 13 countries, Stripe global, fallback for sanctioned regions
-- ============================================================

CREATE TABLE IF NOT EXISTS public.stripe_customers (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  stripe_customer_id TEXT     UNIQUE NOT NULL,     -- cus_xxxxx
  default_currency   TEXT     DEFAULT 'usd',       -- ISO 4217
  country_code       TEXT,                         -- ISO 3166-1 alpha-2
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_stripe_cust_user ON public.stripe_customers(user_id);
ALTER TABLE public.stripe_customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own stripe customer" ON public.stripe_customers
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role manages stripe" ON public.stripe_customers
  FOR ALL WITH CHECK (auth.role() = 'service_role');

-- Supported currencies per country (Stripe availability)
CREATE TABLE IF NOT EXISTS public.panaceia_currencies (
  country_code    TEXT        PRIMARY KEY,         -- 'BR', 'US', 'IL', etc.
  country_name    TEXT        NOT NULL,
  currency_code   TEXT        NOT NULL,            -- 'BRL', 'USD', 'ILS', etc.
  stripe_supported BOOLEAN   DEFAULT true,
  payment_methods  TEXT[]     DEFAULT ARRAY['card'], -- 'card','pix','ideal','sofort'...
  locale          TEXT        NOT NULL,            -- matches i18n locale tag
  notes           TEXT
);

INSERT INTO public.panaceia_currencies (country_code, country_name, currency_code, stripe_supported, payment_methods, locale, notes) VALUES
  ('BR', 'Brasil',       'BRL', true,  ARRAY['card','pix','boleto'],    'pt-BR',  'Pix instant, boleto 3d'),
  ('US', 'United States','USD', true,  ARRAY['card','apple_pay'],       'en-US',  NULL),
  ('ES', 'Spain',        'EUR', true,  ARRAY['card','sepa'],            'es',     'EU regulation PSD2'),
  ('IL', 'Israel',       'ILS', true,  ARRAY['card'],                   'he-IL',  NULL),
  ('IR', 'Iran',         'IRR', false, ARRAY['zarinpal'],               'fa-IR',  'Stripe blocked — sanctions. Zarinpal or free tier only'),
  ('KR', 'South Korea',  'KRW', true,  ARRAY['card','kakao_pay'],       'ko-KR',  'Kakao Pay via Stripe local methods'),
  ('HK', 'Hong Kong',    'HKD', true,  ARRAY['card','alipay_hk'],       'zh-HK',  NULL),
  ('NO', 'Norway',       'NOK', true,  ARRAY['card','vipps'],           'nb-NO',  'Vipps via Stripe local methods'),
  ('CH', 'Switzerland',  'CHF', true,  ARRAY['card','twint'],           'de-CH',  'TWINT popular locally'),
  ('TH', 'Thailand',     'THB', true,  ARRAY['card','promptpay'],       'th-TH',  'PromptPay instant'),
  ('HR', 'Croatia',      'EUR', true,  ARRAY['card'],                   'hr-HR',  'EUR since 2023'),
  ('UA', 'Ukraine',      'UAH', true,  ARRAY['card'],                   'uk-UA',  'Limited Stripe support, Monobank popular'),
  ('VE', 'Venezuela',    'VES', false, ARRAY['zelle','crypto_usdt'],    'es-VE',  'Stripe blocked — sanctions. Zelle USD or free tier')
ON CONFLICT (country_code) DO NOTHING;

-- ============================================================
-- PARTE 2: TOKEN PACKAGES — Stripe Products/Prices mapping
-- ============================================================

CREATE TABLE IF NOT EXISTS public.panaceia_token_packages (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  slug            TEXT        UNIQUE NOT NULL,      -- 'ai_50', 'sync_100', etc.
  token_type      TEXT        NOT NULL,             -- 'ai' | 'sync' | 'insight' | 'community'
  token_amount    INT         NOT NULL,
  price_usd_cents INT         NOT NULL,             -- canonical price in USD cents
  stripe_price_id TEXT,                             -- price_xxxxx (Stripe)
  bonus_tokens    INT         DEFAULT 0,            -- extra tokens for larger packs
  popular         BOOLEAN     DEFAULT false,
  active          BOOLEAN     DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.panaceia_token_packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads active packages" ON public.panaceia_token_packages
  FOR SELECT USING (active = true);
CREATE POLICY "Service role manages packages" ON public.panaceia_token_packages
  FOR ALL WITH CHECK (auth.role() = 'service_role');

-- Token packages — 4 types x 3 tiers each
INSERT INTO public.panaceia_token_packages (slug, token_type, token_amount, price_usd_cents, bonus_tokens, popular) VALUES
  -- AI tokens (ProteOS conversations)
  ('ai_50',    'ai',        50,   499,  0,   false),
  ('ai_200',   'ai',       200,  1499, 20,   true),
  ('ai_500',   'ai',       500,  2999, 75,   false),
  -- Sync tokens (HermeOS device sync)
  ('sync_30',  'sync',      30,   299,  0,   false),
  ('sync_100', 'sync',     100,   799, 10,   true),
  ('sync_300', 'sync',     300,  1999, 45,   false),
  -- Insight tokens (analytics/reports)
  ('insight_20',  'insight',  20,   399,  0,  false),
  ('insight_80',  'insight',  80,  1299,  8,  true),
  ('insight_200', 'insight', 200,  2499, 30,  false),
  -- Community tokens (communities features)
  ('community_100', 'community', 100,  299,  0,  false),
  ('community_500', 'community', 500,  999, 50,  true),
  ('community_2000','community',2000, 2999,300,  false)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- PARTE 3: PAYMENT TRANSACTIONS — Full audit trail
-- ============================================================

CREATE TABLE IF NOT EXISTS public.panaceia_transactions (
  id                UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id           UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  package_id        UUID        REFERENCES public.panaceia_token_packages(id),
  offering_id       UUID        REFERENCES public.panaceia_offerings(id),
  -- Stripe fields
  stripe_session_id    TEXT,                       -- cs_xxxxx (Checkout Session)
  stripe_payment_intent TEXT,                      -- pi_xxxxx
  stripe_invoice_id    TEXT,                       -- inv_xxxxx (subscriptions)
  -- Amount
  amount_cents      INT         NOT NULL,
  currency          TEXT        NOT NULL DEFAULT 'usd',
  tokens_granted    INT         DEFAULT 0,
  token_type        TEXT,
  -- Status lifecycle
  status            TEXT        NOT NULL DEFAULT 'pending',
    -- pending → processing → succeeded → tokens_delivered
    -- pending → failed
    -- succeeded → refunded
  payment_method    TEXT,                          -- 'card', 'pix', 'apple_pay', etc.
  -- HygeiOS audit
  hygeios_verified  BOOLEAN     DEFAULT false,     -- HygeiOS confirmed delivery
  audit_hash        TEXT,                          -- SHA-256 of transaction for integrity
  -- Timestamps
  created_at        TIMESTAMPTZ DEFAULT now(),
  completed_at      TIMESTAMPTZ,
  refunded_at       TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_txn_user       ON public.panaceia_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_txn_status     ON public.panaceia_transactions(status);
CREATE INDEX IF NOT EXISTS idx_txn_stripe_si  ON public.panaceia_transactions(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_txn_stripe_pi  ON public.panaceia_transactions(stripe_payment_intent);
ALTER TABLE public.panaceia_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own transactions" ON public.panaceia_transactions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role manages transactions" ON public.panaceia_transactions
  FOR ALL WITH CHECK (auth.role() = 'service_role');

-- ============================================================
-- PARTE 4: SUBSCRIPTION PLANS (optional recurring)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.panaceia_subscriptions (
  id                UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id           UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_slug         TEXT        NOT NULL,           -- 'free' | 'essencial' | 'premium' | 'transcendente'
  stripe_subscription_id TEXT,                      -- sub_xxxxx
  status            TEXT        NOT NULL DEFAULT 'active',
    -- 'active' | 'past_due' | 'canceled' | 'trialing'
  current_period_start TIMESTAMPTZ,
  current_period_end   TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN  DEFAULT false,
  -- Token allowances per billing cycle
  monthly_ai_tokens      INT   DEFAULT 0,
  monthly_sync_tokens    INT   DEFAULT 0,
  monthly_insight_tokens INT   DEFAULT 0,
  monthly_community_tokens INT DEFAULT 0,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.panaceia_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own subscription" ON public.panaceia_subscriptions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role manages subscriptions" ON public.panaceia_subscriptions
  FOR ALL WITH CHECK (auth.role() = 'service_role');

-- Subscription tiers
INSERT INTO public.panaceia_subscriptions (user_id, plan_slug, status, monthly_ai_tokens, monthly_sync_tokens, monthly_insight_tokens, monthly_community_tokens)
SELECT id, 'free', 'active', 10, 5, 3, 50
FROM public.profiles
WHERE NOT EXISTS (SELECT 1 FROM public.panaceia_subscriptions WHERE user_id = profiles.id)
LIMIT 0; -- Template only, real assignment on user creation

-- ============================================================
-- PARTE 5: STRIPE WEBHOOK LOG — idempotency + audit
-- ============================================================

CREATE TABLE IF NOT EXISTS public.stripe_webhook_log (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  stripe_event_id TEXT        UNIQUE NOT NULL,      -- evt_xxxxx — idempotency key
  event_type      TEXT        NOT NULL,             -- 'checkout.session.completed', etc.
  payload         JSONB       NOT NULL,
  processed       BOOLEAN     DEFAULT false,
  processing_error TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_webhook_event_id ON public.stripe_webhook_log(stripe_event_id);
CREATE INDEX IF NOT EXISTS idx_webhook_type     ON public.stripe_webhook_log(event_type);
ALTER TABLE public.stripe_webhook_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Only service role" ON public.stripe_webhook_log
  FOR ALL WITH CHECK (auth.role() = 'service_role');

-- ============================================================
-- PARTE 6: PERFORMANCE TELEMETRY — Mobile + Web CWV
-- Measures real user-perceived speed (target: LCP ≤ 2.5s)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.performance_metrics (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  session_id      TEXT,                             -- random per app session
  platform        TEXT        NOT NULL,             -- 'mobile' | 'web'
  -- Mobile metrics (React Native)
  app_cold_start_ms   INT,                         -- target ≤ 2500
  app_warm_start_ms   INT,                         -- target ≤ 1000
  screen_transition_ms INT,                        -- target ≤ 300
  touch_to_render_ms  INT,                         -- INP equivalent, target ≤ 200
  fps_average         REAL,                        -- target ≥ 58
  api_response_ms     INT,                         -- Supabase round-trip
  -- Web Core Web Vitals
  lcp_ms              INT,                         -- Largest Contentful Paint ≤ 2500
  inp_ms              INT,                         -- Interaction to Next Paint ≤ 200
  cls_score           REAL,                        -- Cumulative Layout Shift ≤ 0.1
  fcp_ms              INT,                         -- First Contentful Paint ≤ 1800
  ttfb_ms             INT,                         -- Time to First Byte ≤ 800
  -- Context
  screen_name         TEXT,                        -- which screen/route
  device_model        TEXT,                        -- 'Samsung Galaxy S21', etc.
  os_version          TEXT,                        -- 'Android 14', 'iOS 18'
  app_version         TEXT,
  network_type        TEXT,                        -- 'wifi' | '4g' | '5g' | '3g'
  country_code        TEXT,                        -- for regional latency analysis
  created_at          TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_perf_user     ON public.performance_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_perf_platform ON public.performance_metrics(platform);
CREATE INDEX IF NOT EXISTS idx_perf_screen   ON public.performance_metrics(screen_name);
CREATE INDEX IF NOT EXISTS idx_perf_created  ON public.performance_metrics(created_at);
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;
-- Anonymous write (users contribute metrics), service_role reads all
CREATE POLICY "Authenticated users insert own metrics" ON public.performance_metrics
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Service role reads all metrics" ON public.performance_metrics
  FOR SELECT USING (auth.role() = 'service_role');

-- ============================================================
-- PARTE 7: HYGEIOS PAYMENT AUDIT — connects payments to audit
-- ============================================================

CREATE TABLE IF NOT EXISTS public.hygeios_payment_audit (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id  UUID        NOT NULL REFERENCES public.panaceia_transactions(id),
  user_id         UUID        NOT NULL REFERENCES public.profiles(id),
  check_type      TEXT        NOT NULL,             -- 'delivery_confirmed' | 'refund_verified' | 'fraud_flag' | 'anomaly'
  passed          BOOLEAN     NOT NULL DEFAULT true,
  details         JSONB,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_hpa_txn  ON public.hygeios_payment_audit(transaction_id);
CREATE INDEX IF NOT EXISTS idx_hpa_user ON public.hygeios_payment_audit(user_id);
ALTER TABLE public.hygeios_payment_audit ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role manages payment audit" ON public.hygeios_payment_audit
  FOR ALL WITH CHECK (auth.role() = 'service_role');

-- ============================================================
-- PARTE 8: TOKEN DELIVERY FUNCTION — Stripe webhook → tokens
-- SECURITY DEFINER: runs with elevated privileges
-- ============================================================

CREATE OR REPLACE FUNCTION public.panaceia_deliver_tokens(
  p_transaction_id UUID,
  p_user_id        UUID,
  p_token_type     TEXT,
  p_token_amount   INT,
  p_source         TEXT DEFAULT 'purchase'
) RETURNS JSONB AS $$
DECLARE
  v_existing INT;
  v_result   JSONB;
BEGIN
  -- Idempotency: check if already delivered
  SELECT tokens_granted INTO v_existing
  FROM public.panaceia_transactions
  WHERE id = p_transaction_id AND status = 'tokens_delivered';

  IF v_existing IS NOT NULL THEN
    RETURN jsonb_build_object('status', 'already_delivered', 'tokens', v_existing);
  END IF;

  -- Insert token record
  INSERT INTO public.user_tokens (user_id, token_type, amount, expires_at)
  VALUES (
    p_user_id,
    p_token_type,
    p_token_amount,
    CASE WHEN p_token_type = 'community' THEN now() + INTERVAL '90 days'
         WHEN p_token_type = 'ai'        THEN now() + INTERVAL '365 days'
         ELSE NULL  -- sync/insight never expire
    END
  );

  -- Update transaction status
  UPDATE public.panaceia_transactions
  SET status = 'tokens_delivered',
      tokens_granted = p_token_amount,
      completed_at = now(),
      hygeios_verified = true
  WHERE id = p_transaction_id;

  -- HygeiOS audit entry
  INSERT INTO public.hygeios_payment_audit (transaction_id, user_id, check_type, passed, details)
  VALUES (
    p_transaction_id, p_user_id, 'delivery_confirmed', true,
    jsonb_build_object(
      'token_type', p_token_type,
      'amount', p_token_amount,
      'source', p_source,
      'delivered_at', now()
    )
  );

  -- XP reward for purchase
  INSERT INTO public.xp_log (user_id, action, xp_earned, module)
  VALUES (p_user_id, 'token_purchase', GREATEST(5, p_token_amount / 10), 'panaceia');

  v_result := jsonb_build_object(
    'status', 'delivered',
    'tokens', p_token_amount,
    'type', p_token_type,
    'transaction_id', p_transaction_id
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- PARTE 9: PERFORMANCE AGGREGATION VIEW
-- HygeiOS uses this to monitor system health
-- ============================================================

CREATE OR REPLACE VIEW public.performance_summary AS
SELECT
  platform,
  screen_name,
  country_code,
  DATE_TRUNC('hour', created_at) AS hour,
  COUNT(*) AS sample_count,
  -- Mobile
  ROUND(AVG(app_cold_start_ms))     AS avg_cold_start_ms,
  ROUND(PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY app_cold_start_ms)) AS p75_cold_start_ms,
  ROUND(AVG(screen_transition_ms))  AS avg_transition_ms,
  ROUND(AVG(touch_to_render_ms))    AS avg_touch_render_ms,
  ROUND(AVG(fps_average)::NUMERIC, 1)   AS avg_fps,
  ROUND(AVG(api_response_ms))       AS avg_api_ms,
  -- Web CWV
  ROUND(AVG(lcp_ms))               AS avg_lcp_ms,
  ROUND(AVG(inp_ms))               AS avg_inp_ms,
  ROUND(AVG(cls_score)::NUMERIC, 3)     AS avg_cls,
  -- Threshold compliance (% meeting target)
  ROUND(100.0 * COUNT(*) FILTER (WHERE app_cold_start_ms <= 2500) / NULLIF(COUNT(*) FILTER (WHERE app_cold_start_ms IS NOT NULL), 0), 1) AS pct_cold_start_ok,
  ROUND(100.0 * COUNT(*) FILTER (WHERE lcp_ms <= 2500) / NULLIF(COUNT(*) FILTER (WHERE lcp_ms IS NOT NULL), 0), 1) AS pct_lcp_ok,
  ROUND(100.0 * COUNT(*) FILTER (WHERE inp_ms <= 200) / NULLIF(COUNT(*) FILTER (WHERE inp_ms IS NOT NULL), 0), 1) AS pct_inp_ok
FROM public.performance_metrics
WHERE created_at >= now() - INTERVAL '7 days'
GROUP BY platform, screen_name, country_code, DATE_TRUNC('hour', created_at);

-- ============================================================
-- FIM — 11_s18_panaceia_payments.sql
-- 7 tables + 1 view + 1 function
-- Stripe global, 13 currencies, token economy, performance CWV
-- ============================================================
