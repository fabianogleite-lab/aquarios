# HYGEIOS ↔ CERBERIOS INTEGRATION ARCHITECTURE
**Status:** Design Blueprint Ready  
**Date:** 2026-05-25  
**For:** S17 CerberOS Implementation Session

---

## EXECUTIVE SUMMARY

**HygeiOS** (Data Gate) and **CerberOS** (Active Defense) work together:

```
Fundação (S16): Prevention
├─ HygeiOS Stages 1-3: Validate access request (Module, Credentials, Session)
├─ Block bad requests at gate
└─ Log everything for audit

Perímetro (S17): Detection & Response  
├─ HygeiOS Stages 4-5: Generate temp tokens, revoke on expiry
├─ CerberOS Layers 0-3: Monitor normal behavior
├─ CerberOS ETERNAL MAZE: Trap malicious activity
└─ Aprisionamento: Active containment (cage + alert)
```

---

## HYGEIOS: 5-STAGE PROGRESSION

### Stage 1: MODULE VALIDATION ✅ (S16 - Implemented)
**Purpose:** Is the request coming from a known service?

```typescript
// Current: engine/index.ts
const moduleId = requestBody.module || 'engine';

if (moduleId !== 'engine') {
  return { granted: false, error: 'Unknown module' };
}
```

**What it does:**
- Only `engine` module can call HygeiOS
- Prevents random apps from accessing data gate
- Hard-coded in S16 (single service)

**S17 Enhancement:**
- Support multiple modules (chat, nutrition, profiles, etc.)
- Each module has API key
- Validate key before proceeding to Stage 2

---

### Stage 2: CREDENTIAL VALIDATION ✅ (S16 - Ready)
**Purpose:** Is the caller authorized?

```typescript
// S16 implementation (in E2E_ENCRYPTION_ARCHITECTURE.md):
async function validateServiceCredential(callerServiceKey: string): Promise<boolean> {
  // Check if API key is valid + not revoked
  const { data: credential } = await supabase
    .from('service_credentials')
    .select('*')
    .eq('api_key', callerServiceKey)
    .eq('is_active', true)
    .single();
  
  return !!credential;
}
```

**What it does:**
- Verify caller has valid API key
- Check if key is still active (not revoked)
- Rate-limit per API key

**S17 Enhancement:**
- Credential rotation (keys expire every 30 days)
- IP whitelist validation
- Anomaly detection (too many requests from new IP)

---

### Stage 3: SESSION VALIDATION ✅ (S16 - Ready)
**Purpose:** Is the user's session still active?

```typescript
// S16 implementation (in HYGEIOS_AUDIT_FINDINGS.md):
async function validateSession(userId: string, supabaseClient: any): Promise<boolean> {
  const { count } = await supabaseClient
    .from('active_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_active', true)
    .gt('expires_at', new Date().toISOString());
  
  return (count ?? 0) > 0;
}
```

**What it does:**
- Verify user is logged in
- Check session not expired
- Block if user logged out

**S17 Enhancement:**
- Device fingerprinting (same device as login?)
- Geographic anomaly (access from different country?)
- Trigger CerberOS if anomaly detected

---

### Stage 4: TEMPORARY TOKEN GENERATION ❌ (S17 - NEW)
**Purpose:** Generate short-lived access token (prevents abuse of leaked credentials)

```typescript
// S17 implementation (NEW):
function generateAccessToken(
  userId: string,
  plan: string,
  layers: string[],
  expiresIn: number = 3600  // 1 hour default
): string {
  const payload = {
    userId,
    plan,
    layers,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + expiresIn,
    tokenId: crypto.randomUUID()  // Unique per request
  };
  
  // Sign with HYGEIOS_SECRET (Teleport vault)
  const token = jwt.sign(payload, Deno.env.get('HYGEIOS_SECRET'));
  
  // Store in token_registry for revocation tracking
  await supabase.from('hygeios_tokens').insert({
    token_id: payload.tokenId,
    user_id: userId,
    issued_at: new Date(),
    expires_at: new Date(expiresIn * 1000),
    is_revoked: false
  });
  
  return token;
}
```

**What it does:**
- Create JWT with 1-hour expiry
- Token can be revoked immediately if compromise detected
- Each token tracked for audit

**S17 Enhancement:**
- Token stored in Redis for instant revocation
- CerberOS can revoke all tokens if anomaly detected
- Multi-level expiry (user logout → revoke all tokens immediately)

---

### Stage 5: CERBEROS INTEGRATION (APRISIONAMENTO) ❌ (S17 - NEW)
**Purpose:** Trigger defense mechanisms if something suspicious

