# 🚀 COMPLETE ROADMAP: S16 → S17 → S18 → PLAY STORE
**Status:** Planning Phase Ready  
**Target Launch:** Q3 2026 (estimated 12-16 weeks from now)  
**Total Effort:** 608+ hours across 3 teams

---

## 📋 EXECUTIVE SUMMARY

```
S16 (Fundação):       Security Prevention Layer          [4-6 weeks | 133h]
  ├─ E2E Encryption server-side (15h)
  ├─ JIT Infrastructure Teleport (10h)
  ├─ Crisis Communication Plan (8h)
  ├─ RLS + Ownership validation (40h from S15 base)
  └─ Testing + Deployment (60h)

S17 (Perímetro):      Security Detection Layer          [7-8 weeks | 285h]
  ├─ CerberOS Layers 0-3 (180h)
  ├─ ETERNAL MAZE honeypot (80h)
  ├─ Aprisionamiento active defense (25h)
  └─ Testing + Deployment (40h)

S18 (Produção):       Infrastructure + Testing + Launch [3-4 weeks | 190h]
  ├─ AWS Setup (VPC, EC2, RDS, CloudFront) (40h)
  ├─ Oracle Setup (backup, HA, DR) (40h)
  ├─ APK Testing on Local Build (20h)
  ├─ AWS/Oracle Mirroring + Failover (30h)
  ├─ Architecture Security Audit (40h)
  ├─ Broken Link Detection + Fixes (10h)
  ├─ Play Store Configuration (10h)
  └─ Go-Live + Monitoring (5h)

TOTAL: 608+ hours | 14-18 weeks | 3 teams
```

---

## 🎯 PHASE-BY-PHASE EXECUTION PLAN

---

# PHASE 1: S16 FUNDAÇÃO (May 27 - July 8, 2026)
## Security Prevention Layer - 133 hours

### Week 1-2: E2E Encryption + JIT Setup (Parallel)

#### Task 1.1: E2E Encryption Implementation
**Owner:** Backend Team  
**Effort:** 15 hours  
**Timeline:** Week 1, May 27 - May 31  

```
Day 1-2 (Mon-Tue):
  [ ] Database migrations (4 tables): 3h
      └─ diario_entries: content_encrypted + nonce
      └─ nutrition_logs: description_encrypted + nonce
      └─ chat_messages: content_encrypted + nonce
      └─ wonder_night_logs: reflection_encrypted + nonce
  
  [ ] Key derivation function: 2h
      └─ PBKDF2(password + userId, 100k iterations, 32 bytes)
      └─ Never stored, derived on login
  
  [ ] AES-256-GCM encryption logic: 3h
      └─ encryptField() function
      └─ decryptField() function
      └─ GCM authentication tag validation

Day 3 (Wed):
  [ ] Mobile client integration: 4h
      └─ DiaryScreen write path (encrypt before send)
      └─ DiaryDetailScreen read path (decrypt on load)
      └─ Error handling (decryption failures)
      └─ Loading states (async encryption)

Day 4 (Thu):
  [ ] Edge Function crypto helpers: 2h
      └─ POST /functions/v1/crypto/encrypt
      └─ POST /functions/v1/crypto/decrypt
      └─ Deno crypto imports

Day 5 (Fri):
  [ ] Testing + QA: 1h
      └─ Unit tests: encryptField, decryptField, deriveKey
      └─ Integration tests: write encrypted, read decrypted
      └─ Rollback tests: old plaintext entries still accessible
```

**Deliverable:** E2E encryption live on 4 tables, mobile client working, all tests passing

---

#### Task 1.2: JIT Infrastructure Setup (Teleport)
**Owner:** DevOps Team  
**Effort:** 10 hours  
**Timeline:** Week 1, May 27 - May 31  

```
Day 1-2 (Mon-Tue):
  [ ] Teleport Cloud provisioning: 2h
      └─ Account creation + admin setup
      └─ EC2 t3.medium proxy instance launch
      └─ SSL certificate generation
  
  [ ] Database proxy configuration: 2h
      └─ supabase-prod database registration
      └─ Connection pooling setup
      └─ MFA + approval requirement enabled

Day 3 (Wed):
  [ ] RBAC role definition: 2h
      └─ dba role (production full access)
      └─ developer role (staging only)
      └─ Setup Slack notifications for approvals

Day 4 (Thu):
  [ ] Service role vault setup: 2h
      └─ SUPABASE_SERVICE_ROLE_KEY stored in Teleport vault
      └─ Auto-rotation every 30 days configured
      └─ Access logs directed to #security-alerts

Day 5 (Fri):
  [ ] Testing + Documentation: 2h
      └─ Test Scenario 1: Authorized access (approved, works)
      └─ Test Scenario 2: Denied access (admin denies, blocked)
      └─ Test Scenario 3: Session expiry (auto-logout after 15 min)
      └─ Runbook created for team
```

**Deliverable:** Teleport operational, service role key vaulted, all access logged, admin approval required for every connection

---

#### Task 1.3: Crisis Communication Plan
**Owner:** PR/Comms Team  
**Effort:** 8 hours  
**Timeline:** Week 1, May 27 - May 31  

