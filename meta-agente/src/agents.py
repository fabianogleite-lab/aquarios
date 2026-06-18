def classificar(pergunta: str) -> str:
    complex_keywords = ["por que", "explique", "analise", "compare", "detalhe"]
    return "complexa" if len(pergunta) > 120 or any(k in pergunta.lower() for k in complex_keywords) else "simples"
def preparar_escopo(pergunta: str) -> str: return pergunta[:500]
def haiku_call(pergunta: str): return {"resposta": f"[Haiku] {pergunta}", "tokens_in": 100, "tokens_out": 150}
def sonnet_call(pergunta: str): return {"resposta": f"[Sonnet] {pergunta}", "tokens_in": 200, "tokens_out": 350}
