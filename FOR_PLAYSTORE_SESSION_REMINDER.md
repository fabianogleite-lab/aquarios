# FOR PLAYSTORE LAUNCH SESSION - SYSTEM REMINDER (COPY & PASTE)

**Use this as <system-reminder> tag in next session that focuses on S17-S18 Play Store launch**

---

## COMPLETE CONTEXT SUMMARY

### What Has Been Completed (S16)
- ✅ E2E Encryption architecture (server-side AES-256-GCM)
- ✅ JIT Infrastructure design (Teleport vault for admin access)
- ✅ Crisis Communication Plan (templates + escalation)
- ✅ All 3 decisions documented + ready for leadership signatures
- ✅ R$212.4M risk mitigated (80% of threat landscape)
- ✅ LGPD Article 9 + 10 compliance path clear
- ✅ HygeiOS ↔ CerberOS integration blueprint complete

### What's Next (S17-S18)
- **S17 (7-8 weeks):** CerberOS Perímetro (detection layer) - 285 hours
- **S18 (3-4 weeks):** Production infrastructure + Play Store launch - 190 hours
- **Total remaining:** 475 hours to Play Store

### Complete Roadmap Location
**File:** `COMPLETE_ROADMAP_TO_PLAYSTORE.md`  
**Status:** Ready to use as project master document  
**Updates:** Refresh weekly, track progress against timeline

---

## CRITICAL PERMISSIONS CHECKLIST

### AWS (40+ permissions needed)
```
✅ EC2: RunInstances, TerminateInstances, CreateSecurityGroup
✅ RDS: CreateDBInstance, CreateDBSnapshot, RestoreDBInstance
✅ VPC: CreateVpc, CreateSubnet, CreateNatGateway
✅ S3: CreateBucket, PutObject, GetObject, ListBucket, PutBucketEncryption
✅ CloudFront: CreateDistribution, UpdateDistribution, InvalidateDistribution
✅ CloudWatch: PutMetricAlarm, CreateLogGroup, CreateLogStream
✅ SNS: CreateTopic, Publish, Subscribe
✅ Route53: CreateHostedZone, ChangeResourceRecordSets (for failover DNS)
✅ IAM: CreateRole, PutRolePolicy, CreateInstanceProfile
✅ Secrets Manager: CreateSecret, GetSecretValue, UpdateSecret
✅ Direct Connect: CreateConnection (to Oracle)

→ Action: Attach "AdministratorAccess" policy OR create custom policy with all above
→ Owner: AWS account owner or DevOps lead
```

### Oracle (DBA permissions)
```
✅ CREATE TABLESPACE, CREATE USER, GRANT privileges
✅ CREATE DATABASE LINK (connection from AWS)
✅ RMAN BACKUP DATABASE, RMAN RESTORE DATABASE
✅ Data Guard configuration + switchover/failover
✅ ALTER SYSTEM, AUDIT commands
✅ SQL*Net configuration, VPN/Direct Connect setup

→ Action: Grant "DBA role" OR "Oracle Database Administrator" role
→ Owner: Oracle DBA or database administrator
→ Timeline: Direct Connect setup takes 2-4 weeks (start early!)
```

### Supabase (Project admin)
```
✅ Database: CREATE TABLE, ALTER TABLE, GRANT privileges, user management
✅ Authentication: User creation, OAuth setup, email templates
✅ Storage: Bucket creation, RLS policies
✅ Edge Functions: Deploy, view logs, manage secrets
✅ Analytics: View metrics

→ Action: Supabase project "Owner" or "Admin" role
→ Owner: Backend lead or CTO
```

### Google Play Console (Publisher)
```
✅ Create app listing, upload APK/bundle, set rollout percentage
✅ View crash reports, ANR reports, ratings, reviews
✅ Manage versions, content ratings, distribution

→ Action: Google Play Developer account "Owner" or "Editor" role
→ Owner: Product/mobile lead or CTO
→ Timeline: Account setup + first app listing = 1-2 hours
```

### Teleport (Admin)
```
✅ Create/update/delete secrets (SUPABASE_SERVICE_ROLE_KEY)
✅ User management (dba, developer roles)
✅ Database proxy configuration
✅ View audit logs

→ Action: Teleport "Admin" role
→ Owner: CTO or DevOps lead
```