```
Day 1 (Mon):
  [ ] Crisis Owner designation + training: 2h
      └─ CEO designates Crisis Owner
      └─ Escalation chain reviewed + signed off
      └─ 24/7 contact list created

Day 2 (Tue):
  [ ] Template development: 3h
      └─ Twitter response templates (3 tiers: quick, medium, detailed)
      └─ Press release template (500 words)
      └─ In-app notification templates
      └─ Media talking points

Day 3 (Wed):
  [ ] Slack #crisis channel setup: 1h
      └─ Members added + access permissions
      └─ Notification rules configured
      └─ Pinned: This plan + templates + contact info

Day 4 (Thu):
  [ ] Monitoring setup: 1h
      └─ Twitter Advanced Search configured
      └─ Google Alerts + Reddit notifications
      └─ Hashtag tracking automated

Day 5 (Fri):
  [ ] Mock crisis drill: 1h
      └─ Scenario: Fake #DeleteAquarios hashtag
      └─ Measurement: Time to approved response
      └─ Target: < 60 minutes
      └─ Success: Response posted within 1 hour
```

**Deliverable:** Crisis templates + Slack automation live, team trained, mock drill successful

---

### Week 2-4: Core S16 Development (40h)

#### Task 1.4: RLS + Ownership Validation (Continue from S15)
**Owner:** Backend Team  
**Effort:** 20 hours  
**Timeline:** Week 2-3  

```
Week 2:
  [ ] Verify RLS on all sensitive tables: 8h
      └─ profiles (auth.uid() = id) ✅
      └─ diario_entries (auth.uid() = user_id) ✅
      └─ nutrition_logs (auth.uid() = user_id) ✅
      └─ chat_messages (auth.uid() = user_id) ✅
      └─ Test: Cross-account access blocked
  
  [ ] Ownership validation in Edge Functions: 8h
      └─ Every function validates: userId from request = auth.uid()
      └─ Prevent parameter tampering (e.g., earn_xp for another user)
      └─ Return error if mismatch
  
  [ ] Rate limiting (rate_limit_log table): 4h
      └─ Create rate_limit_log table
      └─ Track requests per user
      └─ Enforce: Max 100 requests/minute
```

**Deliverable:** RLS + ownership validated end-to-end, rate limiting operational

---

#### Task 1.5: Audit Logging Infrastructure
**Owner:** Backend Team  
**Effort:** 10 hours  
**Timeline:** Week 3  

```
  [ ] Create hygeios_audit_log table: 2h
      └─ user_id, action, layer, timestamp, ip_address, plan
      └─ RLS: Users see only their own logs (if needed)
  
  [ ] Log all sensitive operations: 5h
      └─ diary read/write
      └─ health data access
      └─ chat history access
      └─ community data access
  
  [ ] Audit log export + retention: 3h
      └─ Daily export to S3 (AWS)
      └─ 3-year retention (LGPD requirement)
      └─ Encryption in S3
```

**Deliverable:** Comprehensive audit logs, compliant with LGPD Article 10

---

#### Task 1.6: Data Isolation Fixes (From Audit)
**Owner:** Backend Team  
**Effort:** 10 hours  
**Timeline:** Week 2-3  

```
  [ ] Fix user_xp table (add RLS): 2h
      └─ CREATE POLICY "user_xp_own_data" ON user_xp
      └─ FOR ALL USING (auth.uid() = user_id)
  
  [ ] Plan-based access control: 5h
      └─ Free users: CANNOT see premium community data
      └─ Starter users: CAN see bronze community layer
      └─ Premium users: CAN see bronze + silver layers
      └─ Professional: CAN see all layers
  
  [ ] Service role bypass prevention: 3h
      └─ Edge functions validate auth.uid()
      └─ Service role ONLY used for admin tasks
      └─ Every query triggers audit log
```

**Deliverable:** All data isolation gaps from S15 audit fixed

---

### Week 4-6: Testing + Deployment (60h)

#### Task 1.7: Security Testing
**Owner:** QA + Security Team  
**Effort:** 25 hours  
**Timeline:** Week 4-5  

```
RLS Testing (8h):
  [ ] Test 1: Free user CANNOT query Premium user's diary
  [ ] Test 2: Premium user CANNOT modify another user's XP
  [ ] Test 3: rate_limit_log isolated by user_id
  [ ] Test 4: Service role admin operations don't bypass intent
  [ ] Test 5: user_xp table properly RLS protected
  [ ] Test 6: Cross-account attempts blocked at DB level
  [ ] Test 7: Plan-based layer access enforced
  [ ] Test 8: Audit log captures all sensitive operations

E2E Encryption Testing (8h):
  [ ] Encrypt diary entry → decrypt matches original
  [ ] Wrong password → decryption fails gracefully
  [ ] Old plaintext entries still readable
  [ ] New entries automatically encrypted
  [ ] Migration: Historical data encrypted without downtime
  [ ] Performance: Encryption/decryption < 100ms per field

JIT Testing (5h):
  [ ] Authorized access request approved → access granted
  [ ] Denied access → session blocked immediately
  [ ] Time limit: Access auto-revokes after 15 min
  [ ] Service role key truly vaulted (not in .env)
  [ ] Audit trail complete (WHO, WHAT, WHEN)

Crisis Plan Testing (4h):
  [ ] Mock attack detection (< 15 min)
  [ ] Response approval (< 45 min from detection)
  [ ] Message publication (< 60 min total)
  [ ] Team coordination smooth
```

**Deliverable:** All security controls tested, vulnerabilities fixed, audit passed

---

#### Task 1.8: S16 Deployment + Monitoring
**Owner:** DevOps Team  
**Effort:** 35 hours  
**Timeline:** Week 5-6  

