import os

TABELA_PRECOS = {
    "cerebro_input": 0.000003,
    "cerebro_output": 0.000015,
    "subagente_input": 0.00000025,
    "subagente_output": 0.00000125,
}

TKN_USD_RATE = 1.0
TKN_LIMITE_HAIKU = 1.0
TKN_LIMITE_SONNET = 10.0

QDRANT_PATH = os.getenv("QDRANT_PATH", "data_lake.db")
COLLECTION_NAME = "meta_cache"
EMBEDDING_MODEL = "all-MiniLM-L6-v2"
DIM = 384
SIMILARITY_THRESHOLD_CACHE = 0.92
SIMILARITY_THRESHOLD_MAZE = 0.80
TTL_SECONDS = 3600
CLEANUP_INTERVAL = 600

LOG_FILE = os.getenv("LOG_FILE", "auditoria_meta_agente.log")
LOG_FORMAT = "%(asctime)s | %(levelname)s | %(message)s"
LOG_DATEFMT = "%Y-%m-%d %H:%M:%S"
