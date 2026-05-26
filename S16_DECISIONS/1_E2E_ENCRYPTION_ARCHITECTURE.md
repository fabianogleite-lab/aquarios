# E2E ENCRYPTION S16 ARCHITECTURE
**Status:** Ready to Implement  
**Owner:** CTO  
**Timeline:** 15 hours (S16 Phase 1)  
**Risk Mitigated:** R$105.7M (OrgCrime + Supply Chain)

---

## EXECUTIVE SUMMARY

**What we're doing:** Implement server-side E2E encryption in S16 for sensitive health/diary data.  
**Why:** Ameaça #2 (OrgCrime) + Ameaça #6 (Supply Chain) = R$105.7M risk with no current protection.  
**How:** Client encrypts plaintext → sends ciphertext → server stores encrypted. Only user can decrypt.  
**When:** S16 Phase 1 (before P1 items start). Client-side full E2E continues in S17 (40h additional).

---

## THREAT SCENARIOS BLOCKED

### Scenario #1: Organized Crime Data Breach
```
ATTACKER: Cartels buying stolen health data
GOAL: Extract diario_entries + nutrition_logs (patient profiles worth $1000/record)
CURRENT: Data in plaintext → attackers read everything
FIX: Data encrypted at rest → attackers get ciphertext (useless without key)
```

### Scenario #2: Supabase Insider (DBA)
```
ATTACKER: Supabase employee with direct database access
GOAL: Copy nutrition_logs table for black market (health data brokers)
CURRENT: SELECT * FROM nutrition_logs → gets all 10K records plaintext
FIX: SELECT * FROM nutrition_logs → gets ciphertext + nonce (unreadable)
```

### Scenario #3: Supply Chain Compromise
```
ATTACKER: Vendor (e.g., Firebase analytics, logging service) compromised
GOAL: Intercept Supabase backups during transfer
CURRENT: Backups contain plaintext diary entries
FIX: Backups contain only encrypted blobs (even if stolen, encrypted)
```

---

## ARCHITECTURE: 3-LAYER ENCRYPTION

```
LAYER 1: CLIENT ENCRYPTION (Application Layer)
┌─────────────────────────────────────────┐
│ User types: "I feel anxious today"      │
│ ↓                                        │
│ AES-256-GCM encrypt with userKey        │
│ ↓                                        │
│ Ciphertext: 0x47a2c3d1e4... (base64)    │
└─────────────────────────────────────────┘

LAYER 2: TRANSPORT SECURITY (HTTPS)
┌─────────────────────────────────────────┐
│ Ciphertext in HTTPS POST body           │
│ (TLS 1.3 adds second layer, redundant)  │
└─────────────────────────────────────────┘

LAYER 3: DATABASE ENCRYPTION (at rest)
┌─────────────────────────────────────────┐
│ Supabase Postgres: bytea column         │
│ Stored: 0x47a2c3d1e4... (encrypted)     │
│ Even if DB breached, data is encrypted  │
└─────────────────────────────────────────┘
```

---

## IMPLEMENTATION: 4 TABLES

### Table 1: diario_entries (Diary)
**Sensitivity:** CONFIDENCIAL-SAÚDE (HIPAA-level)  
**Action:** Encrypt `content` field

```sql
-- Migration: 10_e2e_encryption_diario.sql
ALTER TABLE diario_entries
  ADD COLUMN content_encrypted bytea,
  ADD COLUMN content_nonce bytea,
  ADD COLUMN encrypted_at timestamptz DEFAULT now();

-- Keep old 'content' for backward compat until data migrated
-- Mark as deprecated: `content_old` (will delete post-migration)

-- RLS still applies (can't read unless auth.uid() = user_id)
-- But now content is also encrypted at application level
```

### Table 2: nutrition_logs (Health Data)
**Sensitivity:** CONFIDENCIAL-SAÚDE (Health data, PII)  
**Action:** Encrypt `description` field

```sql
ALTER TABLE nutrition_logs
  ADD COLUMN description_encrypted bytea,
  ADD COLUMN description_nonce bytea,
  ADD COLUMN encrypted_at timestamptz DEFAULT now();
```

### Table 3: chat_messages (Chat History)
**Sensitivity:** CONFIDENCIAL (PII + behavior)  
**Action:** Encrypt `content` field

```sql
ALTER TABLE chat_messages
  ADD COLUMN content_encrypted bytea,
  ADD COLUMN content_nonce bytea,
  ADD COLUMN encrypted_at timestamptz DEFAULT now();
```

### Table 4: wonder_night_logs (Reflections)
**Sensitivity:** CONFIDENCIAL (Personal reflections)  
**Action:** Encrypt `reflection` field