```
Pre-Production (15h):
  [ ] Staging environment setup
  [ ] Blue-green deployment strategy
  [ ] Rollback plan documented
  [ ] Metrics + monitoring setup
      └─ Encryption performance (latency)
      └─ Rate limiting effectiveness
      └─ Audit log volume
      └─ Error rates on new functions

Production Deployment (15h):
  [ ] Phase 1: Deploy E2E encryption (5h)
      └─ Enable for new entries only
      └─ Old entries readable without decryption
      └─ Monitor for errors 48h
  
  [ ] Phase 2: Deploy JIT infrastructure (5h)
      └─ Route all DB access through Teleport
      └─ Verify all queries logged
      └─ Monitor Slack notifications
  
  [ ] Phase 3: Activate RLS + ownership checks (5h)
      └─ Test suite re-run on production data
      └─ Verify no users locked out
      └─ Monitor error logs for RLS violations

Post-Deployment Monitoring (5h):
  [ ] Week 1: Daily check-ins (5h)
      └─ Encryption errors?
      └─ JIT access requests flowing?
      └─ Audit logs healthy?
      └─ Performance impact < 5%?
```

**Deliverable:** S16 live in production, all security controls operational, monitoring in place

---

## 🎖️ S16 Success Criteria

```
✅ E2E encryption on 4 tables (diario, nutrition, chat, wonder)
✅ JIT access control (Teleport) operational
✅ Crisis communication plan live + tested
✅ RLS + ownership validation on all user data
✅ Rate limiting working (100 req/min per user)
✅ Audit logging comprehensive (LGPD Article 10)
✅ Plan-based data isolation enforced
✅ Zero cross-account data access possible
✅ All security tests passing
✅ Monitoring + alerting configured
✅ Team trained on new systems
✅ R$212.4M in risk mitigated
✅ LGPD/HIPAA/ISO 27001 compliant
```

---

---

# PHASE 2: S17 PERÍMETRO (July 9 - August 19, 2026)
## Security Detection Layer - 285 hours

### Week 1-2: Design Finalization + Baseline Data

#### Task 2.1: CerberOS Layer 0 (DDoS + WAF)
**Owner:** DevOps Team  
**Effort:** 40 hours  

```
Week 1 (15h):
  [ ] AWS Shield + Cloudflare setup: 10h
      └─ DDoS detection threshold tuning
      └─ WAF rules (SQL injection, XSS, path traversal)
      └─ Rate limiting at edge (100 req/sec per IP)
      └─ Monitoring + alerting
  
  [ ] Testing: 5h
      └─ Simulate DDoS (rate limiting works)
      └─ Simulate SQLi (blocked by WAF)
      └─ Verify legitimate traffic passes
```

---

#### Task 2.2: CerberOS Layer 1 (ML Anomaly Detection)
**Owner:** Security + ML Team  
**Effort:** 60 hours  

```
Week 1-2 (20h):
  [ ] ML algorithm selection + training setup: 10h
      └─ Decision: Isolation Forest vs LSTM vs Autoencoder
      └─ Data source: hygeios_audit_log from S16 (1+ month baseline)
      └─ Training set: 80%, validation: 20%
  
  [ ] Feature engineering: 10h
      └─ Metrics: request rate, data size, geographic location, time of day
      └─ Anomaly scoring: 0-100 (>70 = alert)
      └─ Thresholds: low (50-70), medium (70-85), high (85-95), critical (95+)

Week 2-3 (40h):
  [ ] Model training + validation: 30h
      └─ Train on historical data (1-2 months S16)
      └─ Validate on hold-out test set
      └─ Measure: precision, recall, F1 score
      └─ Target: 95%+ detection rate, <5% false positive rate
  
  [ ] Real-time scoring pipeline: 10h
      └─ Every HygeiOS event → ML score
      └─ Scores stored in cerberos_anomaly_scores table
      └─ < 100ms latency requirement
```

---

#### Task 2.3: CerberOS Layer 2 (Protocol Anomaly Detection)
**Owner:** Security Team  
**Effort:** 20 hours  

```
Week 3 (20h):
  [ ] TLS handshake inspection: 8h
      └─ ClientHello parsing
      └─ Cipher suite validation
      └─ TLS version checking (block TLS < 1.2)
  
  [ ] Protocol anomaly rules: 8h
      └─ Unusual cipher combinations
      └─ Re-negotiation attempts
      └─ Session resumption abuse
  
  [ ] Testing: 4h
      └─ Legitimate clients pass
      └─ Botnet signatures detected + blocked
```

---

#### Task 2.4: CerberOS Layer 3 (Deep Packet Inspection)
**Owner:** Security Team  
**Effort:** 40 hours  

```
Week 3-4 (40h):
  [ ] Request content validation: 15h
      └─ Parse JSON body
      └─ Validate userId matches auth context
      └─ Check parameter ranges (e.g., earn_xp amount)
      └─ Detect injection attempts
  
  [ ] Data size anomaly detection: 10h
      └─ Request size vs historical average
      └─ Response size vs expected
      └─ Flag if 10x+ deviation
  
  [ ] Query pattern detection: 10h
      └─ Access time patterns
      └─ User count accessed in single request
      └─ Unusual query combinations
  
  [ ] Testing + tuning: 5h
      └─ Legitimate requests pass through
      └─ Suspicious requests flagged/blocked
```

---

#### Task 2.5: ETERNAL MAZE Design Workshop
**Owner:** Security + CTO Team  
**Effort:** 30 hours  

```
Week 4 (30h):
  [ ] Honeypot architecture design: 10h
      └─ How many traps? (3? 5? 10?)
      └─ Where are they? (database mirrors, fake data endpoints, etc.)
      └─ What data lives in honeypots? (canaries, fake user records)
  
  [ ] Resource quota system design: 10h
      └─ CPU quota per request
      └─ Memory quota per session
      └─ Network bandwidth quota
      └─ Storage quota per user
      └─ What happens when exceeded? (jail + analysis)
  
  [ ] Aprisionamiento mechanics: 10h
      └─ 10+ trigger rules for entering MAZE
      └─ Duration: indefinite? auto-release? manual?
      └─ Escape routes: possible? intentional? impossible by design?
      └─ What the attacker sees (feedback, error messages)
```

