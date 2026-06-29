# ivi_motor.py — motor iVi 4D (cálculo puro, sem IO)
# Espelha calcIVI de mobile/app/(app)/hygeios.tsx (V2.0604)
# Fórmula aprovada: Físico×0.35 + Mental×0.30 + Espiritual×0.20 + Social×0.15

from dataclasses import dataclass


@dataclass
class IVIData:
    meals_today: int = 0
    meals_week: int = 0
    diary_week: int = 0
    diary_unique_days: int = 0
    wonder_month: int = 0
    posts_month: int = 0
    streak: int = 0


@dataclass
class IVIScores:
    fisico: int
    mental: int
    espiritual: int
    social: int
    overall: int


def calc_ivi(data: IVIData) -> IVIScores:
    fisico = min(100, round((data.meals_week / 21) * 70 + (data.meals_today / 3) * 30))
    mental = min(100, round((data.diary_week / 5) * 60 + (data.diary_unique_days / 15) * 40))
    espiritual = min(100, round((data.wonder_month / 4) * 50 + (data.diary_unique_days / 10) * 50))
    social = min(100, round((data.posts_month / 10) * 60 + min(data.streak, 30) / 30 * 40))
    overall = round(fisico * 0.35 + mental * 0.30 + espiritual * 0.20 + social * 0.15)
    return IVIScores(fisico=fisico, mental=mental, espiritual=espiritual, social=social, overall=overall)


def get_ivi_level(score: int) -> dict:
    if score >= 81:
        return {"label": "Excelente", "status": "EXCELENTE", "color": "#2ecc71"}
    if score >= 61:
        return {"label": "Bom", "status": "BOM", "color": "#5B8DEF"}
    if score >= 41:
        return {"label": "Atenção", "status": "ATENÇÃO", "color": "#f39c12"}
    if score >= 21:
        return {"label": "Alerta", "status": "ALERTA", "color": "#e67e22"}
    return {"label": "Crítico", "status": "CRÍTICO", "color": "#e74c3c"}
