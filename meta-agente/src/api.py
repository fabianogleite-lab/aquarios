from fastapi import FastAPI
from fastapi.responses import Response
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST
from models import AskRequest, AskResponse
from telemetry import CACHE_HITS, CUSTO_TKN

def create_app(workflow, ledger):
    app = FastAPI(title="aquariOS Meta Agente")
    @app.post("/ask", response_model=AskResponse)
    def ask(req: AskRequest):
        state = {"pergunta": req.pergunta, "categoria": req.categoria, "valor_usd": 0, "resposta_final": "", "erros": [], "encontrado_cache": False, "saldo_tkn": 0, "autorizado": req.autorizado, "tentativas_fallback": 0, "metricas": {}, "user_id": req.user_id}
        result = workflow.invoke(state)
        if result["metricas"].get("origem") == "cache": CACHE_HITS.inc()
        CUSTO_TKN.inc(result.get("valor_usd",0))
        return AskResponse(resposta=result["resposta_final"], origem=result["metricas"].get("origem",""), custo_tkn=result.get("valor_usd",0), saldo_restante=ledger.get_balance(req.user_id))
    @app.get("/metrics")
    def metrics(): return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)
    @app.get("/health")
    def health(): return {"status":"ok"}
    return app
