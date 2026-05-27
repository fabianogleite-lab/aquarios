# AquariOS Architecture — Web Version + Global Payments

**Date:** 2026-05-26 | **Status:** Approved architecture, pending implementation

---

## 1. Stack Recommendation

```
                        +-----------------+
                        |   CloudFlare    |
                        |   CDN + WAF     |
                        +--------+--------+
                                 |
                  +--------------+--------------+
                  |                             |
          +-------+-------+           +--------+--------+
          |  Next.js 15   |           | React Native    |
          |  (Web App)    |           | (Mobile App)    |
          |  TypeScript   |           | TypeScript      |
          +-------+-------+           +--------+--------+
                  |                             |
                  +--------------+--------------+
                                 |
                    +------------+------------+
                    |   Python Backend API    |
                    |   FastAPI + Uvicorn     |
                    |   (Shared Services)     |
                    +------------+------------+
                                 |
              +------------------+------------------+
              |                  |                  |
     +--------+------+  +-------+-------+  +------+--------+
     |  Supabase     |  |  Stripe API   |  |  Google       |
     |  (DB + Auth   |  |  (Payments)   |  |  Fact Check   |
     |   + Realtime) |  |               |  |  API          |
     +---------------+  +---------------+  +---------------+
```

### Why This Stack

| Layer | Technology | Reason |
|-------|-----------|--------|
| **Web** | Next.js 15 (React) | Same React components, SSR for Core Web Vitals (LCP), TypeScript shared with mobile |
| **Mobile** | React Native + Expo | Already built, 26 screens, Expo SDK 56 |
| **Backend** | Python FastAPI | HygeiOS content audit (NLP/ML), Stripe webhooks, analytics processing, Google Fact Check |
| **DB** | Supabase (PostgreSQL) | Already in production, RLS, Realtime subscriptions, Edge Functions |
| **Payments** | Stripe | 11 of 13 countries supported, multi-currency, local payment methods |
| **CDN** | CloudFlare | Edge caching for web CWV, DDoS protection |

### Why Python Backend (not TypeScript everywhere)

1. **HygeiOS NLP engine** — Python has spaCy, transformers, NLTK for content moderation
2. **ML/Analytics** — scikit-learn, pandas for archetype analysis and user profiling
3. **Stripe Webhooks** — FastAPI handles webhooks with proper signature verification
4. **Google Fact Check API** — Python client library is more mature
5. **Web stays TypeScript** — shared UI components with mobile via shared lib

---

## 2. Web Core Web Vitals Strategy

**Targets (Google "Good" threshold):**

| Metric | Target | How |
|--------|--------|-----|
| **LCP** | ≤ 2.5s | SSR with Next.js, edge caching, optimized images |
| **INP** | ≤ 200ms | React Server Components, minimal client JS, virtualized lists |
| **CLS** | ≤ 0.1 | Fixed dimensions for images/cards, font preloading |
| **FCP** | ≤ 1.8s | Critical CSS inline, preload fonts |
| **TTFB** | ≤ 800ms | Edge Functions + CloudFlare, Supabase connection pooling |

**Implementation:**

```typescript
// Next.js web-vitals reporting (built-in)
// pages/_app.tsx
export function reportWebVitals(metric: NextWebVitalsMetric) {
  // Send to Supabase performance_metrics table
  if (['LCP', 'INP', 'CLS', 'FCP', 'TTFB'].includes(metric.name)) {
    fetch('/api/metrics', {
      method: 'POST',
      body: JSON.stringify({
        platform: 'web',
        [metric.name.toLowerCase() + '_ms']: metric.value,
        screen_name: window.location.pathname,
      }),
    });
  }
}
```

---

## 3. Mobile Performance (≤ 2.5s perceived)

**Already instrumented via `lib/performance.ts`:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| Cold start | ≤ 2.5s | `markAppStart()` → `markAppReady()` |
| Screen transition | ≤ 300ms | `markScreenStart()` → `markScreenReady()` |
| Touch-to-render | ≤ 200ms | `measureInteraction()` wrapper |
| API round-trip | ≤ 1000ms | `measureApi()` wrapper |
| FPS | ≥ 58 | React Native Performance Monitor |

**HygeiOS monitors** the `performance_summary` SQL view and triggers alerts when:
- p75 cold start > 3000ms
- avg transition > 500ms
- avg FPS < 50

---

## 4. PanaceIA Global Payment Architecture

### 4a. Stripe Integration Flow

