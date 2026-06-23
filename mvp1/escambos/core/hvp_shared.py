"""
hvp_shared.py — Heurística de Valoração Psicográfica
Módulo ML compartilhado entre EscambOS, OdontolarPlus e HeySky.
Consumido via HygeiOS API (api.podiumtec.com.br/v1/rank).
"""
from __future__ import annotations
import hashlib
import math
from dataclasses import dataclass, field
from typing import Optional


# ── Tipos ────────────────────────────────────────────────────────────────────

@dataclass
class AttentionSignal:
    item_id: str
    dwell_ms: int
    clicks: int
    category: str
    scroll_velocity: float = 0.0

@dataclass
class PsychProfile:
    social_emocional: float = 50.0
    comportamental:   float = 50.0
    ideologico:       float = 50.0
    filosofico:       float = 50.0
    religioso:        float = 50.0

    def dominant(self) -> str:
        return max(self.__dict__, key=self.__dict__.get)

    def engagement_score(self) -> float:
        vals = list(self.__dict__.values())
        return round(sum(vals) / len(vals), 2)

@dataclass
class RankedItem:
    item_id: str
    rank: int
    engagement_score: float
    intent_class: str
    dominant_dimension: str
    dwell_ms: int
    profile: PsychProfile


# ── Motor base ───────────────────────────────────────────────────────────────

class AttentionEngine:
    """
    Motor HVP base. Subclasses adaptam CATEGORY_MAP e LIMIAR_MS
    para EscambOS, OdontolarPlus e HeySky.
    """
    LIMIAR_MS: int = 3500
    DECAY_HALF_LIFE: float = 86400.0  # 24h em segundos

    # Mapeamento genérico categoria→dimensão (override nas subclasses)
    CATEGORY_MAP: dict[str, list[str]] = {
        "social_emocional": ["comunidade", "familia", "social", "compartilhar"],
        "comportamental":   ["preco", "desconto", "oferta", "comprar", "prazo"],
        "ideologico":       ["sustentavel", "etica", "privacidade", "transparencia"],
        "filosofico":       ["proposito", "valor", "bem-estar", "qualidade"],
        "religioso":        ["tradicao", "fe", "cultura", "identidade"],
    }

    def _intensity(self, signal: AttentionSignal) -> float:
        return math.log1p(signal.dwell_ms / 1000.0) * (1.0 + signal.clicks / 5.0)

    def _map_category(self, profile: PsychProfile, category: str, intensity: float) -> None:
        cat_lower = category.lower()
        for dimension, keywords in self.CATEGORY_MAP.items():
            if any(kw in cat_lower for kw in keywords):
                current = getattr(profile, dimension)
                setattr(profile, dimension, min(100.0, current + intensity))
                return
        # fallback: distribui uniformemente
        delta = intensity * 0.2
        for dim in profile.__dict__:
            setattr(profile, dim, min(100.0, getattr(profile, dim) + delta))

    def score(self, signals: list[AttentionSignal]) -> PsychProfile:
        """Processa lista de sinais e retorna perfil psicográfico."""
        profile = PsychProfile()
        for s in signals:
            intensity = self._intensity(s)
            self._map_category(profile, s.category, intensity)
        return profile

    def classify_intent(self, profile: PsychProfile, dwell_ms: int) -> str:
        """Classifica intenção com base no perfil e tempo total de atenção."""
        if dwell_ms >= self.LIMIAR_MS:
            return "ANTECIPADO_SUCESSO"
        if dwell_ms >= self.LIMIAR_MS * 0.6:
            return "OBSERVACAO_ATIVA"
        return "OBSERVACAO_PASSIVA"

    def rank(
        self,
        items: list[dict],
        signals_by_item: dict[str, list[AttentionSignal]],
    ) -> list[RankedItem]:
        """
        Rankeia itens por engagement score descendente.
        items: [{"id": str, ...}, ...]
        signals_by_item: {item_id: [AttentionSignal, ...]}
        """
        scored = []
        for item in items:
            item_id = item["id"]
            sigs = signals_by_item.get(item_id, [])
            profile = self.score(sigs)
            total_dwell = sum(s.dwell_ms for s in sigs)
            intent = self.classify_intent(profile, total_dwell)
            scored.append((profile.engagement_score(), item_id, profile, total_dwell, intent))

        scored.sort(key=lambda x: x[0], reverse=True)

        return [
            RankedItem(
                item_id=item_id,
                rank=i + 1,
                engagement_score=score,
                intent_class=intent,
                dominant_dimension=profile.dominant(),
                dwell_ms=dwell_ms,
                profile=profile,
            )
            for i, (score, item_id, profile, dwell_ms, intent) in enumerate(scored)
        ]

    @staticmethod
    def hash_user(user_id: str) -> str:
        """SHA-256 DOP — nunca armazena PII em disco."""
        return hashlib.sha256(user_id.encode()).hexdigest()[:24]


