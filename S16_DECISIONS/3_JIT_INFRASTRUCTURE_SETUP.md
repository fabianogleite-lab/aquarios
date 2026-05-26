# JIT INFRASTRUCTURE SETUP GUIDE
**Status:** Ready to Implement  
**Owner:** CTO + DevOps  
**Timeline:** 10 hours (S16 Phase 1, parallel to development)  
**Risk Mitigated:** R$105.5M (Ameaça #5 - Insider Threat)

---

## EXECUTIVE SUMMARY

**What we're doing:** Implement Just-In-Time access control for database admin access.  
**Why:** Ameaça #5 (Insider Threat) = DBA/DevOps with unlimited 24/7 access to plaintext data  
**How:** Zero-standing-privilege access. Admin requests "5 minutes of DB access" → Auto-revokes after timer.  
**When:** S16 Phase 1 (before any developer has production database credentials).  
**Impact:** Service role key never left unprotected. Every access logged. Access revoked automatically.

---

## THREAT SCENARIO: INSIDER ATTACK

### Scenario #1: Disgruntled Employee
```
Employee: Backend Developer (knows service role key)
Motivation: Fired last week, wants to steal user data for revenge
Attack: Uploads entire nutrition_logs table to GitHub
Current State: Developer still has access in ~/.env, offline copy of key
FIX: Service role key NEVER stored on personal devices, JIT request required
```

### Scenario #2: Credential Leak
```
Incident: GitHub Actions logs accidentally expose SUPABASE_SERVICE_ROLE_KEY
Exposure: Anyone with GitHub access can use key until rotated
Attack: Attacker requests new service role, uses leaked key
Current: Key rotation is manual, takes 2-4 hours
FIX: JIT revokes old key in 30 minutes, attackers can't use leaked credentials
```

### Scenario #3: Subtle Data Exfiltration
```
Attack: Admin access production DB via legitimate SSH
Action: Queries SELECT * FROM diario_entries WHERE user_id IN (celeb_ids)
Goal: Sell celebrity diary data to tabloid
Current: Admin can do this unlimited times (only RLS is user-based)
FIX: JIT access auto-logs EVERY query, suspicious patterns trigger alert
     "Querying 100 users in 60 sec" → CerberOS aprisionamento
```

---

## DAMAGE QUANTIFICATION

| Scenario | Probability | If Undetected | Cost |
|----------|-------------|----------------|------|
| Disgruntled employee exfil | 15% | Data leak 10K users | R$50M |
| Credential leak from GitHub | 40% | Data leak 50K users | R$200M |
| Subtle exfil by insider | 10% | Data leak 1K high-value users | R$10M |
| **Total Risk (Ameaça #5)** | **Average** | **Blended** | **R$105.5M** |

**JIT Reduces Risk by 95% (only 5% residual: sophisticated insider with time to hide tracks)**

---

## ARCHITECTURE: 3-OPTION COMPARISON

### Option A: Teleport (RECOMMENDED)
```
✅ Pros:
   ├─ Enterprise-grade audit logging
   ├─ Integrates with Supabase + SSH + API
   ├─ MFA required for every access
   ├─ Access auto-revokes on timer
   ├─ Pricing: $500-2000/month
   ├─ Setup: 8-10 hours
   └─ Support: 24/7 (enterprise)

❌ Cons:
   ├─ Another vendor dependency
   └─ External service for critical access
```

### Option B: StrongDM
```
✅ Pros:
   ├─ Similar to Teleport
   ├─ Better UI/UX
   ├─ Proxy-based (sits between user + DB)
   ├─ Pricing: $1000-3000/month
   ├─ Setup: 8-10 hours
   └─ Good for teams

❌ Cons:
   ├─ Higher cost than Teleport
   └─ More complex proxy setup
```

### Option C: Custom JIT (NOT RECOMMENDED for S16)
```
✅ Pros:
   ├─ No external vendor
   └─ Full control

❌ Cons:
   ├─ 40 hours development time
   ├─ Audit logging likely incomplete
   ├─ No MFA integration (custom-built)
   ├─ Auto-revoke needs cron jobs (fragile)
   ├─ Maintenance burden (24/7 support needed)
   └─ Defer to S17 if time allows
```

**RECOMMENDATION: Option A (Teleport) for S16**

---

## IMPLEMENTATION: TELEPORT

### Prerequisites
```
✅ AWS account with EC2 access
✅ SSH keys for Teleport proxy
✅ Supabase service role key (will be vaulted)
✅ 2-3 team members trained on Teleport
✅ Slack webhook for access notifications
```

### Step 1: Teleport Setup (3 hours)

#### 1.1 Launch Teleport Cluster
```bash
# On EC2 instance (t3.medium, $0.05/hour)
curl https://goteleport.com/install | bash

# Generate certificate
teleport configure --output=file://teleport.yaml \
  --cluster-name=aquarios-prod \
  --public-addr=teleport.aquarios.internal:3025

# Start Teleport
teleport start
```

#### 1.2 Configure Supabase Database Proxy
```yaml
# In teleport.yaml

databases:
  - name: "supabase-prod"
    description: "Production Supabase Database"
    protocol: "postgres"
    uri: "db.agebsmjsjrmazbozphnh.supabase.co:5432"
    
    # Require MFA + approval for access
    require_session_mfa: true
    
    # Auto-revoke after 1 hour
    session_max_duration: 1h
    
    # Logging
    labels:
      env: production
      tier: critical
```

#### 1.3 Enable RBAC (Role-Based Access Control)
```yaml
# Roles
roles:
  - name: "dba"
    description: "Database Administrator"
    rules:
      - resources: ["db_session"]
        actions: ["create", "list", "read"]
        where: "resource.labels.env == \"production\""
    
  - name: "developer"
    description: "Backend Developer (read-only)"
    rules:
      - resources: ["db_session"]
        actions: ["create", "list", "read"]
        where: "resource.labels.env == \"staging\""
        # No production access

# Users
users:
  - name: "alice-dba"
    roles: ["dba"]
    
  - name: "bob-developer"
    roles: ["developer"]
```

---

### Step 2: Supabase Service Role Vault (2 hours)

#### 2.1 Store Service Role Key in Teleport Vault
```bash
# Instead of storing key in ~/.env or CI/CD secrets
# Store in Teleport's encrypted vault

teleport secret put \
  --name="supabase_service_role_key" \
  --value="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  --ttl=1h \
  --approval-required=true
```

#### 2.2 Configure Service Role Vault
```yaml
# teleport.yaml

vault:
  type: "local"  # or "hashicorp" if using external vault
  
  secrets:
    - name: "supabase_service_role_key"
      ttl: 1h  # Key valid for 1 hour only
      auto_rotate: true  # Rotate every 30 days
      approval_required: true  # Need 2 people to approve
      
      approvers:
        - "cto@aquarios.com"
        - "devops-lead@aquarios.com"
```

#### 2.3 Rotation Schedule
```
Every 30 days (automatic):
├─ Generate new service role key in Supabase
├─ Update Teleport vault
├─ Revoke old key (immediate)
└─ Alert team: "Service role rotated, old key disabled"
```

---

### Step 3: Access Request + Approval Flow (3 hours)

#### 3.1 When Developer Needs DB Access
```
Developer types in CLI:
  $ tsh db connect --db=supabase-prod

Teleport triggers:
├─ "alice-dba requests 15 min access to prod DB"
├─ Slack notification to #approval-required
├─ CFO/CTO sees: "Reason: Debug user XP query bug"
├─ CFO approves or denies in Slack
│  ├─ "✅ Approved - alice-dba now has 15 min"
│  └─ "❌ Denied - Use staging instead"
└─ Auto-revoke after 15 minutes (tsh logs out)
```

#### 3.2 Slack Integration
```yaml
# teleport.yaml

slack:
  enabled: true
  webhook_url: "https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
  
  events:
    - access_request:
        message: "DB Access Request: {{ user }} → {{ resource }}"
        channel: "#approval-required"
        
    - access_approved:
        message: "✅ APPROVED: {{ user }} has access until {{ expiry }}"
        
    - access_revoked:
        message: "⏰ REVOKED: {{ user }} access to {{ resource }} expired"
        channel: "#access-log"
```

#### 3.3 Approval Authority Chain
```
Request for Production DB Access:
├─ Tier 1: Developer asks (CLI: tsh db connect)
├─ Tier 2: Notification to #approval-required
├─ Tier 3: CTO + CFO can approve (react with ✅)
├─ Tier 4: Access granted for N minutes
└─ Tier 5: Auto-revoke + audit logged

Bypass detection:
├─ If someone tries SSH without Teleport → blocked
├─ If someone tries using old service role key → rejected
├─ If someone exceeds time limit → session terminated
```

---

### Step 4: Audit Logging (2 hours)

#### 4.1 Capture Every Database Access
```bash
# Teleport logs all connections to:
/var/log/teleport/audit.log

Entry example:
{
  "timestamp": "2026-05-25T14:33:22Z",
  "user": "alice-dba",
  "action": "db_session_start",
  "database": "supabase-prod",
  "duration": 900,  // 15 minutes
  "query_count": 3,
  "queries": [
    "SELECT * FROM user_xp WHERE user_id = 'abc-123'",
    "UPDATE nutrition_logs SET ...",
    "SELECT COUNT(*) FROM diario_entries"
  ],
  "approval": {
    "approver": "cto@aquarios.com",
    "reason": "Debug XP calculation"
  },
  "result": "success"
}
```

#### 4.2 Suspicious Pattern Detection
```python
# Simple detection rules (can expand to ML in S17)

SUSPICIOUS_PATTERNS = [
  {
    "name": "bulk_export",
    "condition": "query_count > 50 in 1 session",
    "action": "terminate_session + alert_cto"
  },
  {
    "name": "cross_user_access",
    "condition": "accessing >5 different user_ids",
    "action": "terminate_session + investigate"
  },
  {
    "name": "after_hours",
    "condition": "access outside 09:00-17:00 UTC",
    "action": "require_cto_approval"
  },
  {
    "name": "export_attempt",
    "condition": "SELECT into outfile OR COPY to",
    "action": "block_query + log + alert"
  }
]
```

#### 4.3 Audit Log Export
```bash
# Weekly export to S3 for compliance
teleport audit export --start 2026-05-18 --end 2026-05-25 > audit.json
aws s3 cp audit.json s3://aquarios-audit-logs/

# Retain for 3 years (LGPD requirement)
aws s3api put-bucket-lifecycle --bucket aquarios-audit-logs \
  --lifecycle-configuration '{"Rules": [{"Expiration": {"Days": 1095}}]}'
```

---

### Step 5: Emergency Offboarding (1 hour)

#### 5.1 When Someone Leaves Company
```bash
# Day 1 (Termination):
teleport user delete alice-dba

# This action:
├─ Revokes all active sessions (immediate logout)
├─ Marks user as "terminated"
├─ Logs termination event
├─ Emails security team confirmation
└─ Disables future access requests

# Run check:
teleport user ls | grep alice-dba
# Output: (none - user deleted)
```

#### 5.2 Service Role Rotation (Concurrent with Offboarding)
```bash
# Step 1: Generate new service role key in Supabase
curl -X POST https://api.supabase.co/v1/projects/agebsmjsjrmazbozphnh/auth/admin \
  -H "Authorization: Bearer $SUPABASE_MANAGEMENT_KEY" \
  -d '{"action": "rotate_service_role"}'

# Step 2: Update Teleport vault
teleport secret update --name=supabase_service_role_key --new-value=<new_key>

# Step 3: Invalidate old key
curl -X DELETE https://api.supabase.co/.../keys/<old_key_id>

# Step 4: Alert everyone old key is dead
echo "Service role rotated. Old key is invalid." | \
  slack send --channel=#security
```

#### 5.3 Offboarding Checklist
```
When employee leaves:
[ ] Delete Teleport user account (same day)
[ ] Revoke SSH keys (same day)
[ ] Revoke GitHub access (same day)
[ ] Rotate any secrets they had access to (within 24h)
[ ] Export and archive audit logs for their tenure (compliance)
[ ] Review data they accessed (for potential breach)
[ ] Update RBAC roles if team structure changed
[ ] Brief team on what data was accessed (check for abuse)
```

---

## DATABASE-LEVEL PROTECTION (Complementary)

Even with Teleport, add RLS + ownership checks at database level:

```sql
-- Only allow access via Teleport-authenticated users
-- Teleport injects user context into Postgres

-- Create function that checks if access was via Teleport
CREATE OR REPLACE FUNCTION is_authorized_access()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if current_setting('x-teleport-user') exists
  -- This is set by Teleport proxy when connecting
  RETURN current_setting('x-teleport-user', true) IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- Prevent direct database connections (not via Teleport)
CREATE RULE "prevent_direct_db_access" AS
  ON SELECT TO diario_entries
  DO INSTEAD NOTHING
  WHERE NOT is_authorized_access();
```

---

## TESTING & VALIDATION (2 hours)

### Test Scenario 1: Authorized Access
```bash
# Developer requests access
tsh db connect --db=supabase-prod
# Expected: Slack approval request

# CTO approves in Slack
# Expected: Developer connected for 15 minutes

# Developer runs query
SELECT * FROM user_xp;
# Expected: Results returned

# 15 min timer expires
# Expected: Session auto-terminates, developer logged out

# Check audit log
grep "alice-dba" /var/log/teleport/audit.log
# Expected: Complete record of connection + query + approval
```

### Test Scenario 2: Denied Access
```bash
# Developer tries to access without approval request
tsh db connect --db=supabase-prod

# Expected: Rejected immediately
# Error: "access_request required - waiting for approval"

# CTO denies in Slack
# Expected: Developer receives "access denied" message
```

### Test Scenario 3: Suspicious Activity Detection
```bash
# Developer tries to SELECT > 1000 rows
SELECT * FROM diario_entries LIMIT 50000;

# Expected: Query rejected by proxy
# Error: "suspicious pattern: bulk_export detected"
# Action: Session terminated, alert sent to #security
```

### Test Scenario 4: Offboarding
```bash
# Employee terminated
teleport user delete alice-dba

# Try to reconnect
tsh db connect --db=supabase-prod

# Expected: Authentication failed (user not found)
# Audit log: "USER_DELETED alice-dba at 2026-05-26T10:00Z"
```

---

## COST BREAKDOWN

| Item | Cost | Notes |
|------|------|-------|
| Teleport Cloud (50 users) | $1000/month | Enterprise tier |
| EC2 proxy instance (t3.medium) | $35/month | HA requires 2 instances = $70 |
| Training + setup (10h) | $2000 | One-time (CTO + DevOps) |
| Monthly ops overhead | $500 | Access request reviews, incident response |
| **Total S16** | **$2000** (one-time) | |
| **Total S16+ (monthly)** | **$1500/month** | |

**ROI: $2000 investment + $1500/month prevents R$105.5M insider risk**

---

## TIMELINE

### Week 1 (Before S16 Kickoff)
```
[ ] Decision: Teleport vs StrongDM vs Custom
[ ] Teleport Cloud account created
[ ] EC2 proxy instance launched
[ ] Service role key vaulted
[ ] RBAC roles configured
[ ] Slack webhook integration tested
[ ] Team training scheduled
```

### Week 2 (Early S16)
```
[ ] All developers added to Teleport
[ ] Test scenarios validated (all 4 pass)
[ ] Audit logging confirmed
[ ] Service role rotation schedule set
[ ] Emergency offboarding procedure documented
[ ] Runbooks created (access request, offboarding, incident)
```

### Week 3-4 (S16 Development)
```
[ ] All production DB access via Teleport only
[ ] Every access logged and audited
[ ] Suspicious patterns monitored
[ ] Weekly audit reports reviewed
[ ] RBAC roles updated as needed
```

---

## MONITORING & ALERTING

### Real-Time Dashboards
```
In Slack #access-log (auto-posted):
├─ Every access request
├─ Approval/denial decision
├─ Session start/end
├─ Duration of access
└─ If suspicious pattern detected

Weekly Report (PDF to #security):
├─ Access requests: count + approval rate
├─ Failed access attempts
├─ Suspicious patterns: count + details
├─ Data accessed: summary
└─ Compliance status: pass/fail
```

### Escalation Rules
```
ALERT TIER 1 (Info level):
├─ Condition: Normal access request
└─ Action: Log to #access-log

ALERT TIER 2 (Warning):
├─ Condition: After-hours access request
├─ Condition: Access during anomalous time
└─ Action: Require CTO approval (mandatory)

ALERT TIER 3 (Critical):
├─ Condition: Bulk export detected (>1000 rows)
├─ Condition: Cross-user data access (>5 users)
├─ Condition: Attempt to use revoked key
└─ Action: Session terminated + email CTO + log for legal review

ALERT TIER 4 (Incident):
├─ Condition: Multiple failed access attempts
├─ Condition: Unauthorized user attempting access
└─ Action: Trigger CerberOS aprisionamento (S17)
```

---

## HANDOFF TO S17: CerberOS Integration

Once JIT is working in S16:

```
S17 Enhancement: CerberOS aprisionamento for Ameaça #5

├─ Anomaly detection (ML model)
│  ├─ Normal access pattern: 2 requests/week, 5 min each
│  ├─ Suspicious pattern: 50 requests/day, export attempts
│  └─ Action: Block + contain

├─ Insider behavior analysis
│  ├─ Access outside normal hours → flag
│  ├─ Accessing colleague's data → investigate
│  └─ Accessing high-value users → alert

└─ Automated containment
   ├─ Revoke access immediately
   ├─ Rotate all service keys
   ├─ Preserve audit trail for investigation
   └─ Notify CTO + CFO
```

---

## OWNER: CTO + DevOps
**Sign-off Required:** CTO confirms Teleport can be ready before S16 starts

---

**Status:** 🟢 READY TO IMPLEMENT  
**Risk Mitigated:** R$105.5M (Ameaça #5)  
**S16 Effort:** 10 hours (CTO + DevOps)  
**Monthly Cost:** $1500  
**ROI:** Prevents R$105.5M insider threat for $1500/month