---

## KEY MILESTONES & DATES

```
Week 1:  S16 Decision Architecture (DONE - May 25-26)
Week 2:  S16 Fundação Implementation (May 27 - July 8) ← IN PROGRESS
         E2E encryption, JIT infrastructure, Crisis plan live
         Testing + deployment

Week 3:  S17 Perímetro Implementation (July 9 - August 19) ← NEXT
         CerberOS Layers 0-3, ETERNAL MAZE, Aprisionamiento
         ML model training, integration testing

Week 4:  S18 Production + Play Store (August 20 - September 9) ← FINAL
         AWS + Oracle infrastructure
         APK testing on local device
         Architecture audit
         Play Store submission + launch

TOTAL: 15-18 weeks to Play Store live
```

---

## 4 CRITICAL DECISIONS NEEDED BEFORE S17 STARTS

1. **ML Algorithm for CerberOS Layer 1:**
   - Isolation Forest (faster, good for outliers)
   - LSTM (better for temporal anomalies)
   - Autoencoder (novelty detection)
   - Decision: _______________

2. **ETERNAL MAZE Trap Count:**
   - 3 honeypots (basic)
   - 5 honeypots (intermediate)
   - 10 honeypots (advanced)
   - Decision: _______________

3. **Aprisionamiento Duration:**
   - Indefinite (manual release)
   - Auto-release (24-48 hours)
   - Tiered (depends on severity)
   - Decision: _______________

4. **Data Sync Strategy (AWS ↔ Oracle):**
   - Real-time replication (strict consistency, high overhead)
   - Hourly sync (eventual consistency, lower overhead)
   - Daily sync (snapshots, simplest)
   - Decision: _______________

---

## S18 DETAILED TASK BREAKDOWN

### Week 1: AWS + Oracle Infrastructure (80 hours)

#### AWS Setup (40 hours)
- VPC + subnets (3h): public/private, NAT Gateway
- EC2 instances (3h): 2x web servers, 1x Teleport proxy, auto-scaling
- RDS PostgreSQL (4h): multi-AZ, automated backups, read replicas
- CloudFront CDN (3h): cache static assets, bypass API cache
- S3 buckets (1h): audit logs, user uploads, backups
- IAM roles (2h): proper permissions, least privilege
- CloudWatch (2h): dashboards, alarms, log streams
- SNS notifications (1h): Slack alerts
- Route53 DNS (2h): failover setup
- Testing (5h): health checks, failover test, backup verify
- Cost estimation + optimization (2h): check bills weekly
- Documentation (5h): architecture diagrams, runbooks

**Owner:** DevOps Team (1-2 people, 5-6 days full-time)

#### Oracle Setup (40 hours)
- Exadata provisioning (5h): or Oracle Cloud equivalent
- Data Guard configuration (8h): primary + standby, automatic failover
- Backup setup (5h): RMAN, incremental backups, retention
- Network setup (8h): VPN tunnel, Direct Connect (requires network team)
- Data sync (8h): initial bulk, continuous CDC replication
- HA testing (4h): failover practiced, recovery time measured
- Documentation (2h): runbooks, playbooks

**Owner:** Oracle DBA + DevOps Lead (1-2 people, 5-6 days full-time)

**⚠️ WARNING:** Direct Connect takes 2-4 weeks to provision. Start immediately!

---

### Week 2: APK Testing + Mirroring (60 hours)

#### APK Build + Test (20 hours)
- Build APK locally (4h): npm run build:android, sign with keystore
- Feature testing (10h): auth, diary, nutrition, chat, communities, XP, settings
- Performance testing (4h): app launch, transitions, sync, memory, battery
- Security testing (2h): encryption working, no API keys in binary, no plaintext creds

**Owner:** Mobile Team (1 person, 2-3 days full-time)

**Output:** APK tested, ready for Play Store, no critical bugs

#### AWS ↔ Oracle Failover (40 hours)
- Data sync automation (8h): CDC pipeline, conflict resolution
- Failover automation (8h): Route53 switching, DNS propagation
- Failover testing (16h): Supabase down → Oracle takes over (<1s)
  - Test scenarios: connection failure, data corruption, network partition
  - Measure: request latency, data consistency, error rates