---

### Week 5-8: Implementation + Testing (245h)

#### Task 2.6: HygeiOS Stages 4-5 Implementation
**Owner:** CTO + Backend Team  
**Effort:** 40 hours  

```
Week 5 (40h):
  [ ] Stage 4: JWT Token Generation: 15h
      └─ Token structure: userId, plan, layers, expiry
      └─ Signing: HYGEIOS_SECRET from Teleport vault
      └─ Token storage: hygeios_tokens table + Redis cache
      └─ Auto-revocation on session logout
  
  [ ] Stage 5: Aprisionamiento Integration: 15h
      └─ Detection signals from CerberOS
      └─ Aprisionamiento triggers (geolocation, rate, behavior)
      └─ Action: MFA re-auth, rate limit, block, honeypot
  
  [ ] Integration testing: 10h
      └─ HygeiOS Stages 1-5 end-to-end
      └─ CerberOS signals → HygeiOS response
      └─ Audit trail complete
```

---

#### Task 2.7: Aprisionamiento Implementation
**Owner:** Security + Backend Team  
**Effort:** 25 hours  

```
Week 6 (25h):
  [ ] Aprisionamiento rules engine: 12h
      └─ Trigger rule 1: Impossible travel (Brazil → Russia in <1 hour)
      └─ Trigger rule 2: Bulk data export (>1000 rows in 60s)
      └─ Trigger rule 3: Cross-user data access (5+ different users)
      └─ Trigger rule 4: After-hours access (unusual time)
      └─ Trigger rule 5: New geolocation + new device
      └─ Trigger rule 6-10: (to be defined)
  
  [ ] Trap network construction: 8h
      └─ Honeypot database mirror (fake user data)
      └─ Resource quota enforcement
      └─ Monitoring + logging for analysis
  
  [ ] User experience: 5h
      └─ Error messages (don't reveal you're in trap)
      └─ Slowness (intentional latency to waste attacker time)
      └─ Escape detection (monitor for escape attempts)
```

---

#### Task 2.8: CerberOS Testing + Deployment
**Owner:** QA + Security + DevOps  
**Effort:** 100 hours  

```
Week 6-7 (100h):
  [ ] Unit testing (20h):
      └─ Layer 0: DDoS detection tests
      └─ Layer 1: ML anomaly detection accuracy tests
      └─ Layer 2: Protocol anomaly tests
      └─ Layer 3: DPI content validation tests
      └─ All unit tests: 100% passing
  
  [ ] Integration testing (30h):
      └─ Layers 0-3 working together
      └─ False positive rate validation
      └─ Detection latency < 100ms
      └─ Storage capacity under load
  
  [ ] Security testing (30h):
      └─ Penetration testing (attempt to bypass layers)
      └─ Red team exercises (simulate real attacks)
      └─ Trap network validation (ensure no escape)
  
  [ ] Load testing (15h):
      └─ 1M+ concurrent users
      └─ ML inference latency under load
      └─ Database query performance
      └─ Memory usage acceptable
  
  [ ] Deployment (5h):
      └─ Canary deployment (10% traffic first)
      └─ Monitor error rates, false positives
      └─ Full rollout if healthy
```

---

## 🎖️ S17 Success Criteria

```
✅ HygeiOS Stages 1-5 fully operational
✅ CerberOS Layers 0-3 detecting anomalies
✅ ETERNAL MAZE honeypots active
✅ Aprisionamiento rules tested (10+ rules, all triggering correctly)
✅ ML model trained (95%+ detection, <5% false positive)
✅ <100ms latency for all detections
✅ Zero attacks undetected in testing
✅ Monitoring + alerting fully configured
✅ Team trained on CerberOS operations
✅ Post-incident review process documented
✅ Additional R$30M risk mitigated
```

---

---

# PHASE 3: S18 PRODUÇÃO (August 20 - September 9, 2026)
## Infrastructure + Testing + Play Store Launch - 190 hours

### Week 1: AWS + Oracle Infrastructure (80h)

#### Task 3.1: AWS Setup (VPC, EC2, RDS, CloudFront)
**Owner:** DevOps/AWS Team  
**Effort:** 40 hours  

