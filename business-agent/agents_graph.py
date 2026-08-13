"""
business-agent/agents_graph.py
Orquestração multiagente do ProteOS via LangGraph — loop de tool-calling
entre "agentes" (hoje: 1 modelo + 1 ferramenta + 1 gate de autorização +
1 guarda de saída).

Contexto (ver conversa anterior): o AquariOS já tinha nomes reservados para
uma arquitetura multiagente (ProteOS, AsclepiOS, CerberOS, SandeirOS...),
mas nenhuma orquestração real — era 1 chamada Claude cercada de heurísticas
determinísticas em TypeScript, cada uma no seu arquivo, sem loop de agente.
Este arquivo é o primeiro pedaço real dessa orquestração, em Python, porque
é aqui (business-agent) que já existe produção rodando (WhatsApp).

Mapeamento do que existia → o que isso substitui/porta:
  mobile/services/alexandrios.ts (searchKB)     → tool `search_faq` abaixo
  mobile/services/asclepiOS.ts   (auditOutput)  → nó `audit` abaixo
                                                    (autorização "essa tool
                                                    pode ser chamada?")
  mobile/hooks/useIntentRouter.ts (heurística
    de Math.random() fingindo "system load")    → NÃO portado (era simulado,
                                                    não uma decisão real —
                                                    o roteamento aqui é feito
                                                    pelo próprio modelo via
                                                    tool-calling)
  services/cerberos.ts (7 camadas, placeholder) → nó `cerberos_gate` abaixo.
    Continua NÃO sendo uma defesa de 7 camadas — é um escopo menor e real:
    bloqueia a chamada de qualquer tool cujo módulo não esteja `active` em
    shared/os_registry.json. É AUTORIZAÇÃO DE MÓDULO (roda ANTES da tool
    executar), diferente do `audit` (que é SEGURANÇA DE CONTEÚDO e roda
    DEPOIS que o modelo responde). Os dois são complementares, não a
    mesma coisa.

Uso:
    from agents_graph import reply
    texto = reply(thread_id=wa_hash, user_message="...", lang="pt")

Requer: pip install langgraph langchain-anthropic (ver requirements.txt)
Env: ANTHROPIC_API_KEY (mesma variável usada em main.py)
"""
import json
import logging
import os
import pathlib
import re
from typing import Optional

from langchain_anthropic import ChatAnthropic
from langchain_core.messages import SystemMessage, ToolMessage
from langchain_core.tools import tool
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import END, StateGraph
from langgraph.graph.message import MessagesState
from langgraph.prebuilt import ToolNode

logger = logging.getLogger("cl.agents_graph")

from prompts import PROTEOS_PROMPT

MODEL_ID = "claude-haiku-4-5-20251001"

# PROTEOS_PROMPT vem de prompts.py — mesma fonte usada por main.py.
# Aqui só adicionamos a seção de ferramentas, específica deste grafo.
SYSTEM_PROMPT = PROTEOS_PROMPT + """

## Ferramentas
Use `search_faq` quando a pergunta for sobre acesso a serviços de saúde, SUS, prevenção ou temas cobertos na base de conhecimento AlexandriOS — não invente respostas sobre isso. Para bem-estar geral, converse normalmente sem forçar o uso da ferramenta."""

# ── Ferramenta 1: AlexandriOS — busca na base de FAQs (porta de alexandrios.ts) ─
_FAQS_PATH = pathlib.Path(__file__).resolve().parent.parent / "mobile" / "config" / "faqs.json"
_faq_cache: Optional[list[dict]] = None


def _load_faqs() -> list[dict]:
    global _faq_cache
    if _faq_cache is None:
        try:
            data = json.loads(_FAQS_PATH.read_text(encoding="utf-8"))
            _faq_cache = data.get("faqs", [])
        except Exception as exc:
            logger.error("faqs.json não carregado (%s): %s", _FAQS_PATH, exc)
            _faq_cache = []
    return _faq_cache


