import hashlib, logging
from langgraph.graph import StateGraph, END
from config import TABELA_PRECOS, TKN_LIMITE_HAIKU, TKN_USD_RATE
from agents import classificar, preparar_escopo, haiku_call, sonnet_call

def build_workflow(cache, ledger, maze):
    def node_cache(state):
        res = cache.buscar(state["pergunta"])
        if res:
            resposta, ch, bh = res
            return {"resposta_final": resposta, "encontrado_cache": True, "metricas": {**state["metricas"], "origem": "cache", "tokens_poupados": 500}}
        return {"encontrado_cache": False}
    def node_balance(state): return {"saldo_tkn": ledger.get_balance(state.get("user_id", "test_user"))}
    def node_classify(state): return {"categoria": classificar(state["pergunta"])}
    def node_haiku(state):
        out = haiku_call(preparar_escopo(state["pergunta"]))
        custo = (out["tokens_in"] * TABELA_PRECOS["subagente_input"] + out["tokens_out"] * TABELA_PRECOS["subagente_output"]) * TKN_USD_RATE
        ch = hashlib.sha256(out["resposta"].encode()).hexdigest()
        bh = ledger.send_tkn(state.get("user_id","test_user"), "subagente", custo, ch)
        cache.salvar(state["pergunta"], state["categoria"], out["resposta"], ch, bh)
        maze.add(state["pergunta"], out["resposta"])
        return {"resposta_final": out["resposta"], "valor_usd": custo, "metricas": {**state["metricas"], "origem": "haiku"}}
    def node_sonnet(state):
        out = sonnet_call(preparar_escopo(state["pergunta"]))
        custo = (out["tokens_in"] * TABELA_PRECOS["cerebro_input"] + out["tokens_out"] * TABELA_PRECOS["cerebro_output"]) * TKN_USD_RATE
        ch = hashlib.sha256(out["resposta"].encode()).hexdigest()
        bh = ledger.send_tkn(state.get("user_id","test_user"), "cerebro", custo, ch)
        cache.salvar(state["pergunta"], state["categoria"], out["resposta"], ch, bh)
        maze.add(state["pergunta"], out["resposta"])
        return {"resposta_final": out["resposta"], "valor_usd": custo, "metricas": {**state["metricas"], "origem": "sonnet"}}
    def node_maze(state):
        resp = maze.buscar(state["pergunta"])
        return {"resposta_final": resp or "Sem saldo", "metricas": {**state["metricas"], "origem": "maze"}}

    g = StateGraph(dict)
    for n,v in [("cache",node_cache),("balance",node_balance),("classify",node_classify),("haiku",node_haiku),("sonnet",node_sonnet),("maze",node_maze)]: g.add_node(n,v)
    g.set_entry_point("cache")
    g.add_conditional_edges("cache", lambda s: "END" if s.get("encontrado_cache") else "balance", {"END": END, "balance":"balance"})
    g.add_conditional_edges("balance", lambda s: "maze" if s.get("saldo_tkn",0) < TKN_LIMITE_HAIKU else "classify", {"maze":"maze","classify":"classify"})
    g.add_conditional_edges("classify", lambda s: "haiku" if s.get("categoria")=="simples" else "sonnet", {"haiku":"haiku","sonnet":"sonnet"})
    for n in ["haiku","sonnet","maze"]: g.add_edge(n, END)
    return g.compile()