```
Day 1-2 (Mon-Tue) - 8h:
  [ ] VPC creation: 3h
      └─ Public subnet (web servers)
      └─ Private subnet (RDS database)
      └─ NAT Gateway (outbound traffic)
      └─ Security groups (inbound/outbound rules)
  
  [ ] EC2 instances: 3h
      └─ 2x t3.large (web servers, load-balanced)
      └─ 1x t3.medium (Teleport proxy)
      └─ Auto-scaling group (scale to 4 on high load)
  
  [ ] IAM roles + permissions: 2h
      └─ EC2 role (read S3, write CloudWatch logs)
      └─ Service roles (access Supabase, send emails)

Day 3-4 (Wed-Thu) - 8h:
  [ ] RDS (PostgreSQL): 4h
      └─ Multi-AZ deployment (automatic failover)
      └─ Automated backups (7-day retention)
      └─ Encryption at rest (AES-256)
      └─ Read replicas in secondary region
  
  [ ] CloudFront CDN: 3h
      └─ Cache policy (static assets, 1 year)
      └─ Dynamic content (short TTL, bypass cache for API)
      └─ HTTPS only (redirect HTTP → HTTPS)
  
  [ ] S3 buckets: 1h
      └─ Audit logs bucket (private, versioning)
      └─ User uploads bucket (private, versioning)
      └─ Backups bucket (encrypted, 3-year retention)

Day 5 (Fri) - 4h:
  [ ] Monitoring + alerting: 2h
      └─ CloudWatch dashboards (CPU, memory, disk, network)
      └─ SNS alerts (CPU >80%, errors >1%, response time >2s)
  
  [ ] Testing: 2h
      └─ Health checks working
      └─ Failover tested (kill one instance, traffic routes to other)
      └─ Backups verified (can restore from backup)

PERMISSIONS REQUIRED (Supabase + AWS):
✅ AWS IAM:
   - ec2:RunInstances, ec2:TerminateInstances (auto-scaling)
   - rds:CreateDBInstance, rds:DeleteDBInstance (database)
   - s3:CreateBucket, s3:PutObject, s3:GetObject (storage)
   - cloudfront:CreateDistribution (CDN)
   - cloudwatch:PutMetricAlarm (monitoring)
   - sns:Publish (notifications)

✅ Supabase:
   - Database: Full access (connection strings, user management)
   - Storage: Bucket creation, object access
   - Functions: Deploy Edge Functions
   - Auth: OAuth provider setup
```

---

#### Task 3.2: Oracle Setup (Backup, HA, Disaster Recovery)
**Owner:** DevOps/Oracle Team  
**Effort:** 40 hours  

```
Day 1-2 (Mon-Tue) - 8h:
  [ ] Oracle Database Enterprise setup: 5h
      └─ Exadata X10M (or equivalent cloud offering)
      └─ Data Guard replication (sync to secondary region)
      └─ Automatic backup (hourly snapshots, 30-day retention)
  
  [ ] Networking: 3h
      └─ VPN tunnel to AWS VPC
      └─ Direct Connect (dedicated network link for low latency)
      └─ Security groups (only Teleport proxy can access)

Day 3-4 (Wed-Thu) - 8h:
  [ ] Data Sync Strategy: 4h
      └─ Initial sync: All current Supabase data → Oracle
      └─ Continuous replication (audit logs, user data)
      └─ Conflict resolution (if both systems write simultaneously)
      └─ Failover procedure (switch to Oracle if Supabase fails)
  
  [ ] Backup + Recovery: 4h
      └─ RMAN backups (every 6 hours)
      └─ Incremental backups (block change tracking)
      └─ Recovery testing (can restore from any backup point)

Day 5 (Fri) - 4h:
  [ ] HA setup: 2h
      └─ Data Guard Broker (automatic failover)
      └─ Observer process (detect failures in <30s)
  
  [ ] Testing: 2h
      └─ Failover tested (AWS → Oracle, <1s switchover)
      └─ Data consistency verified
      └─ Performance impact measured

PERMISSIONS REQUIRED (Oracle + AWS):
✅ Oracle:
   - Create tablespaces, users, tables
   - Export/import data (Data Pump)
   - Create Data Guard configuration
   - Manage backups (RMAN commands)
   - Monitor HA status

✅ AWS:
   - Direct Connect setup (network team)
   - Route53 weighted routing (failover DNS)
   - VPN tunnel to Oracle network
```

---

### Week 2: APK Testing + Mirroring (60h)

#### Task 3.3: Local APK Build + Testing
**Owner:** Mobile Team  
**Effort:** 20 hours  

```
Day 1-2 (Mon-Tue) - 8h:
  [ ] Build APK locally: 4h
      └─ npm run build:android (Expo SDK 56)
      └─ Sign APK (keystore, certificate)
      └─ Test on physical device (Android 12+)
      └─ Verify all features work
  
  [ ] APK testing checklist: 4h
      └─ [ ] Auth works (login, logout, reset password)
      └─ [ ] Diary CRUD (create, read, update, delete)
      └─ [ ] Nutrition logging
      └─ [ ] Chat with ProteOS (IA responses)
      └─ [ ] Communities view + join
      └─ [ ] Wonder Night reflections
      └─ [ ] XP earning + leaderboard
      └─ [ ] Settings (privacy, notifications, profile)
      └─ [ ] Offline mode (data caching)
      └─ [ ] E2E encryption (verify data encrypted)

Day 3-4 (Wed-Thu) - 8h:
  [ ] Performance testing: 4h
      └─ App launch time (< 3 seconds)
      └─ Screen transition time (< 1 second)
      └─ Data sync time (< 5 seconds for 100KB data)
      └─ Memory usage (< 200MB at rest)
      └─ Battery drain (< 10% per 8 hours standby)
  
  [ ] Crash testing: 4h
      └─ Kill app while uploading data (recover gracefully)
      └─ Network disconnection (save draft, retry on reconnect)
      └─ Low storage (warn user, graceful degradation)
      └─ High CPU usage (background tasks don't freeze UI)

Day 5 (Fri) - 4h:
  [ ] Security testing: 2h
      └─ Verify encryption working (try reading plaintext from logs)
      └─ Verify no API keys in APK (scan binaries)
      └─ Verify no credentials in memory
  
  [ ] Documentation: 2h
      └─ Test results summary
      └─ Known issues (if any)
      └─ Workarounds for issues
```

**Deliverable:** APK tested on physical device, all features working, ready for Play Store

---

#### Task 3.4: AWS ↔ Oracle Mirroring + Failover Testing
**Owner:** DevOps Team  
**Effort:** 40 hours  