@tool
def search_faq(query: str) -> str:
    """Busca na base de conhecimento AlexandriOS (SUS, prevenção, acesso a saúde).
    Use para perguntas factuais sobre como acessar serviços — não para conversa geral."""
    q = query.lower()
    hits = [
        f for f in _load_faqs()
        if q in f.get("question", "").lower() or q in f.get("answer", "").lower()
    ][:3]
    if not hits:
        return "Nada encontrado na base de FAQs para essa busca."
    return "\n\n".join(f"P: {f['question']}\nR: {f['answer']}" for f in hits)


TOOLS = [search_faq]

# ── CerberOS Gate — autorização de módulo (shared/os_registry.json) ─────────
# Roda ANTES da tool executar. Não é o mesmo registry de UI de
# mobile/config/modules-registry.ts (aquele descreve visibilidade de card
# pro usuário); este descreve se existe lógica de backend real invocável
# por um agente. Fail-closed: se QUALQUER tool_call da rodada não estiver
# `active` no registry, a rodada inteira é bloqueada (nenhuma tool roda) e
# o modelo recebe de volta uma explicação em vez do resultado da tool.
_REGISTRY_PATH = pathlib.Path(__file__).resolve().parent.parent / "shared" / "os_registry.json"
_registry_cache: Optional[dict] = None


def _load_registry() -> dict:
    global _registry_cache
    if _registry_cache is None:
        try:
            data = json.loads(_REGISTRY_PATH.read_text(encoding="utf-8"))
            _registry_cache = data.get("modules", {})
        except Exception as exc:
            logger.error("os_registry.json não carregado (%s): %s", _REGISTRY_PATH, exc)
            _registry_cache = {}
    return _registry_cache


def _module_status(tool_name: str) -> str:
    """Status de autorização para uma tool. Módulo ausente do registry é
    tratado como 'coming_soon' (fail-closed) — nunca assume 'active' por
    omissão."""
    return _load_registry().get(tool_name, {}).get("status", "coming_soon")


# ── Nó de auditoria — porta de asclepiOS.ts (BANNED_PHRASES) ────────────────
# Roda DEPOIS do modelo responder, nunca antes. "Lei do silêncio": se
# reprova, o graph não tenta reescrever sozinho (isso exigiria reabrir o
# prefixo do system prompt, o que quebraria o cache) — devolve uma resposta
# segura fixa e loga o motivo para revisão humana.
_BANNED_PHRASES = [
    "milagre", "cura garantida", "100% seguro", "não precisa de médico",
    "remédio caseiro cura", "sem efeito colateral", "ignore o que médico diz",
]
_SAFE_FALLBACK = "Não consegui formular uma resposta segura para isso agora. Um especialista pode te ajudar melhor — quer que eu te direcione?"


def _audit_passes(text: str) -> bool:
    lower = text.lower()
    return not any(re.search(rf"\b{re.escape(p)}\b", lower) for p in _BANNED_PHRASES)


# ── Grafo ─────────────────────────────────────────────────────────────────
class State(MessagesState):
    pass


def _call_model(state: State):
    llm = ChatAnthropic(model=MODEL_ID, max_tokens=512).bind_tools(TOOLS)
    # cache_control no system: mesmo caveat do main.py — claude-haiku-4-5
    # exige ~4096 tokens de prefixo mínimo, então o ganho real aparece
    # conforme o histórico da thread cresce (o checkpointer abaixo é quem
    # faz esse histórico persistir entre mensagens).
    system = SystemMessage(content=[{
        "type": "text",
        "text": SYSTEM_PROMPT,
        "cache_control": {"type": "ephemeral"},
    }])
    response = llm.invoke([system, *state["messages"]])
    return {"messages": [response]}