- Runbooks (8h): what to do if failover happens, how to manually switch back

**Owner:** DevOps Team (1 person, 5 days full-time)

**Output:** Seamless failover working, zero data loss, team trained

---

### Week 3: Architecture Audit (50 hours)

#### Code Security Audit (16 hours)
- Dependency scanning (2h): npm audit, check for known CVEs
- Hardcoded secrets (2h): scan all code for AWS keys, DB passwords
- OWASP Top 10 (8h): SQL injection, XSS, CSRF, auth bypass, insecure deserialization
- Cryptography review (2h): verify TLS 1.2+, cipher suites, key management
- API security (2h): rate limiting, input validation, output encoding

**Owner:** Security Team (1 person, 2 days full-time)

#### Infrastructure Audit (14 hours)
- AWS security (6h): security groups, IAM least privilege, encryption everywhere
- Oracle security (4h): user privileges, audit logging, network isolation
- Network security (2h): VPN tunnel, Direct Connect security, no open ports
- Monitoring (2h): logging enabled everywhere, alerts configured

**Owner:** DevOps + Security (1 person, 2 days full-time)

#### Compliance Verification (8 hours)
- LGPD Article 5 (2h): lawful processing, audit trail shows consent
- LGPD Article 9 (2h): health data safeguards, encryption present
- LGPD Article 10 (2h): audit controls, logging comprehensive
- LGPD Article 18 (1h): data deletion API works end-to-end
- HIPAA (if applicable) (1h): encryption, audit, access control

**Owner:** Legal + Security (shared, 1 day full-time)

#### Broken Link Detection (8 hours)
- Automated scan (4h): all URLs in app, all API endpoints, external links
- Manual verification (2h): critical paths tested (login, diary save, payment)
- Database integrity (2h): foreign keys valid, indexes present, no orphans

**Owner:** QA + Backend (1 person, 1 day full-time)

**Output:** Audit report signed off, all critical/high issues fixed

---

### Week 4: Play Store Launch (25 hours)

#### Play Store Configuration (10 hours)
- App listing (3h): description, screenshots, category, rating
- APK upload (2h): sign, version, release notes
- Staged rollout (2h): 1% → 10% → 50% → 100% over days
- Monitoring (3h): watch approval status, respond to reviewer questions

**Owner:** Product/Mobile Lead (1 person, 1-2 days)

#### Go-Live Execution (15 hours)
- Pre-launch (2h): health checks, final backup, team briefing
- Launch moment (1h): Play Store release, marketing announce, notifications
- First 24h monitoring (5h): error rates, performance, user feedback
- First week support (5h): respond to bugs, collect feedback, hotfix if needed
- Post-launch review (2h): what went well, what to improve

**Owner:** CTO + On-Call Team (1 person primary, +backup)

**Output:** App live on Play Store, <0.1% error rate, user satisfaction high

---

## PARALLEL WORKSTREAMS (Can overlap)

These can run simultaneously to save time:

```
Week 1 Parallelization:
├─ AWS Setup (40h) ← DevOps Team A
├─ Oracle Setup (40h) ← DevOps Team B + Oracle DBA
└─ APK Build prep (start build locally) ← Mobile Team

Week 2 Parallelization:
├─ APK Testing (20h) ← Mobile Team
└─ Failover Testing (40h) ← DevOps Team

Week 3 Parallelization:
├─ Architecture Audit (50h) ← Security Team
└─ Fix issues found (in parallel) ← Backend Team

Week 4:
├─ Play Store Config (10h) ← Product Team
└─ Launch + Monitoring (15h) ← CTO + On-Call
```

**Time savings with parallelization:** 30+ hours (2.5 days)

---

## WHAT COULD GO WRONG (Risk Mitigation)