```
Week 2 - 40h:

Day 1-2 (Mon-Tue):
  [ ] Data sync architecture: 8h
      └─ AWS Supabase → Oracle initial full sync (bulk export)
      └─ Continuous replication: CDC (Change Data Capture)
      └─ Audit logs table → Oracle (real-time)
      └─ User data tables → Oracle (nightly or hourly)
  
  [ ] Failover testing (AWS → Oracle): 8h
      └─ Scenario 1: Supabase connection fails
         └─ Application detects (connection timeout)
         └─ DNS switches to Oracle IP (via Route53)
         └─ Oracle serves requests within 1 second
      
      └─ Scenario 2: Supabase data corruption
         └─ Validation checks detect (data hash mismatch)
         └─ Automatic switch to Oracle
         └─ Data consistency verified

Day 3-4 (Wed-Thu):
  [ ] Failover automation: 8h
      └─ Health check script (ping Supabase every 10s)
      └─ Automatic DNS switch (if health check fails 3x)
      └─ Notification to security team (Slack alert)
      └─ Rollback procedure (switch back when Supabase recovers)
  
  [ ] Load testing under failover: 8h
      └─ Normal load on AWS (100 req/s)
      └─ Trigger failover to Oracle
      └─ Measure: Requests lost? Latency increase?
      └─ Verify: Data consistency across both systems

Day 5 (Fri):
  [ ] Documentation + runbook: 8h
      └─ Step-by-step failover manual
      └─ Automated failover documentation
      └─ Rollback procedure
      └─ Troubleshooting guide
      └─ On-call runbook (what to do if Oracle fails)
```

**Deliverable:** Seamless failover between AWS and Oracle, <1s switchover, zero data loss

---

### Week 3: Architecture Security Review (50h)

#### Task 3.5: Architecture Audit + Broken Link Detection
**Owner:** Security + Architecture Team  
**Effort:** 50 hours  

```
Week 3 - 50h:

Day 1-2 (Mon-Tue) - 16h:
  [ ] Code security audit: 8h
      └─ Dependency vulnerabilities (npm audit, cargo audit)
      └─ No hardcoded secrets (scan for AWS keys, DB passwords)
      └─ SQL injection vectors (check all queries)
      └─ XSS vulnerabilities (input validation on all forms)
      └─ CSRF protection (all state-changing requests)
      └─ Authentication bypasses (try to access protected routes)
  
  [ ] Architecture review: 8h
      └─ Are all secrets in vault? (Teleport, Supabase, AWS Secrets Manager)
      └─ Are all connections TLS 1.2+?
      └─ Are all logs encrypted at rest?
      └─ Are backups encrypted + stored securely?
      └─ Is rate limiting enforced at all layers?

Day 3 (Wed) - 14h:
  [ ] Broken link detection: 8h
      └─ Automated scan: check all URLs in app
         └─ API endpoints (verify all return 200 OK)
         └─ Deep links (verify navigation works)
         └─ External URLs (privacy policy, terms of service)
         └─ Asset URLs (images, fonts load correctly)
      
      └─ Manual verification: test critical paths
         └─ Login flow
         └─ Diary save → load
         └─ Payment flow (if applicable)
         └─ Account deletion
  
  [ ] Database integrity check: 6h
      └─ Foreign key relationships (all references valid)
      └─ Indexes present (query performance OK)
      └─ No orphaned rows (cleanup scripts)
      └─ Backup integrity (can restore cleanly)

Day 4 (Thu) - 14h:
  [ ] Infrastructure security audit: 8h
      └─ AWS security groups (least privilege)
      └─ IAM policies (minimal permissions)
      └─ VPC configuration (private subnets isolated)
      └─ Encryption in transit (TLS everywhere)
      └─ Encryption at rest (all storage encrypted)
  
  [ ] Compliance verification: 6h
      └─ LGPD Article 5: Lawful processing ✅ (audit logs prove consent)
      └─ LGPD Article 9: Health safeguards ✅ (E2E encryption)
      └─ LGPD Article 10: Audit controls ✅ (comprehensive logging)
      └─ LGPD Article 18: Data deletion ✅ (deletion API works)
      └─ HIPAA (if applicable): Encryption, audit, access control ✅

Day 5 (Fri) - 6h:
  [ ] Generate audit report: 3h
      └─ List all findings (critical, high, medium, low)
      └─ Risk assessment for each
      └─ Remediation steps
      └─ Timeline for fixes
  
  [ ] Fix critical issues: 3h
      └─ If critical issues found, fix immediately
      └─ Re-test to verify fix
```

**Deliverable:** Full security audit complete, all critical/high issues fixed, audit report signed off

---

### Week 4: Play Store + Go-Live (25h)

#### Task 3.6: Play Store Configuration
**Owner:** Product/Mobile Team  
**Effort:** 10 hours  

```
Day 1-2 (Mon-Tue):
  [ ] Google Play Console setup: 3h
      └─ Create app listing
      └─ Fill in all required fields (description, screenshots, privacy policy)
      └─ Set content rating (rate for age appropriateness)
      └─ Set distribution (countries, languages)
  
  [ ] APK upload + review: 4h
      └─ Upload final APK (signed, versioned)
      └─ Fill in release notes
      └─ Select rollout strategy:
         └─ Option A: Staged rollout (1% → 10% → 50% → 100% over days)
         └─ Option B: Full immediate release
      └─ Submit for review (Google reviews in 2-24 hours)
  
  [ ] Monitoring: 3h
      └─ Check review status daily
      └─ Respond to any reviewer questions
      └─ Monitor crash reports if approved
      └─ Check user ratings + reviews

PERMISSIONS REQUIRED:
✅ Google Play Console:
   - App creation + publishing
   - User management (add team members)
   - Analytics access
   - Revenue tracking (if monetized)

✅ App Signing:
   - Access to app signing certificate (keystore)
   - Private key secure storage
```

