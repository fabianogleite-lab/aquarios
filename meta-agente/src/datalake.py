import time
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct, Filter, FieldCondition, Range
from sentence_transformers import SentenceTransformer
from config import QDRANT_PATH, COLLECTION_NAME, DIM, TTL_SECONDS, SIMILARITY_THRESHOLD_CACHE

class EmbeddingModel:
    _instance = None
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance.model = SentenceTransformer('all-MiniLM-L6-v2')
        return cls._instance
    def encode(self, text: str):
        return self.model.encode(text).tolist()

class QdrantCache:
    def __init__(self):
        self.client = QdrantClient(path=QDRANT_PATH)
        self.embedding = EmbeddingModel()
        self._ensure_collection()

    def _ensure_collection(self):
        collections = [c.name for c in self.client.get_collections().collections]
        if COLLECTION_NAME not in collections:
            self.client.create_collection(collection_name=COLLECTION_NAME, vectors_config=VectorParams(size=DIM, distance=Distance.COSINE))

    def buscar(self, pergunta: str):
        vector = self.embedding.encode(pergunta)
        results = self.client.search(collection_name=COLLECTION_NAME, query_vector=vector, limit=1, with_payload=True)
        if not results: return None
        hit = results[0]
        if hit.score < SIMILARITY_THRESHOLD_CACHE: return None
        payload = hit.payload
        if payload.get("timestamp", 0) < time.time() - TTL_SECONDS: return None
        return payload["resposta"], payload["content_hash"], payload["block_hash"]

    def salvar(self, pergunta: str, categoria: str, resposta: str, content_hash: str, block_hash: str):
        vector = self.embedding.encode(pergunta)
        point_id = int(time.time() * 1000000) % (2**63)
        payload = {"pergunta": pergunta, "categoria": categoria, "resposta": resposta, "timestamp": time.time(), "content_hash": content_hash, "block_hash": block_hash}
        self.client.upsert(collection_name=COLLECTION_NAME, points=[PointStruct(id=point_id, vector=vector, payload=payload)])

    def cleanup_expired(self):
        cutoff = time.time() - TTL_SECONDS
        filtr = Filter(must=[FieldCondition(key="timestamp", range=Range(lt=cutoff))])
        self.client.delete(collection_name=COLLECTION_NAME, points_selector=filtr)
