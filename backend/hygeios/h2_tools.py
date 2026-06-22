"""H2 — Tools do HygeiOS (chamáveis por ProteOS/SandeirOS). Gate CerberOS obrigatório."""
from typing import Optional, List


def ivi(user_id: str, db) -> Optional[dict]:
    """Retorna iVi 4D atual do usuário (Físico×0.35 + Mental×0.30 + Espiritual×0.20 + Social×0.15)."""
    res = db.table("user_health_metrics").select(
        "p_fisico, p_mental, p_espiritual, p_social"
    ).eq("user_id", user_id).order("ts", desc=True).limit(1).execute()

    if not res.data:
        return None

    m = res.data[0]
    ivi_score = (
        m["p_fisico"] * 0.35 +
        m["p_mental"] * 0.30 +
        m["p_espiritual"] * 0.20 +
        m["p_social"] * 0.15
    )
    return {
        "ivi": ivi_score,
        "fisico": m["p_fisico"],
        "mental": m["p_mental"],
        "espiritual": m["p_espiritual"],
        "social": m["p_social"],
    }


def tendencia(user_id: str, dimensao: str, db, dias: int = 7) -> Optional[dict]:
    """Tendência de uma dimensão nos últimos N dias."""
    from datetime import datetime, timedelta

    data_inicio = (datetime.utcnow() - timedelta(days=dias)).isoformat()
    col = f"p_{dimensao}"

    res = db.table("user_health_metrics").select(col).eq(
        "user_id", user_id
    ).gte("ts", data_inicio).order("ts").execute()

    valores = [r[col] for r in res.data or [] if r.get(col)]
    if not valores:
        return None

    return {
        "dimensao": dimensao,
        "media": sum(valores) / len(valores),
        "min": min(valores),
        "max": max(valores),
        "tendencia": "↑" if valores[-1] > valores[0] else "↓",
    }


def historico(user_id: str, db, limite: int = 30) -> List[dict]:
    """Histórico dos últimos N registros iVi."""
    res = db.table("user_health_metrics").select(
        "ts, p_fisico, p_mental, p_espiritual, p_social"
    ).eq("user_id", user_id).order("ts", desc=True).limit(limite).execute()

    return res.data or []


def detectar_padrao(user_id: str, db, admin_settings: dict) -> Optional[dict]:
    """Detecta padrão recorrente (reutiliza H1)."""
    from .h1_loop import detectar_padrao as h1_detectar

    return h1_detectar(user_id, db, admin_settings)


# Gate CerberOS — validação obrigatória antes de liberar dados sensíveis
def validar_com_cerberios(user_id: str, operacao: str, db) -> bool:
    """Stub: CerberOS vai validar aqui. Por enquanto, true."""
    # TODO: chamar /v1/cerber_shield/validar com token JWT
    return True