```typescript
// S17 implementation (NEW):
async function triggerCerberosAprisonment(
  userId: string,
  reason: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  supabaseClient: any
): Promise<void> {
  // Log violation
  await supabaseClient.from('cerberos_violations').insert({
    user_id: userId,
    violation_type: 'hygeios_anomaly',
    reason: reason,
    severity: severity,
    timestamp: new Date(),
    action: 'TRIGGER_TRAP_NETWORK'
  });
  
  // Trigger appropriate layer based on severity
  if (severity === 'critical') {
    // Layer 3: DPI - Block this user entirely
    await fetch(Deno.env.get('CERBEROS_WEBHOOK'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        layer: 'dpi',
        action: 'block_user',
        user_id: userId,
        reason: reason
      })
    });
  }
  
  // Always notify security team
  await slack.send({
    channel: '#security-alerts',
    text: `🚨 HYGEIOS Aprisionamento Triggered\nUser: ${userId}\nReason: ${reason}\nSeverity: ${severity}`
  });
}
```

**What it does:**
- Detects anomalies (geographic, behavioral, rate)
- Triggers CerberOS layers (0-3) based on severity
- Activates ETERNAL MAZE if critical
- Logs everything for post-incident review

**Integration Points:**
- CerberOS receives signal from HygeiOS
- CerberOS takes action (block, monitor, honeypot)
- Both update same audit_log table
- Same Slack #security channel

---

## CERBERIOS: 7-LAYER ARCHITECTURE

### Layer 0: Perimeter Shield
**What:** DDoS protection + WAF (AWS Shield, Cloudflare)

```
Incoming Traffic
  ↓
AWS Shield (DDoS detection)
  ├─ If volume > threshold: Drop packets
  └─ If pattern = botnet: Block IP range
  
Cloudflare WAF
  ├─ If SQL injection signature: Block
  ├─ If path traversal: Block
  └─ If suspicious user agent: Rate limit
```

**Feeds from HygeiOS:** Rate-limit-log (detect if user hammering API)  
**Acts on:** IP blocks, WAF rules  
**Aprisionamiento:** Block IP entirely if malicious pattern detected

---

### Layer 1: Anomaly Detection
**What:** ML model learns "normal" behavior, flags deviations

```
Normal Pattern (Training):
├─ User logs in at 09:00 UTC every weekday
├─ Accesses diary 3-4 times/day (5-10 min each)
├─ Typical data size: 1-5 KB per request
└─ From same IP range (home or office)

Anomaly Example:
├─ User access at 03:00 UTC (never before)
├─ Downloaded 100 MB in 60 seconds
├─ From IP in Russia (user is in Brazil)
└─ ALERT: Severity = CRITICAL
```

**Feeds from HygeiOS:** hygeios_audit_log (all access + data sizes)  
**Acts on:** Flags + scores (0-100, >70 = alert)  
**Aprisionamiento:** Require MFA re-auth if score >80

---

### Layer 2: Protocol Anomaly Detection
**What:** Detects malformed/suspicious requests

```
Normal TLS Handshake:
├─ ClientHello (supported ciphers, TLS version)
├─ ServerHello (accepted cipher)
├─ Exchange keys
└─ Encrypted connection

Anomaly Example:
├─ ClientHello with only very old ciphers (TLS 1.0)
├─ Unusual cipher suites (not used by legitimate clients)
├─ Re-negotiation requests (protocol abuse)
└─ ACTION: Close connection, log IP
```

**Feeds from HygeiOS:** None directly (Layer 2 is network-level)  
**Acts on:** Connection termination  
**Aprisionamiento:** IP automatically added to blocklist

---

### Layer 3: Deep Packet Inspection (DPI)
**What:** Examines actual request content (not just metadata)

```
Request Inspection:
├─ POST /functions/v1/engine
│  ├─ Body contains: {"userId": "abc-123", "action": "earn_xp"}
│  └─ Validate: userId matches authenticated user (Stage 3 check)
│  
├─ If mismatch detected:
│  ├─ Log violation
│  ├─ Increment threat score for IP
│  └─ If score > threshold: Trigger Layer 4 (MAZE)
└─ If 5+ violations in 1 min: Block IP immediately
```

**Feeds from HygeiOS:** 
- Authenticated userId (from session validation)
- Request parameters
- Expected vs actual data sizes

**Acts on:** 
- Request modification/blocking
- User session termination
- IP blocking

**Aprisionamiento:** Forward to ETERNAL MAZE if suspicious enough

---

