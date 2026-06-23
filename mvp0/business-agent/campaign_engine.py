#!/usr/bin/env python3
"""
campaign_engine.py — Orquestrador de campanhas por país/idioma/onda
Decide: qual sequência de mensagens, qual gateway, qual topo de conteúdo
"""
import os
from typing import Optional

from routing import country_info, reply_language, COUNTRIES

class CampaignEngine:
    """Orquestra sequências de mensagem por país/idioma/onda"""

    # Mensagens de boas-vindas por idioma
    WELCOME_MSGS = {
        "pt": "Olá! 👋 Bem-vindo ao AquariOS.\nVocê está conversando com o ProteOS, IA de bem-estar integral.\n\nVou ajudá-lo a entender melhor como você está — em 4 dimensões: Físico, Mental, Espiritual e Social.\n\nPara começar: qual é sua primeira pergunta sobre bem-estar hoje?",
        "en": "Hello! 👋 Welcome to AquariOS.\nYou're chatting with ProteOS, your AI well-being companion.\n\nI measure your vitality across four dimensions: Physical, Mental, Meaning, and Social.\n\nWhat's your first well-being question today?",
        "es": "¡Hola! 👋 Bienvenido a AquariOS.\nEstás conversando con ProteOS, tu compañero de bienestar con IA.\n\nMido tu vitalidad en cuatro dimensiones: Física, Mental, Espiritual y Social.\n\n¿Cuál es tu primera pregunta de bienestar hoy?",
        "nb": "Hallo! 👋 Velkommen til AquariOS.\nDu chatter med ProteOS, din AI-baserte wellnessassistent.\n\nJeg måler vitaliteten din i fire dimensjoner: Fysisk, Mental, Spirituell og Sosial.\n\nHva er ditt første spørsmål om velvære i dag?",
        "de": "Hallo! 👋 Willkommen bei AquariOS.\nDu chattest mit ProteOS, deinem KI-Wellnessbegleiter.\n\nIch messe deine Vitalität in vier Dimensionen: Physisch, Mental, Spirituell und Sozial.\n\nWas ist deine erste Wohlbefindensfrage heute?",
    }

    # Templates por país
    COUNTRY_TEMPLATES = {
        "BR": {
            "onda": 1,
            "tema": "De volta para você",
            "tom": "caloroso, próximo, humor leve",
            "canal_primario": "whatsapp",
            "gateway": "stripe",
            "mensagem_teaser": "Você rastreia tudo. Quando foi que entendeu algo de verdade?\n\nO AquariOS mede sua vitalidade em 4 dimensões e mostra onde agir.",
        },
        "US": {
            "onda": 1,
            "tema": "Whole-being, one number",
            "tom": "direct, intelligent, evidence-adjacent",
            "canal_primario": "instagram",
            "gateway": "stripe",
            "mensagem_teaser": "You track everything. When did you last understand anything?\n\nAquariOS measures your whole self in one score: iVi.",
        },
        "PT": {
            "onda": 1,
            "tema": "Saudade de si próprio",
            "tom": "reservado, literário, filosófico",
            "canal_primario": "whatsapp",
            "gateway": "stripe",
            "mensagem_teaser": "Há quanto tempo não te perguntas como estás, de verdade?\n\nO teu iVi é o número que mostra onde estás.",
        },
        "NG": {
            "onda": 1,
            "tema": "Strength begins within",
            "tom": "empowering, performance-focused",
            "canal_primario": "whatsapp",
            "gateway": "paystack",
            "mensagem_teaser": "You check on everyone. When did anyone last check on you?\n\nYour vitality score shows what nobody else sees.",
        },
        "PE": {
            "onda": 1,
            "tema": "Empieza contigo",
            "tom": "cálido, colectivista",
            "canal_primario": "tiktok",
            "gateway": "stripe",
            "mensagem_teaser": "¿Cuándo fue la última vez que te preguntaste cómo estás tú?\n\nPara cuidar de todos, empieza contigo.",
        },
        "VE": {
            "onda": 1,
            "tema": "Lo que nadie te puede quitar",
            "tom": "honesto, cálido, sin promesas falsas",
            "canal_primario": "whatsapp",
            "gateway": "free",
            "mensagem_teaser": "El mundo cambia todo. Tu bienestar interior, no.\n\nTu iVi te muestra dónde estás realmente.",
        },
    }

    def __init__(self):
        self.countries = COUNTRIES
        self.templates = self.COUNTRY_TEMPLATES

    def get_campaign(self, pais: str, canal: str) -> Optional[dict]:
        """
        Retorna config da campanha para país/canal

        Args:
            pais: ISO2 (BR, US, etc)
            canal: 'whatsapp', 'instagram', 'messenger'

        Returns:
            {
                "bem_vindo": "mensagem pt",
                "tema": "...",
                "tom": "...",
                "gateway": "stripe|paystack|free",
                "onda": 1,
                "conteudo": {...},
            }
        """

        if pais not in self.countries:
            return None

        country = self.countries[pais]
        template = self.templates.get(pais, {})
        lang = country.get("lang", "pt")

        return {
            "pais": pais,
            "idioma": lang,
            "locale": country.get("locale"),
            "onda": country.get("wave", 1),
            "canal": canal,
            "gateway": country.get("gateway"),
            "bem_vindo": self.WELCOME_MSGS.get(lang, self.WELCOME_MSGS["pt"]),
            "tema": template.get("tema"),
            "tom": template.get("tom"),
            "moeda": country.get("currency"),
            "rtl": country.get("rtl", False),
        }

    def get_sequence(self, pais: str, onda: int, stage: str = "teaser") -> list:
        """
        Retorna sequência de mensagens para a fase (teaser, launch, sustain)

        Args:
            pais: ISO2
            onda: 1, 2, 3, 4
            stage: 'teaser', 'launch', 'sustain'

        Returns:
            [{"delay": 0, "msg": "..."}, {"delay": 3600, "msg": "..."}, ...]
        """

        # Scaffold: você preencheria isso com mensagens reais por país
        sequences = {
            ("teaser", "PT"): [
                {"delay": 0, "msg": "Há quanto tempo não te perguntas como estás?"},
                {"delay": 86400, "msg": "AquariOS mede Físico, Mental, Espiritual e Social em um único número."},
                {"delay": 172800, "msg": "Descobre o teu iVi → registo gratuito"},
            ],
            ("teaser", "BR"): [
                {"delay": 0, "msg": "Você rastreia tudo. Quando entendeu algo de verdade?"},
                {"delay": 86400, "msg": "iVi: Físico, Mental, Espiritual, Social em um score."},
                {"delay": 172800, "msg": "Volte para você → pré-registro grátis"},
            ],
        }

        key = (stage, pais)
        return sequences.get(key, [])

    def should_show_paywall(self, pais: str, onda: int) -> bool:
        """Determina se mostra paywall (free tier para alguns países)"""
        free_tiers = ["VE"]  # Venezuela = sempre free
        return pais not in free_tiers and onda == 1

    def get_pricing_tier(self, pais: str) -> dict:
        """
        Retorna tiers de preço por país (moeda local)

        Returns:
            {
                "free": {...},
                "starter": {"preco": 29.90, "moeda": "BRL", ...},
                "premium": {...},
            }
        """

        # Scaffold: você preencheria com preços reais via API
        tiers = {
            "BR": {
                "free": {"preco": 0, "features": ["iVi 4D básico", "3 consultas/dia"]},
                "starter": {"preco": 29.90, "moeda": "BRL", "features": ["iVi 4D completo", "ilimitado", "Diário"]},
            },
            "US": {
                "free": {"preco": 0, "features": ["iVi 4D basic", "3 queries/day"]},
                "starter": {"preco": 9.99, "moeda": "USD", "features": ["iVi 4D full", "unlimited", "Journal"]},
            },
        }

        return tiers.get(pais, tiers.get("BR"))

# Instância global
engine = CampaignEngine()