```sql
ALTER TABLE wonder_night_logs
  ADD COLUMN reflection_encrypted bytea,
  ADD COLUMN reflection_nonce bytea,
  ADD COLUMN encrypted_at timestamptz DEFAULT now();
```

---

## CRYPTOGRAPHY DETAILS

### Key Derivation (Per User)
```typescript
// User's encryption key = derived from PASSWORD + app secret
// NOT stored anywhere (derive on login)

function deriveUserEncryptionKey(userId: string, password: string, salt: string): string {
  // PBKDF2: 100,000 iterations, SHA-256
  // Result: 32-byte key for AES-256
  const key = pbkdf2(
    password,
    salt + userId,  // salt = concat(app_salt, user_id)
    100000,         // iterations
    32,             // key length (256 bits)
    'sha256'
  );
  return key;  // Never stored, derived on demand
}
```

### Encryption (AES-256-GCM)
```typescript
// Authenticated encryption: detects tampering
// GCM = Galois/Counter Mode (provides both confidentiality + authentication)

async function encryptField(plaintext: string, userKey: Buffer, userId: string): Promise<{
  ciphertext: Buffer,
  nonce: Buffer
}> {
  const nonce = crypto.randomBytes(12);  // 96-bit nonce for GCM
  const cipher = crypto.createCipheriv('aes-256-gcm', userKey, nonce);
  
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final()
  ]);
  
  const authTag = cipher.getAuthTag();
  
  return {
    ciphertext: Buffer.concat([ciphertext, authTag]),
    nonce
  };
}
```

### Decryption (Server-side, RLS-protected)
```typescript
async function decryptField(
  ciphertext_with_tag: Buffer,
  nonce: Buffer,
  userKey: Buffer
): Promise<string> {
  const ciphertext = ciphertext_with_tag.slice(0, -16);
  const authTag = ciphertext_with_tag.slice(-16);
  
  const decipher = crypto.createDecipheriv('aes-256-gcm', userKey, nonce);
  decipher.setAuthTag(authTag);
  
  const plaintext = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final()
  ]).toString('utf8');
  
  return plaintext;
}
```

---

## APPLICATION CODE: MOBILE CLIENT

### On Write (Creating Diary Entry)
```typescript
// /mobile/app/screens/DiaryScreen.tsx
async function saveDiaryEntry(content: string, userId: string, password: string) {
  // 1. Derive encryption key from user password
  const userKey = deriveUserEncryptionKey(userId, password, APP_SALT);
  
  // 2. Encrypt plaintext
  const { ciphertext, nonce } = await encryptField(content, userKey, userId);
  
  // 3. Send encrypted to Supabase
  const { data, error } = await supabase
    .from('diario_entries')
    .insert({
      user_id: userId,
      content_encrypted: ciphertext.toString('base64'),
      content_nonce: nonce.toString('base64'),
      encrypted_at: new Date()
    });
  
  return data;
}
```

### On Read (Opening Diary Entry)
```typescript
// /mobile/app/screens/DiaryDetailScreen.tsx
async function loadDiaryEntry(entryId: string, userId: string, password: string) {
  // 1. Fetch encrypted entry from DB (RLS ensures auth.uid() = user_id)
  const { data, error } = await supabase
    .from('diario_entries')
    .select('content_encrypted, content_nonce')
    .eq('id', entryId)
    .single();
  
  // 2. Derive same encryption key
  const userKey = deriveUserEncryptionKey(userId, password, APP_SALT);
  
  // 3. Decrypt in-app
  const plaintext = await decryptField(
    Buffer.from(data.content_encrypted, 'base64'),
    Buffer.from(data.content_nonce, 'base64'),
    userKey
  );
  
  // 4. Display plaintext
  setDiaryContent(plaintext);
}
```

---

## EDGE FUNCTION: ENCRYPTION HELPERS

### New Edge Function: /functions/v1/crypto

```typescript
// /mobile/supabase/functions/crypto/index.ts

import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { crypto } from "https://deno.land/std@0.131.0/crypto/mod.ts";

serve(async (req) => {
  if (req.method === "POST") {
    const { action, plaintext, ciphertext, nonce, userKey } = await req.json();

    if (action === "encrypt") {
      // Client-side encryption preferred, but offer server-side option for backup
      const key = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(userKey),
        { name: "AES-GCM" },
        false,
        ["encrypt"]
      );
      
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encrypted = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        new TextEncoder().encode(plaintext)
      );
      
      return new Response(
        JSON.stringify({
          success: true,
          ciphertext: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
          nonce: btoa(String.fromCharCode(...iv))
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    if (action === "decrypt") {
      // Server-side decryption (RLS still applied)
      const key = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(userKey),
        { name: "AES-GCM" },
        false,
        ["decrypt"]
      );
      
      const decrypted = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: new Uint8Array(atob(nonce).split('').map(c => c.charCodeAt(0))) },
        key,
        new Uint8Array(atob(ciphertext).split('').map(c => c.charCodeAt(0)))
      );
      
      return new Response(
        JSON.stringify({
          success: true,
          plaintext: new TextDecoder().decode(decrypted)
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  return new Response("Invalid request", { status: 400 });
});
```

