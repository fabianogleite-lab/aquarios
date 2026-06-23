"""H1 — Loop agêntico do HygeiOS (captura → decantação → maturação → carimbo → fala)."""
from datetime import datetime, timedelta
from typing import Optional
import hashlib


def detectar_padrao(user_id: str, db, admin_settings: dict) -> Optional[dict]:
    """Silêncio Inteligente: só fala após recorrência confirmada.

    1. Busca histórico iVi do usuário (últimos X dias)
    2. Calcula tendência (dimensão fraca = min() histórico)
    3. Se recorrente → retorna pacote de insight
    4. Senão → None (silêncio)
    """
    dias = int(admin_settings.get("hygeios_recorrencia_dias", 7))
    vezes = int(admin_settings.get("hygeios_recorrencia_vezes", 3))

    data_inicio = datetime.utcnow() - timedelta(days=dias)

    # Busca registros iVi do usuário nesta janela
    res = db.table("user_health_metrics").select(
        "id, data_hora, p_fisico, p_mental, p_espiritual, p_social"
    ).eq("user_id", user_id).gte("data_hora", data_inicio.isoformat()).execute()

    dados = res.data or []
    if len(dados) < vezes:
        return None  # Silêncio: não há recorrência

    # Dimensão fraca = menor score médio
    dims = {
        "fisico": [d["p_fisico"] for d in dados if d["p_fisico"]],
        "mental": [d["p_mental"] for d in dados if d["p_mental"]],
        "espiritual": [d["p_espiritual"] for d in dados if d["p_espiritual"]],
        "social": [d["p_social"] for d in dados if d["p_social"]],
    }

    dim_fraca = min((k, sum(v)/len(v)) for k, v in dims.items() if v)[0]

    return {
        "user_id": user_id,
        "tipo": "PADRAO_RECORRENTE",
        "dimensao_fraca": dim_fraca,
        "dias_janela": dias,
        "ocorrencias": len(dados),
        "requer_confirmacao": admin_settings.get("hygeios_carimbo_automat") == "false",
    }


def h1_worker(db, admin_settings: dict):
    """Background worker: roda a cada 6h. Busca padrões e prepara insights."""

    # Busca todos os users com dados recentes
    res = db.table("users").select("id").execute()
    users = [row["id"] for row in res.data or []]

    insights = []
    for user_id in users:
        padrao = detectar_padrao(user_id, db, admin_settings)
        if padrao:
            insights.append(padrao)

    # Grava insights detectados (aguardando carimbo CerberOS)
    for insight in insights:
        db.table("hygeios_insights").insert({
            "user_id": insight["user_id"],
            "tipo": insight["tipo"],
            "dimensao": insight["dimensao_fraca"],
            "status": "AGUARDANDO_CARIMBO" if insight["requer_confirmacao"] else "APROVADO",
            "dados": insight,
        }).execute()

    return {"processados": len(users), "insights": len(insights)}
