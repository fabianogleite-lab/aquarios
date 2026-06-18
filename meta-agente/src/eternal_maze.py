from collections import deque
import numpy as np
from config import SIMILARITY_THRESHOLD_MAZE
from datalake import EmbeddingModel

class EternalMaze:
    def __init__(self, maxlen=10):
        self.history = deque(maxlen=maxlen)
        self.embedding = EmbeddingModel()
    def add(self, pergunta: str, resposta: str):
        vec = np.array(self.embedding.encode(pergunta))
        self.history.append({"pergunta": pergunta, "resposta": resposta, "vec": vec})
    def buscar(self, pergunta: str):
        if not self.history: return None
        qvec = np.array(self.embedding.encode(pergunta))
        best, best_score = None, 0
        for item in self.history:
            score = np.dot(qvec, item["vec"]) / (np.linalg.norm(qvec) * np.linalg.norm(item["vec"]))
            if score > best_score: best_score, best = score, item
        return best["resposta"] if best_score >= SIMILARITY_THRESHOLD_MAZE else None
