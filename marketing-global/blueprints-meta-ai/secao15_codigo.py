
def atualizar_roas_offline(self, cliente_id, valor_compra, moeda="BRL"):
    """
    Envia conversão offline para Meta Conversions API
    Fecha o loop: atendimento na clínica → ROAS real
    """
    import hashlib, requests
    
    cliente = self.db.get("clientes", {"id": cliente_id})
    
    # Hash de dados para matching (Meta exige)
    email_hash = hashlib.sha256(cliente["email"].encode()).hexdigest() if cliente.get("email") else None
    phone_hash = hashlib.sha256(cliente["wa_id"].encode()).hexdigest() if cliente.get("wa_id") else None
    
    payload = {
        "data": [{
            "event_name": "Purchase",
            "event_time": int(time.time()),
            "action_source": "physical_store",
            "user_data": {
                "em": [email_hash] if email_hash else [],
                "ph": [phone_hash] if phone_hash else [],
                "country": [hashlib.sha256(cliente["pais"].encode()).hexdigest()]
            },
            "custom_data": {
                "currency": moeda,
                "value": float(valor_compra),
                "content_category": "saude_integral"
            }
        }]
    }
    
    url = f"https://graph.facebook.com/v21.0/{os.getenv('PIXEL_ID')}/events?access_token={os.getenv('META_TOKEN')}"
    r = requests.post(url, json=payload)
    
    # Atualiza LTV no CRM
    novo_ltv = float(cliente["lifetime_value"] or 0) + float(valor_compra)
    self.db.update("clientes", cliente_id, {"lifetime_value": novo_ltv})
    
    # Atualiza campanha
    self.db.query("""
        UPDATE campanhas SET 
        enviados = enviados + 1,
        ctr = (cliques::float / NULLIF(enviados,0) * 100)
        WHERE id IN (SELECT campanha_id FROM meta_signals WHERE cliente_id = %s)
    """, (cliente_id,))
    
    return {"enviado_meta": r.status_code == 200, "ltv_atual": novo_ltv}



def brand_guardian(prompt, pais, asset_type="image"):
    """
    Valida criativo antes de enviar para Leonardo/Meta
    """
    score = 100
    issues = []
    
    # 1. Checagem cultural
    if pais in ['CH','NO','DE'] and any(w in prompt.lower() for w in ['espiritual','milagre','cura']):
        score -= 30
        issues.append("Termo espiritual não permitido em mercado nórdico")
        prompt = prompt.replace("espiritual", "equilíbrio interior")
    
    # 2. Checagem paleta
    if "#FF0000" in prompt or "vermelho intenso" in prompt:
        score -= 20
        issues.append("Vermelho intenso fora da paleta AURA")
    
    # 3. Fadiga criativa (compara com últimos 50)
    similaridade = check_similaridade_historico(prompt)  # função que busca no DB
    if similaridade > 0.85:
        score -= 25
        issues.append(f"Criativo {similaridade*100:.0f}% similar ao anterior")
    
    # 4. Regras Meta saúde
    banned = ["antes e depois", "garantido", "100% eficaz"]
    for b in banned:
        if b in prompt.lower():
            score = 0
            issues.append(f"BANIDO pela Meta: {b}")
    
    return {
        "aprovado": score >= 85,
        "score": score,
        "prompt_corrigido": prompt,
        "issues": issues
    }



def modo_treino_webhook(self, payload):
    """
    Número interno +55 11 9999-TREINO
    Simula cliente difícil para treinar equipe
    """
    mensagem = payload.get("text", "").lower()
    
    cenarios = {
        "objeção preço suíça": {
            "persona": "Cliente CH 55 anos, cético, já fez 2 orçamentos",
            "resposta_ia": "Entendo. Em Zurique, implante completo varia CHF 3.500-5.000. Nossa diferença é garantia 10 anos e acompanhamento pós. Qual sua principal preocupação: preço ou durabilidade?",
            "objetivo_treino": "Treinar SDR a não dar desconto imediato"
        },
        "medo dentista brasil": {
            "persona": "Cliente BR 42 anos, trauma infância",
            "resposta_ia": "Faz todo sentido ter receio. Aqui usamos sedação consciente e você controla um botão de pausa. Quer conversar com alguém que passou pelo mesmo?",
            "objetivo_treino": "Empatia antes de técnica"
        }
    }
    
    if mensagem in cenarios:
        c = cenarios[mensagem]
        # Salva no CRM como treinamento
        self.db.insert("treinamentos", {
            "tipo": mensagem,
            "agente": payload["from"],
            "persona": c["persona"],
            "created_at": datetime.now().isoformat()
        })
        return {"modo": "treino", **c}
    
    return {"modo": "normal"}
