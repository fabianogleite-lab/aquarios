.PHONY: help install dev test lint format build deploy clean

# Colors for output
BOLD := \033[1m
GREEN := \033[32m
YELLOW := \033[33m
NC := \033[0m  # No Color

help:
	@echo "$(BOLD)AquariOS v2.0000 — Development Commands$(NC)"
	@echo ""
	@echo "$(GREEN)Setup:$(NC)"
	@echo "  make install       Install dependencies"
	@echo "  make setup         Setup local environment (install + migrate)"
	@echo "  make env           Copy .env.example to .env"
	@echo ""
	@echo "$(GREEN)Development:$(NC)"
	@echo "  make dev           Run development server"
	@echo "  make dev-watch     Run with auto-reload (nodemon-style)"
	@echo ""
	@echo "$(GREEN)Database:$(NC)"
	@echo "  make db-up         Start PostgreSQL + Redis (Docker)"
	@echo "  make db-down       Stop containers"
	@echo "  make db-migrate    Run database migrations"
	@echo "  make db-reset      Reset database (dev only)"
	@echo "  make db-seed       Seed initial data"
	@echo ""
	@echo "$(GREEN)Testing & Quality:$(NC)"
	@echo "  make test          Run all tests"
	@echo "  make test-unit     Run unit tests only"
	@echo "  make test-integration  Run integration tests"
	@echo "  make test-coverage  Run with coverage report"
	@echo "  make lint          Run code linters"
	@echo "  make format        Auto-format code"
	@echo "  make type-check    Run type checking (mypy)"
	@echo "  make security      Security scan (bandit)"
	@echo ""
	@echo "$(GREEN)Building & Deployment:$(NC)"
	@echo "  make build         Build Docker image"
	@echo "  make deploy-staging  Deploy to staging"
	@echo "  make deploy-prod   Deploy to production"
	@echo ""
	@echo "$(GREEN)Documentation:$(NC)"
	@echo "  make docs          Generate API documentation"
	@echo "  make orchestrate   Run master orchestration script"
	@echo ""
	@echo "$(GREEN)Cleanup:$(NC)"
	@echo "  make clean         Remove generated files & cache"
	@echo "  make clean-docker  Remove containers and volumes"
	@echo ""

# ============================================================================
# SETUP & INSTALL
# ============================================================================

install:
	@echo "$(BOLD)Installing dependencies...$(NC)"
	pip install --upgrade pip
	pip install -r requirements.txt

setup: install env db-up db-migrate db-seed
	@echo "$(BOLD)✅ Setup complete!$(NC)"
	@echo "Run 'make dev' to start development server"

env:
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "$(GREEN)✅ Created .env$(NC)"; \
	else \
		echo "$(YELLOW)⚠️  .env already exists$(NC)"; \
	fi

# ============================================================================
# DEVELOPMENT
# ============================================================================

dev:
	@echo "$(BOLD)Starting development server...$(NC)"
	python -m src.main

dev-watch:
	@echo "$(BOLD)Starting with auto-reload...$(NC)"
	pip install watchdog
	watchmedo auto-restart -d . -p '*.py' -- python -m src.main

# ============================================================================
# DATABASE
# ============================================================================

db-up:
	@echo "$(BOLD)Starting Docker containers...$(NC)"
	docker-compose up -d

db-down:
	@echo "$(BOLD)Stopping containers...$(NC)"
	docker-compose down

db-logs:
	docker-compose logs -f

db-migrate:
	@echo "$(BOLD)Running migrations...$(NC)"
	alembic upgrade head

db-reset:
	@echo "$(BOLD)⚠️  Resetting database (dev only)...$(NC)"
	docker-compose down -v
	docker-compose up -d
	sleep 5
	alembic upgrade head
	make db-seed

db-seed:
	@echo "$(BOLD)Seeding database...$(NC)"
	python scripts/seed_database.py

# ============================================================================
# TESTING & QUALITY
# ============================================================================

test:
	@echo "$(BOLD)Running all tests...$(NC)"
	pytest tests/ -v

test-unit:
	@echo "$(BOLD)Running unit tests...$(NC)"
	pytest tests/unit/ -v

test-integration:
	@echo "$(BOLD)Running integration tests...$(NC)"
	pytest tests/integration/ -v

test-coverage:
	@echo "$(BOLD)Running tests with coverage...$(NC)"
	pytest tests/ --cov=src --cov-report=html --cov-report=term-missing
	@echo "$(GREEN)✅ Coverage report: htmlcov/index.html$(NC)"

lint:
	@echo "$(BOLD)Linting code...$(NC)"
	flake8 src tests --max-line-length=100
	pylint src tests

format:
	@echo "$(BOLD)Formatting code...$(NC)"
	black src tests
	isort src tests

type-check:
	@echo "$(BOLD)Type checking...$(NC)"
	mypy src --ignore-missing-imports

security:
	@echo "$(BOLD)Running security scan...$(NC)"
	pip install bandit
	bandit -r src

quality: format type-check lint security
	@echo "$(GREEN)✅ All quality checks passed!$(NC)"

# ============================================================================
# BUILDING & DEPLOYMENT
# ============================================================================

build:
	@echo "$(BOLD)Building Docker image...$(NC)"
	docker build -t aquarios:latest -t aquarios:v2.0000 .

build-push:
	@echo "$(BOLD)Building and pushing to registry...$(NC)"
	docker build -t ghcr.io/your-org/aquarios:latest .
	docker push ghcr.io/your-org/aquarios:latest

deploy-staging:
	@echo "$(BOLD)Deploying to staging...$(NC)"
	git push origin staging
	@echo "$(GREEN)✅ GitHub Actions will deploy to staging$(NC)"

deploy-prod:
	@echo "$(BOLD)⚠️  Deploying to PRODUCTION...$(NC)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		git tag -a v$$(date +%Y%m%d.%H%M%S) -m "Production release"; \
		git push origin main --tags; \
		echo "$(GREEN)✅ Deployment initiated$(NC)"; \
	else \
		echo "$(YELLOW)Deployment cancelled$(NC)"; \
	fi

# ============================================================================
# DOCUMENTATION & SCRIPTS
# ============================================================================

docs:
	@echo "$(BOLD)Generating documentation...$(NC)"
	sphinx-build -b html docs docs/_build

orchestrate:
	@echo "$(BOLD)Running master orchestration...$(NC)"
	python src/main.py --action generate --scope all

orchestrate-validate:
	@echo "$(BOLD)Validating generated files...$(NC)"
	python src/main.py --action validate

orchestrate-export:
	@echo "$(BOLD)Exporting to JSON...$(NC)"
	python src/main.py --action export --scope all --format json

# ============================================================================
# CLEANUP
# ============================================================================

clean:
	@echo "$(BOLD)Cleaning up...$(NC)"
	find . -type d -name __pycache__ -exec rm -rf {} +
	find . -type d -name .pytest_cache -exec rm -rf {} +
	find . -type d -name .mypy_cache -exec rm -rf {} +
	find . -type f -name *.pyc -delete
	rm -rf dist/ build/ *.egg-info
	rm -rf htmlcov/
	@echo "$(GREEN)✅ Cleanup complete$(NC)"

clean-docker:
	@echo "$(BOLD)Removing Docker resources...$(NC)"
	docker-compose down -v
	docker image rm aquarios:latest aquarios:v2.0000 2>/dev/null || true
	@echo "$(GREEN)✅ Docker cleanup complete$(NC)"

clean-all: clean clean-docker
	@echo "$(GREEN)✅ Full cleanup complete$(NC)"

# ============================================================================
# CI/CD CHECKS (Run locally before push)
# ============================================================================

pre-commit: quality test
	@echo "$(GREEN)✅ All pre-commit checks passed!$(NC)"

ci: pre-commit build
	@echo "$(GREEN)✅ CI pipeline ready for push$(NC)"