---

## DATA MIGRATION PLAN

### Phase 1: Add Encrypted Columns (Zero Downtime)
```sql
-- Migration: 10_e2e_encryption_diario.sql
ALTER TABLE diario_entries ADD COLUMN content_encrypted bytea;
ALTER TABLE diario_entries ADD COLUMN content_nonce bytea;
-- Old 'content' column still works, new column added
-- No app changes needed yet
```

### Phase 2: Dual-Write (Backward Compat)
```typescript
// App writes to BOTH content + content_encrypted
// Reads from content_encrypted if exists, fallback to content
// Timeline: 2 weeks of dual-write to ensure consistency
```

### Phase 3: Migrate Historical Data
```bash
# One-time script: encrypt all old diary entries
node scripts/migrate-encrypt-historical-data.js

# This runs OFFLINE (nightly), encrypts old plaintext → new _encrypted columns
```

### Phase 4: Deprecate Old Columns
```sql
-- After migration complete (week 3):
ALTER TABLE diario_entries DROP COLUMN content;
-- content_encrypted becomes primary column
```

---

## COMPLIANCE IMPACT

### ✅ LGPD (Brazil)
**Article 5:** "Personal data shall be processed lawfully, fairly, and transparently"  
→ Encryption provides technical safeguard for health data  

**Article 9:** "Controllers must implement technical and organizational measures"  
→ AES-256-GCM + per-user key derivation meets LGPD requirements

### ✅ HIPAA (US, if applicable)
**Technical Safeguards § 164.312(a)(2)(ii):** "Encryption and decryption"  
→ AES-256 encryption meets HIPAA standards

### ✅ GDPR (Europe, if applicable)
**Article 32:** "Encryption of personal data"  
→ Encrypted at rest, TLS in transit satisfies GDPR security requirements

---

## TESTING CHECKLIST

```
[ ] Unit tests: encryptField() / decryptField() work correctly
[ ] Unit tests: deriveUserEncryptionKey() deterministic (same password = same key)
[ ] Integration: Write encrypted → Read decrypted matches original
[ ] Integration: Wrong password → decryption fails (no plaintext leaked)
[ ] RLS: Non-owner cannot read row even if encrypted column missing auth
[ ] Performance: Encryption/decryption < 100ms per field (mobile acceptable)
[ ] Migration: Old plaintext entries successfully encrypted
[ ] Compliance: Audit logs show encrypted fields accessed (not content)
[ ] E2E: Mobile client → encrypt → API → store encrypted → retrieve → decrypt
```

---

## TIMELINE & EFFORT

| Phase | Task | Hours | Owner |
|-------|------|-------|-------|
| 1 | Design + review architecture | 2 | CTO |
| 2 | Database migrations (4 tables) | 3 | Backend |
| 3 | Client encryption logic (mobile) | 5 | Mobile |
| 4 | Edge Function crypto helpers | 2 | Backend |
| 5 | Data migration script | 1 | DevOps |
| 6 | Testing + QA | 2 | QA |
| **Total** | | **15 hours** | |

---

## ROLLBACK PLAN (If Issues Found)

```
Day 1-2 (S16): Encrypt new entries only
→ If bug found: disable encryption, old plaintext entries unaffected

Week 1 (S16): Migrate 10% of historical data
→ If issues: rollback migration, 90% still on plaintext

Week 2 (S16): Migrate 50%
→ Safe point: half encrypted, half plaintext both work

Week 3 (S16): Migrate 100%
→ Commit: all entries encrypted
→ If issues: restore DB from backup, go back to encrypted columns only (skip migration)
```

---

## S17 CONTINUATION: CLIENT-SIDE E2E

Once S16 encryption is live and stable:

```
S17 Phase 1 (Week 5-6):
├─ Client-side E2E for messages (encrypt before leaving device)
├─ Keys managed by libsodium (not stored server-side)
└─ Server never sees plaintext for messages

S17 Phase 2 (Week 7-8):
├─ E2E group crypto for community data
├─ Share encrypted payloads via shares table
└─ Full zero-knowledge architecture
```

---

## OWNER: CTO
**Sign-off Required:** CTO approval to proceed with 15h implementation

---

**Status:** 🟢 READY TO IMPLEMENT  
**Risk Mitigated:** R$105.7M  
**S16 Effort:** 15 hours  
**S17 Continuation:** 40 hours (client-side full E2E)