### Layer 4-5: (Reserved for ETERNAL MAZE)
**What:** Resource-quota controlled trap network (S17+)

*(Design deferred to next session)*

---

## INTEGRATION FLOW: REQUEST → HYGEIOS → CERBERIOS

```
1. USER REQUEST ARRIVES
   POST /functions/v1/engine
   {
     "userId": "frank-uuid",
     "action": "earn_xp",
     "amount": 100
   }

2. HYGEIOS STAGE 1: MODULE VALIDATION
   ✅ Request from 'engine' module? YES
   → Continue to Stage 2

3. HYGEIOS STAGE 2: CREDENTIAL VALIDATION
   ✅ Caller has valid API key? YES
   → Continue to Stage 3

4. HYGEIOS STAGE 3: SESSION VALIDATION
   ✅ User frank logged in + session active? YES
   → Continue to Stage 4

5. HYGEIOS STAGE 4: TOKEN GENERATION
   ✅ Generate JWT (1-hour expiry)
   → Return token to caller
   → Continue to Stage 5

6. HYGEIOS STAGE 5: CERBEROS INTEGRATION
   Check: Are there anomalies?
   ├─ Geographic: frank always accesses from Brazil, now from Russia
   │  └─ Severity: HIGH
   ├─ Rate: frank usually 2 requests/min, now 50/min
   │  └─ Severity: CRITICAL
   └─ Behavior: earning 100 XP is normal, no anomaly
      └─ Severity: LOW

7. AGGREGATED ANOMALY SCORE
   (HIGH + CRITICAL + LOW) / 3 = MEDIUM-HIGH
   Score: 72/100 → TRIGGER CERBERIOS

8. CERBERIOS LAYER 1: ANOMALY DETECTION
   "User accessing from unexpected geography + rate"
   → Recommend: Require MFA re-auth

9. CERBERIOS LAYER 3: DPI
   "Request parameter userId matches authenticated user"
   → OK, allow request

10. FINAL DECISION
    ✅ REQUEST ALLOWED (but flagged for monitoring)
    ├─ Execute: earn_xp(frank, 100)
    ├─ Log: Request allowed despite anomalies
    ├─ Alert: Security team sees it in #security-alerts
    └─ Monitor: If another high-severity request from frank in <1min, block
```

---

## S16 vs S17 TIMELINE

### S16 (Fundação - May-June 2026)
```
HYGEIOS Stages 1-3:
├─ Stage 1: Module validation (hardcoded 'engine')
├─ Stage 2: Service credentials table created
├─ Stage 3: active_sessions table + validation logic
└─ Result: Basic data gate operational

Support Infrastructure:
├─ rate_limit_log table (track requests)
├─ hygeios_audit_log table (compliance logging)
├─ user_xp table with RLS (fixed from audit)
└─ service_credentials table (API keys)

NOT IN S16:
├─ ❌ HygeiOS Stages 4-5 (token generation, aprisionamiento)
├─ ❌ CerberOS any layer (detection deferred)
├─ ❌ Anomaly detection (no data to train on yet)
└─ ❌ ETERNAL MAZE (resource quotas)
```

### S17 (Perímetro - July-August 2026)
```
HYGEIOS Stages 4-5:
├─ Stage 4: JWT token generation + Redis vault
├─ Stage 5: CerberOS integration + aprisionamiento triggers
└─ Result: Full data gate with active defense

CerberOS Layers 0-3:
├─ Layer 0: WAF + DDoS shield (AWS Shield + Cloudflare)
├─ Layer 1: Anomaly detection (ML model)
├─ Layer 2: Protocol anomaly (TLS inspection)
├─ Layer 3: Deep packet inspection (request content validation)
└─ Result: Multi-layer detection system live

ETERNAL MAZE:
├─ Layer 4-5: Resource quota traps
├─ Honeypot for detected attackers
└─ Result: Active containment + learning system
```

---

## RESPONSIBILITY MATRIX

### S16 (CTO + Backend Team)
| Component | Owner | Effort | Notes |
|-----------|-------|--------|-------|
| HygeiOS Stages 1-3 | CTO | 20h | Validation logic |
| rate_limit_log table | Backend | 2h | Simple table |
| hygeios_audit_log table | Backend | 3h | Audit table |
| Service credentials table | Backend | 2h | API key storage |
| Integration to engine/ | Backend | 5h | Wiring HygeiOS into requests |
| Testing + QA | QA | 8h | Validation testing |

**Total S16:** ~40 hours

