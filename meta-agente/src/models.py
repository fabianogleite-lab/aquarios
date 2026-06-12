from typing import TypedDict, List
from pydantic import BaseModel

class Metricas(TypedDict):
    tempo_ms: float
    tokens_in: int
    tokens_out: int
    custo_usd: float
    tokens_poupados: int
    origem: str

class EstadoSessao(TypedDict):
    pergunta: str
    categoria: str
    valor_usd: float
    resposta_final: str
    erros: List[str]
    encontrado_cache: bool
    saldo_tkn: float
    autorizado: bool
    tentativas_fallback: int
    metricas: Metricas

class InstrucaoSubagente(BaseModel):
    valor_usd: float

class AskRequest(BaseModel):
    pergunta: str
    categoria: str = "geral"
    user_id: str = "test_user"
    autorizado: bool = True

class AskResponse(BaseModel):
    resposta: str
    origem: str
    custo_tkn: float
    saldo_restante: float