---

#### Task 3.7: Monitoring + Go-Live Support
**Owner:** DevOps + Support Team  
**Effort:** 15 hours  

```
Day 3-4 (Wed-Thu):
  [ ] Monitoring setup: 5h
      └─ CloudWatch dashboards (all metrics visible)
      └─ PagerDuty/AlertOps integration (on-call alerts)
      └─ Slack #production-incidents channel
      └─ Email alerts (CFO, CTO for critical issues)
  
  [ ] On-call schedule: 3h
      └─ CTO: Week 1 (launch week, always available)
      └─ Backend lead: Week 2-4
      └─ DevOps lead: Backup
      └─ Escalation: CTO if issue unresolved in 30 min

Day 5 (Fri) - Launch Day:
  [ ] Go-live execution: 5h
      └─ Pre-launch (2h):
         ├─ Final health check (all systems green)
         ├─ Backup taken + verified
         ├─ Rollback procedure reviewed
         ├─ Team briefing (what to watch for)
      
      └─ Launch (1h):
         ├─ Play Store release approved (Google)
         ├─ Marketing announces
         ├─ Social media posts go live
         ├─ Email to user base
      
      └─ Post-launch monitoring (2h):
         ├─ Watch error rates (should be <0.1%)
         ├─ Watch performance (latency, response time)
         ├─ Watch user signups (should see ramp-up)
         ├─ Monitor Slack for any issues
         ├─ Respond to critical bugs within 30 min

  [ ] First 24-hour support: 5h
      └─ On-call team available 24/7
      └─ Monitor dashboards
      └─ Respond to user issues
      └─ Collect feedback for Day 1 hotfix (if needed)
```

---

## 🎖️ S18 Success Criteria

```
✅ AWS infrastructure live + tested
✅ Oracle backup + DR working + tested
✅ APK builds locally, all features tested
✅ AWS ↔ Oracle failover tested (<1s switchover)
✅ Architecture security audit complete, critical issues fixed
✅ All broken links fixed
✅ Play Store listing complete + approved
✅ LGPD/HIPAA compliance verified
✅ Monitoring + alerting configured
✅ On-call team ready
✅ Launch day execution successful
✅ <0.1% error rate post-launch
✅ User feedback positive
```

---

---

## 🔑 COMPLETE PERMISSIONS CHECKLIST

### AWS Permissions Required
```
FOR: AWS Infrastructure Setup (S18)

✅ EC2 (Compute):
   - ec2:RunInstances (launch instances)
   - ec2:TerminateInstances (stop instances)
   - ec2:DescribeInstances (see all instances)
   - ec2:ModifyInstanceAttribute (change attributes)
   - ec2:CreateSecurityGroup (firewall rules)
   - ec2:AuthorizeSecurityGroupIngress/Egress

✅ RDS (Database):
   - rds:CreateDBInstance (create database)
   - rds:DeleteDBInstance (remove database)
   - rds:DescribeDBInstances (list databases)
   - rds:ModifyDBInstance (change settings)
   - rds:CreateDBSnapshot (backup)
   - rds:RestoreDBInstanceFromDBSnapshot (restore)

✅ VPC (Networking):
   - ec2:CreateVpc (create network)
   - ec2:CreateSubnet (create subnets)
   - ec2:CreateNetworkInterface
   - ec2:CreateRouteTable
   - ec2:CreateNatGateway

✅ S3 (Storage):
   - s3:CreateBucket (create storage)
   - s3:PutObject (upload files)
   - s3:GetObject (download files)
   - s3:DeleteObject (remove files)
   - s3:ListBucket (list files)
   - s3:PutBucketVersioning (enable versioning)
   - s3:PutBucketEncryption (enable encryption)

✅ CloudFront (CDN):
   - cloudfront:CreateDistribution
   - cloudfront:UpdateDistribution
   - cloudfront:GetDistribution

✅ CloudWatch (Monitoring):
   - cloudwatch:PutMetricAlarm
   - cloudwatch:DeleteAlarms
   - cloudwatch:DescribeAlarms
   - logs:CreateLogGroup
   - logs:CreateLogStream
   - logs:PutLogEvents

✅ SNS (Notifications):
   - sns:CreateTopic
   - sns:Publish
   - sns:Subscribe

✅ Route53 (DNS):
   - route53:CreateHostedZone
   - route53:ListResourceRecordSets
   - route53:ChangeResourceRecordSets

✅ IAM (Identity):
   - iam:CreateRole
   - iam:PutRolePolicy
   - iam:CreateInstanceProfile
   - iam:AddRoleToInstanceProfile

✅ Secrets Manager (Credentials):
   - secretsmanager:CreateSecret
   - secretsmanager:GetSecretValue
   - secretsmanager:UpdateSecret
   - secretsmanager:DeleteSecret

Estimated AWS Account: 
- Policy: "AdministratorAccess" OR custom policy with all above
- Or delegate to trusted team member with full permissions
```

