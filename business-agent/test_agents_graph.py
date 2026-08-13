"""
business-agent/test_agents_graph.py
Testes do grafo LangGraph — sem chamar a API da Anthropic de verdade
(sem ANTHROPIC_API_KEY neste ambiente). Cobre duas camadas:

1. Unidade: `_cerberos_gate`, `_route_after_agent`, `_route_after_gate`,
   `_audit` e a tool `search_faq` (essa lê o faqs.json real) isolados,
   sem passar pelo grafo.
2. Integração do grafo com um LLM falso (`FakeLLM`, fila fixa de
   respostas) no lugar do `ChatAnthropic` real — valida que o roteamento
   entre agent/cerberos_gate/tools/audit está ligado do jeito certo,
   incluindo o caminho de bloqueio do CerberOS ponta a ponta.

Rodar: pip install -r requirements.txt pytest && pytest test_agents_graph.py -v
"""
from langchain_core.messages import AIMessage, ToolMessage

import agents_graph as ag


# ── Fake LLM: substitui ChatAnthropic sem tocar a API real ──────────────────
class FakeLLM:
    def __init__(self, responses):
        self._responses = list(responses)
        self.calls = []

    def bind_tools(self, tools):
        return self

    def invoke(self, messages):
        self.calls.append(messages)
        return self._responses.pop(0)


# ── Unidade: CerberOS gate ───────────────────────────────────────────────
def test_gate_allows_active_tool():
    ai = AIMessage(content="", tool_calls=[{"name": "search_faq", "args": {"query": "sus"}, "id": "t1"}])
    assert ag._cerberos_gate({"messages": [ai]}) == {}


def test_gate_blocks_coming_soon_tool():
    ai = AIMessage(content="", tool_calls=[{"name": "call_fitness", "args": {}, "id": "t1"}])
    result = ag._cerberos_gate({"messages": [ai]})
    msgs = result["messages"]
    assert len(msgs) == 1
    assert isinstance(msgs[0], ToolMessage)
    assert msgs[0].tool_call_id == "t1"
    assert "construção" in msgs[0].content or "coming_soon" in msgs[0].content


def test_gate_unknown_tool_fails_closed():
    """Tool que nem existe no registry -> tratada como coming_soon, não como active."""
    ai = AIMessage(content="", tool_calls=[{"name": "tool_que_nao_existe", "args": {}, "id": "t1"}])
    result = ag._cerberos_gate({"messages": [ai]})
    assert len(result["messages"]) == 1


def test_gate_blocks_whole_batch_when_one_is_blocked():
    ai = AIMessage(content="", tool_calls=[
        {"name": "search_faq", "args": {"query": "x"}, "id": "t1"},
        {"name": "call_fitness", "args": {}, "id": "t2"},
    ])
    result = ag._cerberos_gate({"messages": [ai]})
    ids = {m.tool_call_id for m in result["messages"]}
    assert ids == {"t1", "t2"}, "search_faq deveria ser bloqueado junto (fail-closed por rodada)"


# ── Unidade: roteamento ──────────────────────────────────────────────────
def test_route_after_agent_with_tool_calls():
    ai = AIMessage(content="", tool_calls=[{"name": "search_faq", "args": {}, "id": "t1"}])
    assert ag._route_after_agent({"messages": [ai]}) == "cerberos_gate"


def test_route_after_agent_without_tool_calls():
    ai = AIMessage(content="oi")
    assert ag._route_after_agent({"messages": [ai]}) == "audit"


def test_route_after_gate_allowed():
    ai = AIMessage(content="", tool_calls=[{"name": "search_faq", "args": {}, "id": "t1"}])
    assert ag._route_after_gate({"messages": [ai]}) == "tools"


def test_route_after_gate_blocked():
    ai = AIMessage(content="", tool_calls=[{"name": "call_fitness", "args": {}, "id": "t1"}])
    blocked_msg = ToolMessage(content="bloqueado", tool_call_id="t1")
    assert ag._route_after_gate({"messages": [ai, blocked_msg]}) == "agent"


# ── Unidade: tool real e audit ────────────────────────────────────────────
def test_search_faq_reads_real_faqs_json():
    out = ag.search_faq.invoke({"query": "SUS"})
    assert "SUS" in out


def test_search_faq_no_match():
    out = ag.search_faq.invoke({"query": "xablauzinho inexistente 123"})
    assert "Nada encontrado" in out


def test_audit_replaces_banned_phrase():
    msg = AIMessage(content="Isso é remédio caseiro cura tudo, 100% seguro.")
    ag._audit({"messages": [msg]})
    assert msg.content == ag._SAFE_FALLBACK


def test_audit_passes_clean_text():
    msg = AIMessage(content="Beber água e dormir bem ajuda bastante.")
    ag._audit({"messages": [msg]})
    assert msg.content != ag._SAFE_FALLBACK


# ── Integração: grafo completo com LLM falso ─────────────────────────────
def test_full_graph_happy_path(monkeypatch):
    """agent chama search_faq -> gate libera -> tools executa (dado real) ->
    agent responde -> audit passa -> END."""
    tool_call_msg = AIMessage(content="", tool_calls=[{"name": "search_faq", "args": {"query": "SUS"}, "id": "call_1"}])
    final_msg = AIMessage(content="Você pode agendar pelo postinho de saúde mais próximo.")
    fake = FakeLLM([tool_call_msg, final_msg])
    monkeypatch.setattr(ag, "ChatAnthropic", lambda **kw: fake)

    graph = ag.build_graph()
    result = graph.invoke(
        {"messages": [{"role": "user", "content": "como agendo consulta no SUS?"}]},
        config={"configurable": {"thread_id": "test-thread-happy"}},
    )
    assert result["messages"][-1].content == final_msg.content
    assert len(fake.calls) == 2  # 1a chamada decide a tool, 2a responde com o resultado


def test_full_graph_cerberos_blocks_end_to_end(monkeypatch):
    """agent tenta chamar uma tool hipotética 'call_fitness' (não está active
    no registry) -> CerberOS bloqueia ANTES de qualquer execução -> agent
    recebe o ToolMessage de bloqueio e responde em texto -> audit -> END."""
    blocked_call_msg = AIMessage(content="", tool_calls=[{"name": "call_fitness", "args": {}, "id": "call_1"}])
    apology_msg = AIMessage(content="Esse módulo ainda não está disponível.")
    fake = FakeLLM([blocked_call_msg, apology_msg])
    monkeypatch.setattr(ag, "ChatAnthropic", lambda **kw: fake)

    graph = ag.build_graph()
    result = graph.invoke(
        {"messages": [{"role": "user", "content": "monta um treino de fitness pra mim"}]},
        config={"configurable": {"thread_id": "test-thread-blocked"}},
    )
    assert result["messages"][-1].content == apology_msg.content

    # a 2a chamada ao "modelo" já deve ter visto o ToolMessage de bloqueio,
    # prova que o CerberOS interceptou antes do ToolNode real rodar
    second_call_messages = fake.calls[1]
    tool_msgs = [m for m in second_call_messages if isinstance(m, ToolMessage)]
    assert len(tool_msgs) == 1
    assert tool_msgs[0].tool_call_id == "call_1"
    assert "construção" in tool_msgs[0].content
