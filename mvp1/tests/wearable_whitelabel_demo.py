"""WS4 — código de TESTE: wearable (EteriOS) -> iVi + white-label (2 peles).

Recupera o contexto de duas frentes ainda 'coming_soon' e as torna TESTÁVEIS agora,
sem device, sem deploy, sem banco — funções puras + auto-testes (assert).

1) Wearable -> Físico -> iVi
   EteriOS conecta wearables (Apple Watch/Oura/Fitbit/Garmin) e injeta sinais
   (FC repouso, HRV/RMSSD, horas de sono, passos) na dimensão FÍSICO do iVi.
   Fórmula iVi canônica (aprovada): Físico*0.35 + Mental*0.30 + Espiritual*0.20 + Social*0.15.

2) White-label (motor único / 2 peles)
   O mesmo motor serve a "pele" AquariOS (global) e peles B2B rebrandadas
   ("salvar operação"): marca, cores, locale e módulos habilitados por tenant.

Uso:  python tests/wearable_whitelabel_demo.py
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, List


# ============================================================
# 1) WEARABLE (EteriOS) -> FÍSICO -> iVi
# ============================================================

def _clamp(v: float, lo: float = 0.0, hi: float = 100.0) -> float:
    return max(lo, min(hi, v))


def _band(value: float, ideal_lo: float, ideal_hi: float, hard_lo: float, hard_hi: float) -> float:
    """100 dentro da faixa ideal; cai linearmente até 0 nos limites duros."""
    if ideal_lo <= value <= ideal_hi:
        return 100.0
    if value < ideal_lo:
        return _clamp((value - hard_lo) / (ideal_lo - hard_lo) * 100.0)
    return _clamp((hard_hi - value) / (hard_hi - ideal_hi) * 100.0)


@dataclass
class WearableSample:
    resting_hr: float        # bpm (menor = melhor)
    hrv_rmssd_ms: float      # ms (maior = melhor)
    sleep_hours: float       # horas
    steps: int               # passos/dia


def fisico_from_wearable(w: WearableSample) -> float:
    """Mapeia sinais de wearable -> sub-score FÍSICO (0..100). Pesos ilustrativos,
    viram config-first (admin_settings) quando o EteriOS sair de coming_soon."""
    hr   = _clamp((90 - w.resting_hr) / (90 - 50) * 100)  # FC repouso: 50bpm->100, 90bpm->0
    hrv  = _clamp(w.hrv_rmssd_ms / 80.0 * 100.0)          # ~80ms -> 100
    slp  = _band(w.sleep_hours, 7, 9, 0, 12)              # 7-9h ideal
    stp  = _clamp(w.steps / 10000.0 * 100.0)              # 10k passos -> 100
    return round(hr * 0.30 + hrv * 0.25 + slp * 0.25 + stp * 0.20, 1)


def calculate_ivi(fisico: float, mental: float, espiritual: float, social: float) -> float:
    """iVi 4D canônico (mesma fórmula do backend/calculate_ivi do banco)."""
    return round(fisico * 0.35 + mental * 0.30 + espiritual * 0.20 + social * 0.15, 1)


# ============================================================
# 2) WHITE-LABEL — motor único / 2 peles
# ============================================================

@dataclass
class TenantSkin:
    tenant_id: str
    brand_name: str
    primary_color: str
    locale: str = "pt-BR"
    enabled_modules: List[str] = field(default_factory=list)
    white_label: bool = True


# Catálogo base (subconjunto do modules-registry do app).
ALL_MODULES = ["proteos", "hygeios", "nutricao", "diario", "comunidades",
               "eterios", "asclepios", "hermeos", "alexandrios"]

# Pele padrão AquariOS (global): tudo ligado, marca AquariOS.
DEFAULT_SKIN = TenantSkin(
    tenant_id="aquarios",
    brand_name="AquariOS",
    primary_color="#5B8DEF",
    locale="pt-BR",
    enabled_modules=ALL_MODULES,
    white_label=False,
)


def resolve_skin(tenant: TenantSkin) -> Dict:
    """Resolve o manifesto efetivo de uma pele (merge com o default). Mesmo motor,
    aparência/escopo por tenant — sem fork de código."""
    modules = tenant.enabled_modules or DEFAULT_SKIN.enabled_modules
    unknown = [m for m in modules if m not in ALL_MODULES]
    if unknown:
        raise ValueError(f"módulos desconhecidos para {tenant.tenant_id}: {unknown}")
    return {
        "tenant_id": tenant.tenant_id,
        "brand_name": tenant.brand_name,
        "primary_color": tenant.primary_color,
        "locale": tenant.locale,
        "modules": modules,
        "white_label": tenant.white_label,
        "powered_by": "AquariOS" if tenant.white_label else None,
    }


# ============================================================
# AUTO-TESTES + DEMO
# ============================================================

def _self_test() -> None:
    # Wearable saudável -> Físico alto
    atleta = WearableSample(resting_hr=55, hrv_rmssd_ms=75, sleep_hours=8, steps=11000)
    f_alto = fisico_from_wearable(atleta)
    assert f_alto >= 85, f_alto

    # Wearable ruim -> Físico baixo
    sedentario = WearableSample(resting_hr=90, hrv_rmssd_ms=20, sleep_hours=4.5, steps=1500)
    f_baixo = fisico_from_wearable(sedentario)
    assert f_baixo <= 45, f_baixo

    # iVi monotônico no Físico (mantendo as outras dimensões)
    ivi_alto = calculate_ivi(f_alto, 70, 60, 65)
    ivi_baixo = calculate_ivi(f_baixo, 70, 60, 65)
    assert ivi_alto > ivi_baixo

    # iVi peso do Físico = 0.35 (sanity da fórmula)
    assert calculate_ivi(100, 0, 0, 0) == 35.0
    assert calculate_ivi(0, 0, 0, 0) == 0.0
    assert calculate_ivi(100, 100, 100, 100) == 100.0

    # White-label: default não é white-label; tenant B2B é
    assert resolve_skin(DEFAULT_SKIN)["white_label"] is False
    clinica = TenantSkin(tenant_id="odontolar", brand_name="Odontolar+",
                         primary_color="#52C98A", enabled_modules=["proteos", "asclepios", "hygeios"])
    m = resolve_skin(clinica)
    assert m["white_label"] is True and m["powered_by"] == "AquariOS"
    assert m["modules"] == ["proteos", "asclepios", "hygeios"]

    # Tenant com módulo inexistente -> erro claro
    try:
        resolve_skin(TenantSkin("x", "X", "#fff", enabled_modules=["inexistente"]))
        raise AssertionError("deveria ter levantado ValueError")
    except ValueError:
        pass

    print("[OK] todos os auto-testes passaram.")


def _demo() -> None:
    print("\n--- WEARABLE -> FISICO -> iVi ---")
    for nome, w in [
        ("Atleta",     WearableSample(55, 75, 8.0, 11000)),
        ("Mediano",    WearableSample(68, 45, 6.5, 6000)),
        ("Sedentario", WearableSample(90, 20, 4.5, 1500)),
    ]:
        f = fisico_from_wearable(w)
        ivi = calculate_ivi(f, mental=70, espiritual=60, social=65)
        print(f"  {nome:11} FC={w.resting_hr:>3.0f} HRV={w.hrv_rmssd_ms:>3.0f}ms "
              f"sono={w.sleep_hours}h passos={w.steps:>6} -> Fisico={f:>5} | iVi={ivi}")

    print("\n--- WHITE-LABEL (2 peles, mesmo motor) ---")
    for skin in [
        DEFAULT_SKIN,
        TenantSkin("odontolar", "Odontolar+", "#52C98A", enabled_modules=["proteos", "asclepios", "hygeios"]),
        TenantSkin("clinicaX", "Clinica X", "#E07B54", locale="es", enabled_modules=["proteos", "hygeios"]),
    ]:
        m = resolve_skin(skin)
        wl = "white-label" if m["white_label"] else "pele global"
        print(f"  {m['brand_name']:11} [{wl}] cor={m['primary_color']} locale={m['locale']} "
              f"modulos={len(m['modules'])} powered_by={m['powered_by']}")


if __name__ == "__main__":
    _self_test()
    _demo()