| Risk | Impact | Mitigation |
|------|--------|-----------|
| AWS account approval delayed | +1-2 weeks | Request approval NOW, not week before |
| Oracle Direct Connect unavailable | +3-4 weeks | Start provisioning immediately (takes 2-4 weeks) |
| APK build failures | +1 week | Test build process in S17, don't wait for S18 |
| Failover data loss | Project death | Test failover multiple times, have rollback plan |
| Play Store rejects APK | 1-2 weeks delay | Get reviewer guidelines early, test on real device |
| Architecture audit finds critical issues | +1-2 weeks | Do early audit in S17, fix incrementally |
| Go-live bugs in production | Reputation damage | Have hotfix team ready, monitor closely first 24h |

---

## SUCCESS CRITERIA (What "Done" Looks Like)

```
✅ S16 Fundação:
   - E2E encryption live on 4 tables
   - JIT infrastructure operational (Teleport)
   - Crisis plan templates ready + tested
   - 80% of risk mitigated
   - LGPD/HIPAA compliance path clear

✅ S17 Perímetro:
   - CerberOS Layers 0-3 detecting anomalies
   - ETERNAL MAZE honeypots active
   - ML model trained (95%+ detection, <5% false positive)
   - Aprisionamiento working (10+ rules tested)
   - Additional 30M risk mitigated
   - ISO 27001 compliance ready

✅ S18 Produção:
   - AWS infrastructure live (VPC, EC2, RDS, CloudFront)
   - Oracle backup + HA working
   - APK tested locally (all features, 100 checklist items)
   - AWS ↔ Oracle failover working (<1s, zero data loss)
   - Architecture audit clean (no critical/high findings)
   - All broken links fixed
   - Play Store listing approved
   - Monitoring + alerting operational
   - On-call team trained + ready
   - Go-live execution smooth
   - <0.1% error rate post-launch
   - User ratings > 4.0 stars

✅ Play Store:
   - App available for download
   - First 100 downloads within 24h
   - Zero critical bugs in first week
   - Users can register, use all features
   - Encryption working (verified in logs)
   - Performance acceptable (<2s app launch)
```

---

## IMMEDIATE NEXT STEPS (This Week)

1. **[ ] Verify S16 complete**
   - All 3 decisions approved? (signatures collected?)
   - E2E encryption live?
   - JIT infrastructure operational?
   - Crisis plan tested?

2. **[ ] Confirm team capacity**
   - DevOps: 2 people for 6 weeks (S17-S18)?
   - Security: 1-2 people for 6 weeks?
   - Mobile: 1 person for APK testing?
   - Backend: available for integration?

3. **[ ] Finalize 4 design decisions**
   - ML algorithm (Isolation Forest? LSTM?)
   - ETERNAL MAZE trap count (3? 5? 10?)
   - Aprisionamiento duration (indefinite? auto-release?)
   - Data sync frequency (real-time? hourly?)

4. **[ ] Start Oracle/AWS account provisioning**
   - Request AWS account + elevate permissions
   - Start Oracle Direct Connect provisioning (2-4 weeks lead time!)
   - Reserve IP ranges
   - Plan database schema migration

5. **[ ] Schedule parallel workstreams**
   - Daily standup: 9am UTC, #s17-standup
   - AWS team checkpoint: daily
   - Oracle team checkpoint: daily
   - Architecture review: weekly (Thursdays)
   - Leadership update: weekly (Fridays)

---

## REFERENCE DOCUMENTS (Read These)

```
Master Document:
  → COMPLETE_ROADMAP_TO_PLAYSTORE.md (read weekly, update progress)

S16 Context:
  → S16_DECISIONS/HYGEIOS_CERBERIOS_INTEGRATION.md
  → SESSION_CLOSURE_FOR_NEXT_SESSION.md
  → THREAT_MODEL_STRIDE.md (threat context)

Architecture:
  → AWS architecture diagram (create with Lucidchart/Draw.io)
  → Oracle Data Guard diagram (12c High Availability)
  → Failover flow diagram (Supabase → Oracle switch)

Checklists:
  → APK testing checklist (100+ items)
  → Security audit checklist (OWASP + compliance)
  → Go-live checklist (pre-launch, launch, post-launch)
  → On-call runbook (what to do when things break)
```

---

**This is your complete roadmap to Play Store launch.**  
**Update progress weekly, adjust timeline as needed, escalate blockers immediately.**

**Target: September 9, 2026 - App Live on Play Store** 🚀

