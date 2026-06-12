import logging
from prometheus_client import Counter, Histogram
from config import LOG_FILE, LOG_FORMAT, LOG_DATEFMT

def setup_logging():
    logging.basicConfig(filename=LOG_FILE, level=logging.INFO, format=LOG_FORMAT, datefmt=LOG_DATEFMT)

CACHE_HITS = Counter("meta_cache_hits_total", "Cache hits")
TOKENS_POUPADOS = Counter("meta_tokens_poupados_total", "Tokens poupados")
CUSTO_TKN = Counter("meta_custo_tkn_total", "Custo total em TKN")
REQ_DURATION = Histogram("meta_request_duration_ms", "Duração")
