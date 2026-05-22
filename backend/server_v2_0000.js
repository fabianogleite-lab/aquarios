// ⚗ AquariOS Backend v2.0000
// Sistema Operacional de Integração Humana
// Fabiano Gomes Leite — fabianogleite@hotmail.com

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import pkg from 'pg';
import redis from 'redis';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const { Pool } = pkg;
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ═══════════════════════════════════════════════════════════════════════
// MIDDLEWARE
// ═══════════════════════════════════════════════════════════════════════

app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use(cors({
  origin: (process.env.CORS_ORIGIN || 'http://localhost:8081').split(','),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: 'Too many requests'
});

app.use('/api/', limiter);

// ═══════════════════════════════════════════════════════════════════════
// DATABASE & CACHE
// ═══════════════════════════════════════════════════════════════════════

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: parseInt(process.env.DATABASE_POOL_MAX || '20'),
  min: parseInt(process.env.DATABASE_POOL_MIN || '5'),
});

const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});
redisClient.on('error', err => console.error('Redis error:', err));
redisClient.connect();

// ═══════════════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════════════

const encryptionKey = Buffer.from(process.env.ENCRYPTION_KEY.padEnd(32, '\0').slice(0, 32));

function encrypt(text) {
  if (!text) return null;
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', encryptionKey, iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
  if (!text) return null;
  const parts = text.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', encryptionKey, iv);
  let decrypted = decipher.update(Buffer.from(parts[1], 'hex'));
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

function hashEmail(email) {
  return crypto.createHash('sha256').update(email.toLowerCase()).digest('hex');
}

function hashCpf(cpf) {
  return crypto.createHash('sha256').update(cpf.replace(/\D/g, '')).digest('hex');
}

async function logAudit(userId, actionType, actionDescription, entityType = null, entityId = null, req = null) {
  const ipHash = req ? crypto.createHash('sha256').update(req.ip || '').digest('hex') : null;
  const userAgentHash = req ? crypto.createHash('sha256').update(req.get('user-agent') || '').digest('hex') : null;
  
  await pool.query(
    `INSERT INTO audit_log (action_type, action_description, user_id, ip_address_hash, user_agent_hash, entity_type, entity_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [actionType, actionDescription, userId, ipHash, userAgentHash, entityType, entityId]
  );
}

// ═══════════════════════════════════════════════════════════════════════
// AUTHENTICATION
// ═══════════════════════════════════════════════════════════════════════

function generateTokens(userId) {
  const accessToken = jwt.sign(
    { userId, type: 'access' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRY || '15m' }
  );
  
  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d' }
  );
  
  return { accessToken, refreshToken };
}

async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

// ═══════════════════════════════════════════════════════════════════════
// ROUTES: HEALTH & SYSTEM
// ═══════════════════════════════════════════════════════════════════════

app.get('/api/v2/health', async (req, res) => {
  try {
    const dbTest = await pool.query('SELECT NOW()');
    const redisTest = await redisClient.ping();
    
    res.json({
      status: 'OPERATIONAL',
      version: 'v2.0000',
      database: 'OK',
      cache: redisTest === 'PONG' ? 'OK' : 'ERROR',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Health check failed' });
  }
});

app.get('/api/v2/version', (req, res) => {
  res.json({
    version: 'v2.0000',
    name: 'AquariOS',
    author: 'Fabiano Gomes Leite',
    modules: {
      proteos: '✓ OPERATIONAL',
      hygeios: '✓ OPERATIONAL',
      asclepios: '✓ OPERATIONAL',
      sandeiros: '✓ MODE_OCULTO',
      ecumenicos: '✓ OPERATIONAL',
      eterios: '✓ OPERATIONAL',
      marketplace: '✓ READY',
      beck_office: '◐ BETA'
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════
// ROUTES: AUTHENTICATION
// ═══════════════════════════════════════════════════════════════════════

app.post('/api/v2/auth/register', async (req, res) => {
  try {
    const { email, cpf, password, fullName } = req.body;
    
    if (!email || !cpf || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const emailHash = hashEmail(email);
    const cpfHash = hashCpf(cpf);
    const passwordHash = await bcryptjs.hash(password, 10);
    
    const userId = uuidv4();
    
    await pool.query(
      `INSERT INTO users (id, email_hash, cpf_hash, password_hash, full_name, gdpr_consent_accepted, gdpr_consent_date)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [userId, emailHash, cpfHash, passwordHash, fullName || null, true]
    );
    
    const { accessToken, refreshToken } = generateTokens(userId);
    
    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    
    await pool.query(
      `INSERT INTO sessions (user_id, refresh_token_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [userId, refreshTokenHash, expiresAt]
    );
    
    await logAudit(userId, 'USER_REGISTERED', 'New user registration', 'users', userId, req);
    
    res.status(201).json({
      success: true,
      userId,
      accessToken,
      refreshToken,
      message: 'User registered successfully'
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/v2/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    const emailHash = hashEmail(email);
    
    const result = await pool.query(
      'SELECT id, password_hash FROM users WHERE email_hash = $1 AND deleted_at IS NULL',
      [emailHash]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = result.rows[0];
    const validPassword = await bcryptjs.compare(password, user.password_hash);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    await pool.query(
      'UPDATE users SET last_login_at = NOW() WHERE id = $1',
      [user.id]
    );
    
    const { accessToken, refreshToken } = generateTokens(user.id);
    
    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    
    await pool.query(
      `INSERT INTO sessions (user_id, refresh_token_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [user.id, refreshTokenHash, expiresAt]
    );
    
    await logAudit(user.id, 'USER_LOGIN', 'User login successful', null, null, req);
    
    res.json({
      success: true,
      userId: user.id,
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/v2/auth/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' });
    }
    
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    
    const sessionResult = await pool.query(
      'SELECT * FROM sessions WHERE user_id = $1 AND refresh_token_hash = $2 AND is_active = TRUE AND expires_at > NOW()',
      [decoded.userId, refreshTokenHash]
    );
    
    if (sessionResult.rows.length === 0) {
      return res.status(403).json({ error: 'Invalid refresh token' });
    }
    
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(decoded.userId);
    
    res.json({
      success: true,
      accessToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    res.status(403).json({ error: 'Invalid refresh token' });
  }
});

// ═══════════════════════════════════════════════════════════════════════
// ROUTES: USER PROFILE
// ═══════════════════════════════════════════════════════════════════════

app.get('/api/v2/user/profile', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, full_name, persona_code, plan_id, created_at FROM users WHERE id = $1',
      [req.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

app.put('/api/v2/user/profile', authenticateToken, async (req, res) => {
  try {
    const { fullName, personaCode } = req.body;
    
    await pool.query(
      'UPDATE users SET full_name = COALESCE($1, full_name), persona_code = COALESCE($2, persona_code) WHERE id = $3',
      [fullName || null, personaCode || null, req.userId]
    );
    
    await logAudit(req.userId, 'USER_PROFILE_UPDATED', 'User updated profile', 'users', req.userId, req);
    
    res.json({ success: true, message: 'Profile updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// ═══════════════════════════════════════════════════════════════════════
// ROUTES: IVI (Health Index)
// ═══════════════════════════════════════════════════════════════════════

app.get('/api/v2/ivi/latest', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ivi_total, ivi_bio, ivi_mental, ivi_spirit, status, created_at
       FROM ivi_snapshots WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [req.userId]
    );
    
    if (result.rows.length === 0) {
      return res.json({ message: 'No IVI data yet', ivi: null });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch IVI' });
  }
});

app.get('/api/v2/ivi/history', authenticateToken, async (req, res) => {
  try {
    const days = req.query.days || 30;
    
    const result = await pool.query(
      `SELECT ivi_total, ivi_bio, ivi_mental, ivi_spirit, status, created_at
       FROM ivi_snapshots 
       WHERE user_id = $1 AND created_at > NOW() - INTERVAL '${parseInt(days)} days'
       ORDER BY created_at ASC`,
      [req.userId]
    );
    
    res.json({ count: result.rows.length, data: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch IVI history' });
  }
});

// ═══════════════════════════════════════════════════════════════════════
// ROUTES: JOURNAL (Diário do Ser)
// ═══════════════════════════════════════════════════════════════════════

app.post('/api/v2/journal', authenticateToken, async (req, res) => {
  try {
    const { date, time, content, mood, moodIntensity, tags } = req.body;
    
    const entryId = uuidv4();
    
    await pool.query(
      `INSERT INTO journal_entries (id, user_id, entry_date, entry_time, content_text, mood_tag, mood_intensity, tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [entryId, req.userId, date || new Date(), time || null, content || null, mood || null, moodIntensity || null, tags || []]
    );
    
    await logAudit(req.userId, 'JOURNAL_ENTRY_CREATED', 'Journal entry created', 'journal_entries', entryId, req);
    
    res.status(201).json({ success: true, entryId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create journal entry' });
  }
});

app.get('/api/v2/journal', authenticateToken, async (req, res) => {
  try {
    const days = req.query.days || 30;
    
    const result = await pool.query(
      `SELECT id, entry_date, entry_time, content_text, mood_tag, mood_intensity, tags, created_at
       FROM journal_entries 
       WHERE user_id = $1 AND deleted_at IS NULL AND entry_date > NOW()::date - INTERVAL '${parseInt(days)} days'
       ORDER BY entry_date DESC, entry_time DESC`,
      [req.userId]
    );
    
    res.json({ count: result.rows.length, data: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch journal entries' });
  }
});

// ═══════════════════════════════════════════════════════════════════════
// ROUTES: MEALS & NUTRITION
// ═══════════════════════════════════════════════════════════════════════

app.post('/api/v2/meals', authenticateToken, async (req, res) => {
  try {
    const { mealDate, mealTime, mealType, calories, protein, carbs, fat, fiber, description } = req.body;
    
    const mealId = uuidv4();
    
    await pool.query(
      `INSERT INTO meals (id, user_id, meal_date, meal_time, meal_type, calories, protein_g, carbs_g, fat_g, fiber_g, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [mealId, req.userId, mealDate || new Date(), mealTime || null, mealType || null, 
       calories || null, protein || null, carbs || null, fat || null, fiber || null, description || null]
    );
    
    await logAudit(req.userId, 'MEAL_LOGGED', 'Meal logged', 'meals', mealId, req);
    
    res.status(201).json({ success: true, mealId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to log meal' });
  }
});

app.get('/api/v2/meals', authenticateToken, async (req, res) => {
  try {
    const days = req.query.days || 7;
    
    const result = await pool.query(
      `SELECT id, meal_date, meal_time, meal_type, calories, protein_g, carbs_g, fat_g, fiber_g, description
       FROM meals 
       WHERE user_id = $1 AND deleted_at IS NULL AND meal_date > NOW()::date - INTERVAL '${parseInt(days)} days'
       ORDER BY meal_date DESC, meal_time DESC`,
      [req.userId]
    );
    
    res.json({ count: result.rows.length, data: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch meals' });
  }
});

// ═══════════════════════════════════════════════════════════════════════
// ROUTES: PROTEOS (Conversational Hub)
// ═══════════════════════════════════════════════════════════════════════

app.post('/api/v2/proteos/chat', authenticateToken, async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message required' });
    }
    
    // Detect viesis (5 Gurdjieff components)
    const vieses = {
      'ESTRADA': ['mercado', 'mundo', 'crise', 'pessoas', 'economia'],
      'CARRUAGEM': ['saúde', 'corpo', 'cansado', 'sono', 'físico', 'energia'],
      'CAVALO': ['sentindo', 'medo', 'raiva', 'impulso', 'emoção', 'ânimo'],
      'COCHEIRO': ['estudo', 'teoria', 'dúvida', 'pensando', 'plano', 'análise'],
      'PASSAGEIRO': [] // fallback
    };
    
    let detectedVieses = 'PASSAGEIRO';
    for (const [vies, keywords] of Object.entries(vieses)) {
      if (keywords.some(k => message.toLowerCase().includes(k))) {
        detectedVieses = vies;
        break;
      }
    }
    
    // Mock response (real implementation would call Anthropic API)
    const mockResponses = {
      'ESTRADA': 'A volatilidade de mercado é temporal. Foque em variáveis que você controla.',
      'CARRUAGEM': 'Seu corpo indica necessidade de descanso. Considere pausar atividades intensas.',
      'CAVALO': 'Antes de agir, aguarde 2h. A emoção vai passar.',
      'COCHEIRO': 'Pare de analisar. Execute um passo mínimo hoje.',
      'PASSAGEIRO': 'Qual é seu propósito real nisto? Repensar a intenção.'
    };
    
    const response = mockResponses[detectedVieses] || 'Entendi. Como posso ajudar?';
    
    const conversationId = uuidv4();
    const startTime = Date.now();
    
    await pool.query(
      `INSERT INTO proteos_conversations (id, user_id, viesis_detected, user_message, proteos_response, response_time_ms)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [conversationId, req.userId, detectedVieses, message, response, Date.now() - startTime]
    );
    
    res.json({
      success: true,
      conversationId,
      viesesDetected: detectedVieses,
      response
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process message' });
  }
});

// ═══════════════════════════════════════════════════════════════════════
// ROUTES: ASCLEPIOS (Clinical Module)
// ═══════════════════════════════════════════════════════════════════════

app.post('/api/v2/asclepios/health-check', authenticateToken, async (req, res) => {
  try {
    // Simplified risk score calculation
    let riskScore = 0;
    
    // Get latest IVI
    const iviResult = await pool.query(
      'SELECT ivi_bio, ivi_mental, ivi_spirit FROM ivi_snapshots WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
      [req.userId]
    );
    
    if (iviResult.rows.length > 0) {
      const ivi = iviResult.rows[0];
      if (ivi.ivi_bio < 30) riskScore += 30;
      if (ivi.ivi_mental < 40) riskScore += 20;
      if (ivi.ivi_spirit < 25) riskScore += 15;
    }
    
    let actionType = 'PREVENTIVE';
    let actionDescription = 'Continuar monitoramento';
    
    if (riskScore > 80) {
      actionType = 'MEDICAL_INTERVENTION';
      actionDescription = 'Alertar Beck Office para avaliação imediata';
    } else if (riskScore > 60) {
      actionType = 'BEHAVIOR_ADJUSTMENT';
      actionDescription = 'Sugerir mudanças comportamentais';
    }
    
    const riskId = uuidv4();
    
    await pool.query(
      `INSERT INTO asclepios_risk_scores (id, user_id, risk_score, risk_status, action_type, action_description)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [riskId, req.userId, Math.min(riskScore, 100), 
       riskScore > 80 ? 'CRITICAL' : riskScore > 60 ? 'ALERT' : 'STABLE',
       actionType, actionDescription]
    );
    
    res.json({
      success: true,
      riskId,
      riskScore: Math.min(riskScore, 100),
      actionType,
      actionDescription
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to run health check' });
  }
});

// ═══════════════════════════════════════════════════════════════════════
// ROUTES: COMMUNITIES
// ═══════════════════════════════════════════════════════════════════════

app.get('/api/v2/communities', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, slug, description, category, members_count FROM communities WHERE is_active = TRUE AND deleted_at IS NULL ORDER BY created_at DESC'
    );
    
    res.json({ count: result.rows.length, data: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch communities' });
  }
});

app.post('/api/v2/communities/:communityId/posts', authenticateToken, async (req, res) => {
  try {
    const { content, tags } = req.body;
    const { communityId } = req.params;
    
    const postId = uuidv4();
    
    await pool.query(
      `INSERT INTO community_posts (id, user_id, community_id, content, tags, is_visible)
       VALUES ($1, $2, $3, $4, $5, TRUE)`,
      [postId, req.userId, communityId, content || null, tags || []]
    );
    
    // Award XP Existencial
    await pool.query(
      `UPDATE community_posts SET xp_existential_awarded = 10 WHERE id = $1`,
      [postId]
    );
    
    res.status(201).json({ success: true, postId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// ═══════════════════════════════════════════════════════════════════════
// ROUTES: ETERIOS (IoT Integration)
// ═══════════════════════════════════════════════════════════════════════

app.post('/api/v2/eterios/webhook', async (req, res) => {
  try {
    const { deviceId, userId, metricType, metricValue, metricUnit, timestamp } = req.body;
    
    const dataId = uuidv4();
    
    await pool.query(
      `INSERT INTO eterios_inbound_data (id, user_id, device_id, metric_type, metric_value, metric_unit, recorded_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [dataId, userId, deviceId || null, metricType, metricValue, metricUnit, timestamp || new Date()]
    );
    
    res.json({ success: true, dataId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process webhook' });
  }
});

app.get('/api/v2/eterios/devices', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, device_type, device_name, device_model, protocol, is_active, last_sync_at FROM eterios_devices WHERE user_id = $1 AND deleted_at IS NULL',
      [req.userId]
    );
    
    res.json({ count: result.rows.length, data: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch devices' });
  }
});

// ═══════════════════════════════════════════════════════════════════════
// ROUTES: FAQs & Help
// ═══════════════════════════════════════════════════════════════════════

app.get('/api/v2/faqs', async (req, res) => {
  try {
    const { personaCode, category, search } = req.query;
    
    let query = 'SELECT * FROM faqs WHERE 1=1';
    const params = [];
    
    if (personaCode) {
      query += ' AND persona_code = $' + (params.length + 1);
      params.push(personaCode);
    }
    
    if (category) {
      query += ' AND category = $' + (params.length + 1);
      params.push(category);
    }
    
    if (search) {
      query += ' AND (question ILIKE $' + (params.length + 1) + ' OR answer_text ILIKE $' + (params.length + 1) + ')';
      params.push(`%${search}%`);
    }
    
    query += ' ORDER BY search_boost DESC, created_at DESC';
    
    const result = await pool.query(query, params);
    
    res.json({ count: result.rows.length, data: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch FAQs' });
  }
});

// ═══════════════════════════════════════════════════════════════════════
// ROUTES: LGPD COMPLIANCE
// ═══════════════════════════════════════════════════════════════════════

app.post('/api/v2/lgpd/export-data', authenticateToken, async (req, res) => {
  try {
    // Get all non-sensitive user data
    const result = await pool.query(
      `SELECT id, full_name, created_at, plan_id, persona_code 
       FROM users WHERE id = $1`,
      [req.userId]
    );
    
    const user = result.rows[0];
    const dataExport = {
      user: user,
      exportDate: new Date().toISOString(),
      exportId: uuidv4()
    };
    
    res.json({
      success: true,
      data: dataExport,
      message: 'Data export prepared. Download PDF for full details.'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to export data' });
  }
});

app.post('/api/v2/lgpd/request-deletion', authenticateToken, async (req, res) => {
  try {
    await pool.query(
      'UPDATE users SET deletion_requested = TRUE, deletion_at = NOW() WHERE id = $1',
      [req.userId]
    );
    
    await logAudit(req.userId, 'DELETION_REQUESTED', 'User requested account deletion', 'users', req.userId, req);
    
    res.json({
      success: true,
      message: 'Deletion request received. Your data will be permanently deleted in 30 days.'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to request deletion' });
  }
});

// ═══════════════════════════════════════════════════════════════════════
// ROUTES: ADMIN CONSOLE (Restricted)
// ═══════════════════════════════════════════════════════════════════════

app.post('/api/v2/admin/login', async (req, res) => {
  try {
    const { adminKey, sessionToken } = req.body;
    
    if (adminKey !== process.env.ADMIN_SECRET) {
      await logAudit(null, 'ADMIN_LOGIN_FAILED', 'Invalid admin key attempt', null, null, req);
      return res.status(403).json({ error: 'Invalid credentials' });
    }
    
    const adminToken = jwt.sign(
      { userId: process.env.ADMIN_USER_ID, role: 'admin', type: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    res.json({
      success: true,
      adminToken,
      role: 'admin',
      userId: process.env.ADMIN_USER_ID
    });
  } catch (error) {
    res.status(500).json({ error: 'Admin login failed' });
  }
});

app.get('/api/v2/admin/dashboard-metrics', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.role !== 'admin') throw new Error();
    } catch {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const usersResult = await pool.query('SELECT COUNT(*) FROM users WHERE deleted_at IS NULL');
    const iviResult = await pool.query('SELECT COUNT(DISTINCT user_id) FROM ivi_snapshots');
    const journalResult = await pool.query('SELECT COUNT(*) FROM journal_entries WHERE deleted_at IS NULL');
    const communityResult = await pool.query('SELECT COUNT(DISTINCT id) FROM communities WHERE deleted_at IS NULL');
    
    res.json({
      version: 'v2.0000',
      totalUsers: parseInt(usersResult.rows[0].count),
      activeIviUsers: parseInt(iviResult.rows[0].count),
      journalEntries: parseInt(journalResult.rows[0].count),
      totalCommunities: parseInt(communityResult.rows[0].count),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

// ═══════════════════════════════════════════════════════════════════════
// ERROR HANDLING
// ═══════════════════════════════════════════════════════════════════════

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});

// ═══════════════════════════════════════════════════════════════════════
// SERVER STARTUP
// ═══════════════════════════════════════════════════════════════════════

app.listen(PORT, () => {
  console.log(`⚗ AquariOS Backend v2.0000 running on port ${PORT}`);
  console.log(`Author: Fabiano Gomes Leite`);
  console.log(`Database: ${process.env.DATABASE_URL?.split('@')[1] || 'configuring...'}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