# ── Adaptador EscambOS ───────────────────────────────────────────────────────

class EscambosAdapter(AttentionEngine):
    """
    Rankeia produtos do marketplace por intenção de compra.
    Categorias: produto, oferta, desconto, premium, comunidade, parceiro.
    """
    LIMIAR_MS = 3500
    CATEGORY_MAP = {
        "social_emocional": ["comunidade", "parceiro", "indicacao", "familia"],
        "comportamental":   ["produto", "desconto", "oferta", "preco", "frete"],
        "ideologico":       ["sustentavel", "local", "etica", "transparencia"],
        "filosofico":       ["premium", "qualidade", "exclusivo", "valor"],
        "religioso":        ["tradicao", "artesanal", "cultura", "origem"],
    }

    def cta_for_profile(self, profile: PsychProfile) -> str:
        ctas = {
            "social_emocional": "Compartilhe com quem você gosta",
            "comportamental":   "Aproveite — oferta expira em breve",
            "ideologico":       "Produto com impacto positivo",
            "filosofico":       "Qualidade que vale o investimento",
            "religioso":        "Tradição e autenticidade garantidas",
        }
        return ctas[profile.dominant()]


# ── Adaptador OdontolarPlus ──────────────────────────────────────────────────

class OdontolarAdapter(AttentionEngine):
    """
    Score de interesse por procedimento odontológico.
    Detecta intenção de upsell (ex: clareamento → alinhador → implante).
    Categorias: implante, ortodontia, alinhador, clareamento, estetica, preventivo.
    """
    LIMIAR_MS = 2500  # menor no contexto clínico — 2.5s já é intenção real
    CATEGORY_MAP = {
        "social_emocional": ["sorriso", "autoestima", "confianca", "aparencia"],
        "comportamental":   ["preco", "parcela", "financiamento", "plano"],
        "ideologico":       ["saude", "prevencao", "higiene", "cuidado"],
        "filosofico":       ["estetica", "alinhador", "premium", "exclusivo"],
        "religioso":        ["familia", "crianca", "tradicional", "local"],
    }
    UPSELL_CHAIN: list[str] = [
        "preventivo", "clareamento", "ortodontia", "alinhador", "implante",
    ]

    def upsell_recommendation(self, profile: PsychProfile, current_interest: str) -> Optional[str]:
        """Retorna próximo procedimento na cadeia de upsell, se aplicável."""
        try:
            idx = self.UPSELL_CHAIN.index(current_interest)
            if idx < len(self.UPSELL_CHAIN) - 1 and profile.engagement_score() > 60:
                return self.UPSELL_CHAIN[idx + 1]
        except ValueError:
            pass
        return None


# ── Adaptador HeySky ─────────────────────────────────────────────────────────

class HeySkyAdapter(AttentionEngine):
    """
    Qualifica leads solares por atenção ao simulador de economia.
    Prioriza vendedores para leads de maior ticket (premium > economia).
    Categorias: simulador, roi, financiamento, premium, economia, instalacao.
    """
    LIMIAR_MS = 4000  # leads solares precisam de mais convicção
    CATEGORY_MAP = {
        "social_emocional": ["familia", "casa", "vizinho", "comunidade"],
        "comportamental":   ["economia", "conta", "kwh", "desconto", "retorno"],
        "ideologico":       ["sustentavel", "solar", "verde", "limpo", "carbono"],
        "filosofico":       ["roi", "investimento", "premium", "autonomia"],
        "religioso":        ["tradicao", "local", "regiao", "instalador"],
    }
    LEAD_TIERS = {
        (80, 100): "PLATINUM",
        (65,  79): "GOLD",
        (50,  64): "SILVER",
        ( 0,  49): "BRONZE",
    }

    def lead_tier(self, profile: PsychProfile) -> str:
        score = profile.engagement_score()
        for (lo, hi), tier in self.LEAD_TIERS.items():
            if lo <= score <= hi:
                return tier
        return "BRONZE"

    def salesperson_priority(self, ranked: list[RankedItem]) -> list[dict]:
        """Retorna fila de atendimento priorizada para o vendedor."""
        return [
            {
                "lead_id": r.item_id,
                "tier": self.lead_tier(r.profile),
                "score": r.engagement_score,
                "intent": r.intent_class,
                "action": "LIGAR_AGORA" if r.engagement_score > 65 else "ENVIAR_WHATSAPP",
            }
            for r in ranked
        ]


# ── Factory ───────────────────────────────────────────────────────────────────

def get_engine(project: str) -> AttentionEngine:
    engines = {
        "escambos":    EscambosAdapter,
        "odontolar":   OdontolarAdapter,
        "heysky":      HeySkyAdapter,
    }
    cls = engines.get(project.lower())
    if not cls:
        raise ValueError(f"Projeto desconhecido: {project}. Use: {list(engines.keys())}")
    return cls()
