# H3 — Deploy Convergência (SandeirOS F1/F2 + HygeiOS H1/H2)

## Onde colocar no `main.py` da VM Oracle

```python
# main.py (existente)
from fastapi import FastAPI
app = FastAPI()

# ========== NOVO: Wire routers ==========

# F1/F2 SandeirOS (cache + humanização)
from sandeiros.api import router as sandeiros_router
app.include_router(sandeiros_router)

# H1/H2 HygeiOS (insights + tools)
from hygeios.api import router as hygeios_router
app.include_router(hygeios_router)

# Admin settings
from admin_settings import router as admin_router
app.include_router(admin_router)

# ========== Variáveis de ambiente necessárias ==========
# No arquivo `/etc/hygeios-v2-sprint2.env` da VM, adicione:

SUPABASE_URL=https://agebsmjsjrmazbozphnh.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<seu_service_key_aqui>

# (Se usar humanização F2)
# HL1_INTERVALO_PATH=/opt/sandeiros/data/hl1_intervalo_300.json
# HL2_TRIADE_PATH=/opt/sandeiros/data/hl2_triade_80.json
# HL3_EQUILIBRIO_PATH=/opt/sandeiros/data/hl3_equilibrio_70.json
# HL4_REFRAME_PATH=/opt/sandeiros/data/hl4_reframe_22.json

# ========== Scheduler (background 6h) ==========
# Recomendação: usar APScheduler ou Celery
# Simples: crontab -e na VM (chamar /hygeios/h1/run a cada 6h)
# 0 */6 * * * curl -X POST http://localhost:8000/hygeios/h1/run

# ========== Deploy ==========
# 1. scp -r backend/ opc@137.131.158.242:/opt/aquarios/
# 2. systemctl restart hygeios-v2
# 3. Verificar: curl http://localhost:8000/sandeiros/health
#    Esperado: { "ok": true, "cache_credenciado": true }
```

**Pronto para Item 3 após confirmar que está online.**