### S17 (CTO + Security + DevOps)
| Component | Owner | Effort | Notes |
|-----------|-------|--------|-------|
| HygeiOS Stages 4-5 | CTO | 30h | JWT + aprisionamiento |
| Layer 0 (WAF/DDoS) | DevOps | 15h | AWS Shield + Cloudflare |
| Layer 1 (Anomaly) | Security | 60h | ML model training |
| Layer 2 (Protocol) | DevOps | 20h | TLS inspection |
| Layer 3 (DPI) | Security | 40h | Request content analysis |
| ETERNAL MAZE | Security | 80h | Trap network design |
| Testing + QA | QA | 40h | Integration testing |

**Total S17:** ~285 hours (7-8 weeks, 3-person team)

---

## KEY DESIGN DECISIONS

### Decision 1: HygeiOS is GATE, CerberOS is DETECTION
```
HygeiOS (S16):
├─ Question: "Should I allow this request?"
├─ Method: Validate credentials + session + plan
└─ Result: ALLOW or DENY

CerberOS (S17):
├─ Question: "Is something weird happening?"
├─ Method: ML anomaly detection + protocol inspection
└─ Result: MONITOR or ALERT or BLOCK
```

Both needed. HygeiOS prevents known-bad. CerberOS detects unknown-bad.

---

### Decision 2: Aprisionamiento Triggered by BOTH Systems
```
HygeiOS can trigger aprisionamiento:
├─ Stage 5: "This request failed Stage 4 validation"
├─ Example: Impossible travel (Brazil → Russia in 60s)
└─ Action: Trigger CerberOS Layer 3 immediately

CerberOS can trigger aprisionamiento:
├─ Layer 1: "ML detected anomaly score > threshold"
├─ Example: User usually downloads 1KB, now 100MB
└─ Action: Require MFA re-auth or block
```

---

### Decision 3: Shared Audit Log
```
Both HygeiOS + CerberOS write to same tables:
├─ hygeios_audit_log (HygeiOS writes validation events)
├─ cerberos_violations (CerberOS writes detections)
├─ cerberos_aprisionamentos (Both systems can trigger)
└─ Result: Unified compliance audit trail
```

---

## DATA THAT FLOWS BETWEEN THEM

### HygeiOS → CerberOS (Feeds)
```
hygeios_audit_log table:
├─ user_id
├─ action ('access_attempt', 'access_granted', 'access_denied')
├─ layer ('bronze', 'silver', 'gold')
├─ timestamp
├─ ip_address
├─ user_agent
└─ data_size (important for anomaly detection)

CerberOS uses this to:
├─ Train ML model (normal vs abnormal)
├─ Detect geographic anomalies
├─ Detect rate-based anomalies
└─ Detect data-size anomalies
```

### CerberOS → HygeiOS (Feedback)
```
When CerberOS detects HIGH severity anomaly:
├─ Post to cerberos_violations table
├─ Send signal to hygeios_aprisionamento handler
├─ Result: HygeiOS may require additional validation (Stage 4 re-check)
└─ Example: "Require MFA re-auth before allowing next request"
```

---

## NEXT SESSION: CRITICAL QUESTIONS TO ANSWER

1. **Layer 1 (Anomaly Detection):** 
   - Which metrics to track? (rate, size, geographic, temporal, etc.)
   - ML algorithm choice? (Isolation Forest, LSTM, custom?)
   - Training data source? (historical audit logs)

2. **ETERNAL MAZE Design:**
   - How many resource quota traps? (3? 5? 10?)
   - What happens in a trap? (honeypot, data mirroring, etc.)
   - How long does aprisionamiento last? (indefinite? auto-release after analysis?)

3. **Aprisionamiento Rules:**
   - What triggers it? (list 10+ rules)
   - What are the consequences? (block, MFA, rate-limit, honeypot)
   - How to escape without detection? (possible? or impossible by design?)

4. **Performance & Scale:**
   - Can HygeiOS handle 1M+ users?
   - ML model latency requirements?
   - Storage for year of audit logs?

---

## SUCCESS CRITERIA (S17 End)

```
✅ HygeiOS Stages 1-5 working end-to-end
✅ CerberOS Layers 0-3 operational
✅ ETERNAL MAZE honeypots active
✅ Aprisionamiento tested (test user trapped without escape)
✅ ML model trained on historical data
✅ <100ms latency for all detections
✅ Zero false positives (must validate manually)
✅ 95%+ detection rate for simulated attacks
✅ Compliance audit ready (complete audit trail)
✅ Team trained on new systems
```

---

**Status:** Design Blueprint Complete  
**Next Step:** Review with CTO + Security Lead  
**For:** S17 CerberOS Implementation Session

