
"""
AquariOS - Core Pipeline + CRM + Omnichannel
Integração: Meta Agent + Leonardo + Slack
"""
import os, time, requests
from datetime import datetime, timedelta

# CONFIG
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
LEONARDO_KEY = os.getenv("LEONARDO_API_KEY")
SLACK_WEBHOOK = os.getenv("SLACK_APPROVAL_URL")
META_TOKEN = os.getenv("META_TOKEN")

class AquariOS:
    def __init__(self):
        self.db = SupabaseClient(SUPABASE_URL, SUPABASE_KEY)
    
    # ===== 1. PIPELINE =====
    def avancar_pipeline(self, cliente_id, novo_stage, motivo=""):
        """Move lead no funil e dispara ação automática"""
        stage = self.db.get("pipeline_stages", {"stage_key": novo_stage})
        self.db.update("clientes", cliente_id, {
            "pipeline_stage": novo_stage,
            "pipeline_score": stage["probabilidade_fechamento"],
            "updated_at": datetime.now().isoformat()
        })
        
        # Ação automática por estágio
        acoes = {
            "lead_novo": self.enviar_boas_vindas,
            "qualificado": self.agendar_consulta,
            "agendado": self.enviar_lembrete,
            "fechado_ganho": self.cobrar_pix
        }
        if novo_stage in acoes:
            acoes[novo_stage](cliente_id)
        
        return {"ok": True, "stage": novo_stage}
    
    # ===== 2. CRM OMNICHANNEL =====
    def processar_mensagem(self, webhook_payload):
        """Recebe mensagem de QUALQUER canal e responde"""
        canal = self.detectar_canal(webhook_payload)
        canal_id = self.extrair_id(webhook_payload, canal)
        
        # 1. Encontrar ou criar cliente (unifica por wa_id/ig_id)
        cliente = self.db.find_or_create_cliente(canal, canal_id, webhook_payload)
        
        # 2. Enriquecer contexto
        contexto = self.enriquecer_contexto(cliente["id"])
        
        # 3. Compliance
        if not self.compliance_check(contexto, webhook_payload):
            return {"bloqueado": True, "motivo": "LGPD/GDPR"}
        
        # 4. Salvar mensagem inbound
        conversa = self.get_or_create_conversa(cliente["id"], canal, canal_id)
        self.db.insert("mensagens", {
            "conversa_id": conversa["id"],
            "direcao": "in",
            "tipo": "text",
            "conteudo": webhook_payload,
            "created_at": datetime.now().isoformat()
        })
        
        # 5. IA decide resposta (<5s)
        resposta = self.ia_gerar_resposta(contexto, webhook_payload)
        
        # 6. Se precisa aprovação humana (valor > R$500 ou risco alto)
        if resposta["precisa_aprovacao"]:
            return self.pedir_aprovacao_slack(resposta, contexto)
        
        # 7. Responder automaticamente
        return self.enviar_resposta_meta(conversa, resposta, contexto)
    
    def detectar_canal(self, payload):
        if "entry" in payload and "changes" in payload["entry"][0]:
            if "messages" in payload["entry"][0]["changes"][0]["value"]:
                return "whatsapp"
        if "instagram" in str(payload).lower():
            return "instagram"
        return "messenger"
    
    def enriquecer_contexto(self, cliente_id):
        """Busca tudo do cliente antes de responder"""
        cliente = self.db.get("clientes", {"id": cliente_id})
        conversas_24h = self.db.count_conversas_recentes(cliente_id)
        return {
            **cliente,
            "conversas_24h": conversas_24h,
            "janela_aberta": conversas_24h > 0
        }
    
    # ===== 3. SINCRONIZADOR META =====
    def sync_meta_webhook(self, payload):
        """Salva tudo que vem da Meta e processa"""
        self.db.insert("sync_meta_log", {
            "evento": "webhook.received",
            "payload": payload,
            "processado": False
        })
        # Processa assíncrono
        return self.processar_mensagem(payload)
    
    def enviar_resposta_meta(self, conversa, resposta, contexto):
        """Envia via Meta API e atualiza CRM"""
        url = f"https://graph.facebook.com/v21.0/{os.getenv('PHONE_ID')}/messages"
        payload = {
            "messaging_product": "whatsapp",
            "to": contexto["wa_id"],
            "text": {"body": resposta["texto"]}
        }
        r = requests.post(url, json=payload, headers={"Authorization": f"Bearer {META_TOKEN}"})
        
        # Salva no CRM
        self.db.insert("mensagens", {
            "conversa_id": conversa["id"],
            "direcao": "out",
            "tipo": "text",
            "conteudo": payload,
            "meta_message_id": r.json().get("messages", [{}])[0].get("id"),
            "status_meta": "sent",
            "latencia_ms": resposta["latencia"]
        })
        
        # Atualiza pipeline se detectou intenção
        if "agendar" in resposta["texto"].lower():
            self.avancar_pipeline(contexto["id"], "agendado")
        
        return {"enviado": True}
    
    # ===== 4. APROVAÇÃO HUMANA SLACK =====
    def pedir_aprovacao_slack(self, acao, contexto):
        """HumanLayer - IA pede aprovação antes de executar"""
        aprovacao_id = self.db.insert("aprovacoes_slack", {
            "acao": acao["tipo"],
            "payload": acao,
            "custo_estimado_usd": acao.get("custo", 0),
            "risco_score": acao.get("risco", 50),
            "status": "pendente"
        })
        
        # Envia card no Slack
        card = {
            "text": f"🤖 AquariOS precisa aprovação",
            "blocks": [
                {"type": "section", "text": {"type": "mrkdwn", "text": f"*Ação:* {acao['tipo']}
*Cliente:* {contexto['nome']} ({contexto['pais']})
*Custo:* ${acao.get('custo',0)}
*Risco:* {acao.get('risco',50)}/100"}},
                {"type": "actions", "elements": [
                    {"type": "button", "text": {"type": "plain_text", "text": "✅ Aprovar"}, "style": "primary", "value": f"aprovar_{aprovacao_id}", "action_id": "aprovar"},
                    {"type": "button", "text": {"type": "plain_text", "text": "❌ Reprovar"}, "style": "danger", "value": f"reprovar_{aprovacao_id}", "action_id": "reprovar"}
                ]}
            ]
        }
        requests.post(SLACK_WEBHOOK, json=card)
        return {"aguardando_aprovacao": True, "id": aprovacao_id}
    
    def processar_aprovacao_slack(self, action_value, usuario_slack):
        """Webhook do Slack quando humano clica"""
        acao, aprovacao_id = action_value.split("_", 1)
        status = "aprovado" if acao == "aprovar" else "reprovado"
        
        self.db.update("aprovacoes_slack", aprovacao_id, {
            "status": status,
            "decidido_por": usuario_slack,
            "decidido_ts": datetime.now().isoformat()
        })
        
        if status == "aprovado":
            # Executa ação que estava pendente
            aprovacao = self.db.get("aprovacoes_slack", {"id": aprovacao_id})
            return self.executar_acao_aprovada(aprovacao["payload"])
        
        return {"status": status}
    
    # ===== 5. INTEGRAÇÃO LEONARDO =====
    def gerar_criativo_com_guard(self, brief, pais):
        """Gera arte com prompt_guard"""
        from prompt_guard import prompt_guard
        prompt_seguro = prompt_guard(brief, pais)
        
        r = requests.post(
            "https://cloud.leonardo.ai/api/rest/v1/generations",
            headers={"Authorization": f"Bearer {LEONARDO_KEY}"},
            json={"prompt": prompt_seguro, "num_images": 4, "width": 1080, "height": 1920}
        )
        return r.json()
    
    # ===== 6. IA DECIDE =====
    def ia_gerar_resposta(self, contexto, mensagem):
        """Sua LLM decide - simplificado"""
        texto_in = mensagem.get("text", "")
        
        # Regras de negócio
        if "preço" in texto_in.lower():
            return {"texto": f"Implante a partir de R$ {contexto['ticket_medio']}. Quer agendar?", "precisa_aprovacao": False, "latencia": 1200}
        
        if "agendar" in texto_in.lower():
            return {"tipo": "agendar_consulta", "texto": "Perfeito! Qual melhor horário?", "precisa_aprovacao": False, "latencia": 800}
        
        # Valor alto precisa aprovação
        if contexto["ticket_medio"] > 5000:
            return {"tipo": "proposta_alto_valor", "custo": 0, "risco": 80, "precisa_aprovacao": True}
        
        return {"texto": "Olá! Como posso ajudar com seu sorriso hoje?", "precisa_aprovacao": False, "latencia": 900}

# Classe helper simplificada
class SupabaseClient:
    def __init__(self, url, key): self.url, self.key = url, key
    def get(self, table, filters): return {}
    def insert(self, table, data): return {"id": "uuid"}
    def update(self, table, id, data): return True
    def find_or_create_cliente(self, canal, canal_id, payload): return {"id": "uuid", "wa_id": canal_id, "nome": "Teste", "pais": "BR", "ticket_medio": 3500}
    def get_or_create_conversa(self, cliente_id, canal, canal_id): return {"id": "uuid"}
    def count_conversas_recentes(self, cliente_id): return 1