```
User taps "Buy 200 AI Tokens"
        │
        ▼
┌──────────────────┐
│  Mobile/Web App   │
│  POST /checkout   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐     ┌─────────────┐
│  Python Backend   │────>│  Stripe API │
│  create_checkout  │     │  Checkout   │
│  session          │<────│  Session    │
└────────┬─────────┘     └─────────────┘
         │
         ▼
┌──────────────────┐
│  Stripe Checkout  │  ← User pays (card, Pix, etc.)
│  Hosted Page      │
└────────┬─────────┘
         │ webhook
         ▼
┌──────────────────┐     ┌─────────────┐
│  Python Backend   │────>│  Supabase   │
│  handle_webhook   │     │  deliver    │
│  verify signature │     │  tokens     │
└──────────────────┘     └─────────────┘
```

### 4b. Country Payment Methods

| Country | Currency | Stripe | Local Methods | Fallback |
|---------|----------|--------|---------------|----------|
| BR | BRL | Yes | Pix, Boleto | — |
| US | USD | Yes | Card, Apple Pay | — |
| ES | EUR | Yes | Card, SEPA | — |
| IL | ILS | Yes | Card | — |
| **IR** | **IRR** | **No** | **Zarinpal** | **Free tier** |
| KR | KRW | Yes | Card, Kakao Pay | — |
| HK | HKD | Yes | Card, AlipayHK | — |
| NO | NOK | Yes | Card, Vipps | — |
| CH | CHF | Yes | Card, TWINT | — |
| TH | THB | Yes | Card, PromptPay | — |
| HR | EUR | Yes | Card | — |
| UA | UAH | Yes* | Card | *Limited |
| **VE** | **VES** | **No** | **Zelle USD** | **Free tier** |

**Iran & Venezuela:** Stripe blocked due to international sanctions. Options:
1. **Free tier only** (community tokens via engagement)
2. **Zarinpal** (Iran-specific gateway) — requires separate integration
3. **Crypto/USDT** — complex regulatory implications

**Recommendation:** Launch with free tier for IR/VE. Add Zarinpal post-launch if demand justifies.

### 4c. Token Economy (4 types)

| Token | Earnable? | Purchasable? | Expires? | Use |
|-------|-----------|-------------|----------|-----|
| **AI** | Via referrals | Yes ($4.99-$29.99) | 365 days | ProteOS conversations |
| **Sync** | Via activity | Yes ($2.99-$19.99) | Never | HermeOS device sync |
| **Insight** | Via surveys | Yes ($3.99-$24.99) | Never | Analytics/reports |
| **Community** | Via engagement | Yes ($2.99-$29.99) | 90 days | Community features |

### 4d. Subscription Tiers

| Plan | Price/mo | AI | Sync | Insight | Community | Features |
|------|----------|-----|------|---------|-----------|----------|
| Free | $0 | 10 | 5 | 3 | 50 | Basic access |
| Essencial | $4.99 | 100 | 30 | 20 | 200 | + HygeiOS insights |
| Premium | $14.99 | 500 | 100 | 80 | 1000 | + Priority support |
| Transcendente | $29.99 | Unlimited | Unlimited | 200 | Unlimited | + Beck Office |

---

## 5. Python Backend Structure

```
aquarios-api/
├── main.py                    # FastAPI app entry
├── requirements.txt
├── config/
│   ├── settings.py            # env vars, Stripe keys
│   └── countries.py           # 13-country config
├── routers/
│   ├── checkout.py            # POST /checkout — create Stripe session
│   ├── webhooks.py            # POST /webhooks/stripe
│   ├── tokens.py              # GET /tokens/balance, POST /tokens/spend
│   └── health.py              # GET /health — performance metrics
├── services/
│   ├── stripe_service.py      # Stripe Checkout + Customer management
│   ├── token_service.py       # Token delivery + balance
│   ├── hygeios_audit.py       # Content moderation NLP
│   ├── fact_check.py          # Google Fact Check API
│   └── performance.py         # Metrics aggregation
├── models/
│   ├── transaction.py         # Pydantic models
│   ├── token.py
│   └── metrics.py
└── tests/
    ├── test_checkout.py
    ├── test_webhooks.py
    └── test_tokens.py
```

### Key Endpoint: Stripe Checkout