### Oracle Permissions Required
```
FOR: Oracle Database Setup + HA (S18)

✅ Database Administration:
   - CREATE TABLESPACE
   - CREATE USER
   - GRANT privileges (SELECT, INSERT, UPDATE, DELETE, CREATE TABLE)
   - CREATE DATABASE LINK (connection from AWS)
   - DBMS_DATAPUMP (Data Pump for export/import)

✅ Backup & Recovery (RMAN):
   - RMAN BACKUP DATABASE
   - RMAN RESTORE DATABASE
   - RMAN RECOVER DATABASE

✅ Data Guard (HA/DR):
   - Data Guard Broker commands
   - Create standby database
   - Configure switchover/failover

✅ Monitoring:
   - ALTER SYSTEM (change parameters)
   - AUDIT commands (audit trail)
   - Enterprise Manager access

✅ Network:
   - SQL*Net configuration
   - VPN tunnel setup (network team)
   - Direct Connect (network team)

Estimated Account:
- Oracle DBA role with full permissions
- Or Cloud IAM with "Oracle Database Admin" role if using Oracle Cloud
```

### Supabase Permissions Required
```
FOR: Supabase Setup + Integration (All Phases)

✅ Database:
   - Full access to schema creation/modification
   - CREATE TABLE, ALTER TABLE, DROP TABLE
   - User management (CREATE USER, GRANT)
   - Connection strings (retrieve anytime)

✅ Authentication:
   - User creation + management
   - OAuth provider setup
   - Email templates
   - Session management

✅ Storage:
   - Bucket creation + management
   - Object read/write/delete
   - RLS policies on buckets

✅ Edge Functions:
   - Deploy functions
   - View logs
   - Manage environment variables
   - Edit function code

✅ API & Webhooks:
   - View API docs
   - Create webhooks
   - Manage API keys

✅ Analytics:
   - View database metrics
   - View function metrics
   - View authentication stats

Estimated Access:
- Supabase project owner/admin
- Contact project support team for issues
- Backup credentials in Teleport vault
```

### Google Play Console Permissions
```
FOR: App Publishing (S18)

✅ Store Listing:
   - Create app listing
   - Edit app description
   - Upload screenshots
   - Set content ratings

✅ APK/Bundle Management:
   - Upload APK
   - Upload App Bundle
   - Manage versions
   - Set rollout percentage

✅ Analytics:
   - View crash reports
   - View ANR (app not responding) reports
   - View user ratings + reviews

✅ Payments (if applicable):
   - Setup merchant account
   - View revenue reports

Estimated Access:
- Google Play Developer account owner
- Delegate to team member with "Owner" role
- Use app signing certificate (Google-managed recommended)
```

### Teleport Vault Permissions
```
FOR: JIT Infrastructure + Security (S16+)

✅ Secret Management:
   - Create secrets (SUPABASE_SERVICE_ROLE_KEY)
   - Update secrets (rotation)
   - Delete secrets (offboarding)
   - View audit logs of secret access

✅ User Management:
   - Create users (dba, developer roles)
   - Assign roles (RBAC)
   - Revoke access (offboarding)

✅ Database Proxy:
   - Register database
   - Configure access policies
   - View connection logs

Estimated Access:
- Teleport admin
- Or delegate to CTO/DevOps lead
```

---

## 📅 COMPLETE TIMELINE

```
WEEK 1  (May 27 - Jun 2):   S16: E2E + JIT + Crisis setup
WEEK 2  (Jun 3 - Jun 9):    S16: Core development
WEEK 3  (Jun 10 - Jun 16):  S16: Audit + testing
WEEK 4  (Jun 17 - Jun 23):  S16: Deployment + monitoring
WEEK 5  (Jun 24 - Jun 30):  S16 complete. S17: Design finalization
WEEK 6  (Jul 1 - Jul 7):    S17: Layer 1-3 implementation
WEEK 7  (Jul 8 - Jul 14):   S17: ETERNAL MAZE + aprisionamiento
WEEK 8  (Jul 15 - Jul 21):  S17: Testing + deployment
WEEK 9  (Jul 22 - Jul 28):  S17 complete. S18: AWS + Oracle setup
WEEK 10 (Jul 29 - Aug 4):   S18: APK testing + mirroring
WEEK 11 (Aug 5 - Aug 11):   S18: Architecture audit + fixes
WEEK 12 (Aug 12 - Aug 18):  S18: Play Store config + go-live prep
WEEK 13 (Aug 19 - Aug 25):  LAUNCH DAY + first week monitoring
WEEK 14 (Aug 26 - Sep 2):   Post-launch stabilization
WEEK 15 (Sep 3 - Sep 9):    Final polish + user feedback implementation

TOTAL: 15 weeks (14-18 weeks estimated for real-world delays/issues)
```

---

## 🎯 FINAL SUCCESS CRITERIA (ALL PHASES)

```
✅ S16 Fundação Complete
   - E2E encryption live
   - JIT infrastructure operational
   - Crisis plan tested + ready
   - 80% of identified risk mitigated
   - LGPD Article 9 + 10 compliance achieved

✅ S17 Perímetro Complete
   - CerberOS Layers 0-3 detecting anomalies
   - ETERNAL MAZE honeypots active
   - Aprisionamiento working (10+ rules, all tested)
   - Additional 30M in risk mitigated
   - ISO 27001 compliance achieved

✅ S18 Produção Complete
   - AWS infrastructure live + tested
   - Oracle backup + failover working
   - APK tested on physical device
   - Architecture fully audited
   - Broken links fixed
   - Play Store listing approved
   - Monitoring + alerting ready
   - On-call team trained
   - Go-live execution successful
   - <0.1% error rate
   - User satisfaction high

✅ Play Store Live
   - App available for download
   - First 100 downloads within 24 hours
   - Zero critical bugs found
   - User ratings > 4.0 stars
   - Daily active users growing
```

---

**READY FOR NEXT SESSION:** Copy entire document + use in S16 kickoff meeting