def _audit(state: State):
    last = state["messages"][-1]
    if not _audit_passes(last.content):
        logger.warning("AsclepiOS audit reprovou uma resposta — substituindo por fallback seguro")
        last.content = _SAFE_FALLBACK
    return {"messages": []}


def _cerberos_gate(state: State):
    last = state["messages"][-1]
    tool_calls = getattr(last, "tool_calls", None) or []

    blocked = [c for c in tool_calls if _module_status(c["name"]) != "active"]
    if not blocked:
        return {}  # nada bloqueado — no-op, roteamento manda pra "tools"

    blocked_names = {c["name"] for c in blocked}
    logger.warning("CerberOS bloqueou tool_calls não autorizadas: %s", blocked_names)

    # Fail-closed: gera ToolMessage pra CADA tool_call da rodada (não só a
    # bloqueada) — o protocolo de tool-calling exige uma resposta por
    # tool_use_id antes do modelo poder responder de novo.
    results = []
    for call in tool_calls:
        if call["name"] in blocked_names:
            mod = _load_registry().get(call["name"], {})
            nome = mod.get("display_name", call["name"])
            content = f"[CerberOS] Módulo '{nome}' está em construção (coming_soon) e não pode ser chamado ainda."
        else:
            content = "[CerberOS] Chamada não executada: outra tool na mesma rodada foi bloqueada."
        results.append(ToolMessage(content=content, tool_call_id=call["id"]))

    return {"messages": results}


def _route_after_agent(state: State) -> str:
    last = state["messages"][-1]
    if getattr(last, "tool_calls", None):
        return "cerberos_gate"
    return "audit"


def _route_after_gate(state: State) -> str:
    # Se o gate acabou de anexar ToolMessages (bloqueio), a última mensagem
    # deixa de ser o AIMessage com tool_calls — volta pro modelo responder
    # em linguagem natural. Se não bloqueou nada (no-op), a última mensagem
    # continua sendo o AIMessage original — segue pra execução real.
    return "agent" if isinstance(state["messages"][-1], ToolMessage) else "tools"


def build_graph(checkpointer=None):
    graph = StateGraph(State)
    graph.add_node("agent", _call_model)
    graph.add_node("cerberos_gate", _cerberos_gate)
    graph.add_node("tools", ToolNode(TOOLS))
    graph.add_node("audit", _audit)

    graph.set_entry_point("agent")
    # agent -> tem tool_calls? cerberos_gate autoriza antes de qualquer
    # execução; sem tool_calls, vai direto pro audit de saída.
    graph.add_conditional_edges("agent", _route_after_agent, {"cerberos_gate": "cerberos_gate", "audit": "audit"})
    graph.add_conditional_edges("cerberos_gate", _route_after_gate, {"tools": "tools", "agent": "agent"})
    graph.add_edge("tools", "agent")  # resultado da ferramenta volta pro modelo
    graph.add_edge("audit", END)

    return graph.compile(checkpointer=checkpointer or MemorySaver())


# Compilado uma vez, reaproveitado entre requests (como o client em main.py).
# MemorySaver = memória em processo (some no restart). Para persistir de
# verdade entre deploys, trocar por um checkpointer Postgres apontando pro
# mesmo Supabase já usado no resto do projeto (ver observação no chat).
_graph = None


def _get_graph():
    global _graph
    if _graph is None:
        _graph = build_graph()
    return _graph


def reply(thread_id: str, user_message: str, lang: str = "pt") -> str:
    """Ponto de entrada único: thread_id = identificador estável da conversa
    (ex.: wa_hash do whatsapp_voice_bridge.py). O checkpointer do LangGraph
    usa isso para lembrar o histórico entre mensagens — hoje o
    proteos_reply() de main.py NÃO tem essa memória; esta função resolve
    isso como efeito colateral de usar LangGraph."""
    result = _get_graph().invoke(
        {"messages": [{"role": "user", "content": user_message}]},
        config={"configurable": {"thread_id": thread_id}},
    )
    return result["messages"][-1].content