```python
# routers/checkout.py (FastAPI)
@router.post("/checkout")
async def create_checkout(
    request: CheckoutRequest,
    user: User = Depends(get_current_user),
):
    package = await get_package(request.package_slug)
    currency = await get_user_currency(user.country_code)

    session = stripe.checkout.Session.create(
        customer=user.stripe_customer_id,
        line_items=[{
            "price": package.stripe_price_id,
            "quantity": 1,
        }],
        mode="payment",
        currency=currency.code.lower(),
        payment_method_types=currency.payment_methods,
        success_url=f"{FRONTEND_URL}/payment/success",
        cancel_url=f"{FRONTEND_URL}/payment/cancel",
        metadata={
            "user_id": str(user.id),
            "package_slug": package.slug,
            "token_type": package.token_type,
            "token_amount": package.token_amount + package.bonus_tokens,
        },
    )

    # Record pending transaction
    await create_transaction(user.id, package, session.id)

    return {"checkout_url": session.url}
```

### Key Endpoint: Stripe Webhook

```python
# routers/webhooks.py
@router.post("/webhooks/stripe")
async def handle_stripe_webhook(request: Request):
    payload = await request.body()
    sig = request.headers.get("stripe-signature")
    event = stripe.Webhook.construct_event(
        payload, sig, STRIPE_WEBHOOK_SECRET
    )

    # Idempotency: skip if already processed
    if await webhook_already_processed(event.id):
        return {"status": "already_processed"}

    if event.type == "checkout.session.completed":
        session = event.data.object
        user_id = session.metadata["user_id"]
        token_type = session.metadata["token_type"]
        token_amount = int(session.metadata["token_amount"])

        # Deliver tokens via SQL function
        await deliver_tokens(
            transaction_id=session.metadata.get("transaction_id"),
            user_id=user_id,
            token_type=token_type,
            token_amount=token_amount,
        )

    # Log webhook
    await log_webhook(event)
    return {"status": "processed"}
```

---

## 6. Shared Code Strategy (Mobile + Web)

```
aquarios-shared/              # npm package or monorepo shared lib
├── types/
│   ├── token.ts              # TokenBalance, TokenHistory
│   ├── user.ts               # Profile, Subscription
│   └── performance.ts        # MetricPayload, Targets
├── constants/
│   ├── modules.ts            # 8 official modules + native tools
│   ├── archetypes.ts         # 10 SandeirOS archetypes
│   └── performance.ts        # PERFORMANCE_TARGETS
├── utils/
│   ├── locale.ts             # formatDate, formatNumber (from lib/locale.ts)
│   └── logger.ts             # __DEV__ guard (from lib/logger.ts)
└── i18n/
    └── locales/              # All 13 locale JSON files
```

---

## 7. Deployment Architecture

```
┌─────────────────────────────────────────────────┐
│                Production                        │
├───────────────┬───────────────┬─────────────────┤
│  Vercel       │  AWS/Oracle   │  Supabase       │
│  (Next.js     │  (Python API  │  (DB + Auth     │
│   Web App)    │   FastAPI)    │   + Edge Fn     │
│               │               │   + Realtime)   │
├───────────────┼───────────────┼─────────────────┤
│  CloudFlare   │  Load         │  Connection     │
│  CDN          │  Balancer     │  Pooling        │
│  + WAF        │  + SSL        │  (Supavisor)    │
└───────────────┴───────────────┴─────────────────┘
```

| Service | Where | Cost Estimate |
|---------|-------|--------------|
| Next.js Web | Vercel (Hobby→Pro) | $0-$20/mo |
| Python API | AWS Lambda / Oracle Cloud | $0-$50/mo (free tier) |
| Supabase | Already active | Current plan |
| Stripe | Per transaction | 2.9% + $0.30 |
| CloudFlare | Free→Pro | $0-$20/mo |

---

## 8. Implementation Priority (S18+)

| Phase | What | Effort |
|-------|------|--------|
| S18-A | Deploy migration 11 (payment tables) | 30 min |
| S18-B | Stripe account setup + API keys | 1 hour (human) |
| S18-C | Python FastAPI skeleton (checkout + webhook) | 4 hours |
| S18-D | Mobile: integrate performance.ts into all screens | 2 hours |
| S18-E | Mobile: Stripe Checkout flow (open browser → return) | 3 hours |
| S19 | Next.js web app skeleton (auth + 3 core screens) | 8 hours |
| S19 | HygeiOS NLP engine (Python, content audit) | 6 hours |
| S20 | Google Fact Check API integration | 2 hours |
| S20 | CWV optimization + Lighthouse audit | 3 hours |

---

*Generated by Claude Code — S17/S18 Architecture*
