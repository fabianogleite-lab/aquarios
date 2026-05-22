# 🌊 AquariOS v2.0000 — Complete Setup Guide

**Production-Grade Implementation**  
*Integrated Vitality Operating System*

---

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Architecture](#architecture)

---

## 🚀 Quick Start (5 minutes)

```bash
# 1. Clone repository
git clone https://github.com/your-org/aquarios.git
cd aquarios

# 2. Setup environment
make setup

# 3. Start development
make dev

# 4. Open browser
open http://localhost:3000
```

---

## 📦 Prerequisites

### Required

- **Python** 3.12+
- **Node.js** 20+ (for frontend)
- **Docker** & **Docker Compose**
- **Git** with SSH keys configured
- **Make** (for automation)

### Recommended

- **VS Code** with Python + REST Client extensions
- **Postman** for API testing
- **DBeaver** for database management

### Optional

- **iTerm2** (macOS) or **Windows Terminal** (Windows)
- **Homebrew** (macOS) for package management

---

## 🔧 Installation

### Step 1: System Dependencies (First Time Only)

**macOS:**
```bash
brew install python@3.12 node docker postgresql redis
brew services start postgresql redis
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install python3.12 python3.12-venv nodejs docker.io docker-compose
```

**Windows (PowerShell as Admin):**
```powershell
# Using Chocolatey
choco install python nodejs docker-desktop
```

### Step 2: Clone & Setup

```bash
# Clone repository
git clone https://github.com/your-org/aquarios.git
cd aquarios

# Create Python virtual environment
python3.12 -m venv venv
source venv/bin/activate  # macOS/Linux
# or
.\venv\Scripts\activate  # Windows

# Install Python dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Copy environment template
cp .env.example .env

# Install Node dependencies (frontend)
cd frontend
npm install
cd ..
```

### Step 3: Database Setup

```bash
# Start Docker containers (PostgreSQL + Redis)
docker-compose up -d

# Wait for services to be healthy
docker-compose ps

# Run migrations
make db-migrate

# Seed initial data (optional)
make db-seed
```

### Step 4: Verify Installation

```bash
# Run tests
make test

# Check code quality
make lint

# Generate documentation
make docs
```

---

## ⚙️ Configuration

### 1. Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

**Critical variables** (must be set):

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=aquarios
DB_PASSWORD=your_secure_password
DB_NAME=aquarios_dev

# APIs
OPENAI_API_KEY=sk_xxxx
STRIPE_SECRET_KEY=sk_test_xxxx
GOOGLE_CLOUD_PROJECT_ID=your_project

# Authentication
JWT_SECRET=minimum-32-characters-secret-key-here
```

### 2. Database Connection

Verify PostgreSQL is running:

```bash
# Check connection
psql -U aquarios -d aquarios_dev -c "SELECT 1"
# Output should be: 1

# View database schema
make db-schema
```

### 3. API Keys

Get these from respective services:

| Service | Where to Get | Environment Variable |
|---------|-------------|----------------------|
| OpenAI | https://platform.openai.com/api-keys | `OPENAI_API_KEY` |
| Stripe | https://dashboard.stripe.com/apikeys | `STRIPE_SECRET_KEY` |
| Google Cloud | https://console.cloud.google.com | `GOOGLE_CLOUD_PROJECT_ID` |
| Anthropic (Claude) | https://console.anthropic.com | `ANTHROPIC_API_KEY` |

---

## 👨‍💻 Development

### Start Development Server

```bash
# Terminal 1: Python API
make dev

# Terminal 2: Frontend (if working on UI)
cd frontend
npm start
```

The API runs on `http://localhost:3000`  
The frontend runs on `http://localhost:3001`

### Project Structure

```
aquarios/
├── src/
│  ├── main.py                 # Orchestration script
│  ├── modules/                # Core modules (ProteOS, HygeiOS, etc)
│  └── config/                 # Configuration
├── frontend/                  # React app
├── tests/                     # Test suite
├── docs/
│  ├── AquariOS_v2.0000_CORE.md
│  └── AquariOS_v2.0000_COMMERCIAL.md
├── docker-compose.yml         # Local services
├── Dockerfile                 # Production image
├── Makefile                   # Development tasks
├── requirements.txt           # Python dependencies
└── .github/workflows/         # CI/CD pipelines
```

### Running Tests

```bash
# All tests
make test

# Unit tests only
make test-unit

# With coverage
make test-coverage

# Watch mode (re-run on file change)
ptw tests/
```

### Code Quality

```bash
# Format code
make format

# Lint
make lint

# Type checking
make type-check

# All checks
make quality
```

---

## 🧪 Testing

### Unit Tests

```bash
pytest tests/unit/ -v
```

### Integration Tests (requires services running)

```bash
docker-compose up -d
pytest tests/integration/ -v
```

### API Testing (using REST Client VS Code extension)

Create `test.http`:
```http
@baseUrl = http://localhost:3000/v1

### Get health
GET {{baseUrl}}/health

### Create user
POST {{baseUrl}}/auth/signup
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "SecurePassword123!",
  "name": "Test User"
}
```

Right-click → "Send Request"

---

## 🚢 Deployment

### Deploy to Staging

```bash
# Push to staging branch (triggers CI/CD)
git checkout -b feature/my-feature
git push origin feature/my-feature

# Create Pull Request
# After merge to staging, automatic deployment happens

# Verify deployment
curl https://staging-api.aquarios.app/health
```

### Deploy to Production

```bash
# Ensure all tests pass locally
make pre-commit

# Create release
git tag -a v2.0.1 -m "Release v2.0.1"
git push origin main --tags

# GitHub Actions automatically:
# 1. Builds Docker image
# 2. Runs security scans
# 3. Deploys to production
# 4. Notifies Slack

# Verify deployment
curl https://api.aquarios.app/health
```

### Manual Deployment (if needed)

```bash
# Build image
make build

# Push to registry
docker push ghcr.io/your-org/aquarios:latest

# Deploy to DigitalOcean
doctl apps update $APP_ID --spec .do/app-production.yaml
```

---

## 🐛 Troubleshooting

### PostgreSQL Connection Failed

```bash
# Check if container is running
docker ps | grep postgres

# If not, start services
docker-compose up -d

# Check logs
docker-compose logs postgres

# Reset connection
docker-compose down && docker-compose up -d
```

### Redis Connection Timeout

```bash
# Verify Redis is running
redis-cli ping
# Should output: PONG

# If not:
docker-compose restart redis
```

### Tests Failing

```bash
# Reset test database
make db-reset

# Run tests with verbose output
pytest tests/ -vv -s

# Check for environment variable issues
env | grep -i db
env | grep -i redis
```

### API Request Fails

```bash
# Check if API is running
curl http://localhost:3000/health

# View logs
tail -f aquarios-orchestrator.log

# Check environment variables
grep -E "^(STRIPE|OPENAI|DATABASE)" .env
```

---

## 🏗️ Architecture

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 + TypeScript | Web UI |
| **API** | Express.js + Node.js 20 | REST API |
| **Database** | PostgreSQL 16 | Persistent storage |
| **Cache** | Redis 7 | Sessions + hot data |
| **Container** | Docker | Reproducible environments |
| **CI/CD** | GitHub Actions | Automated testing & deploy |
| **Monitoring** | Datadog + Sentry | Observability |

### Module Structure

```
ProteOS (AI Analysis)
├─ Voice Processing (OpenAI Whisper)
├─ Sentiment Analysis (Transformers)
├─ Context Understanding (Claude API)
└─ Personalization (ML models)

HygeiOS (Community & Behavior)
├─ User Profiles
├─ Community Feed
├─ Personas Reactions
└─ Cohort Analysis

CerberOS (Security)
├─ Authentication (JWT + OAuth2)
├─ Encryption (AES-256)
├─ Rate Limiting
└─ Audit Logs

EteriOS (Integrations)
├─ Payment Gateways (Stripe, Pix, etc)
├─ Wearables (Apple Health, Fitbit)
├─ Notifications (Email, SMS, Push)
└─ Third-party APIs
```

---

## 📚 Additional Resources

- **API Documentation**: `http://localhost:3000/docs`
- **Database Schema**: `docs/schema.md`
- **Deployment Guide**: `.do/README.md`
- **Contributing**: `CONTRIBUTING.md`
- **License**: `LICENSE`

---

## 🤝 Support

- **Issues**: https://github.com/your-org/aquarios/issues
- **Discussions**: https://github.com/your-org/aquarios/discussions
- **Email**: team@aquarios.app
- **Slack**: `#engineering` channel

---

## ✅ Checklist: Ready for Development?

- [ ] Python 3.12+ installed
- [ ] Node.js 20+ installed
- [ ] Docker running
- [ ] `.env` file created with API keys
- [ ] `make setup` completed without errors
- [ ] `make test` all passing
- [ ] Can access `http://localhost:3000/health`
- [ ] Can access `http://localhost:3000/docs` (API docs)

**If all checked:** You're ready to develop! 🚀

---

**Last Updated**: 20 Maio 2026  
**Version**: v2.0000.1  
**Maintainers**: Fabiano + Dev Team

🌊 Let's build vitalidade integrada!
