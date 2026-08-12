# AquariOS × Paytime — Guia de Apresentação

**Duração:** 13 minutos (8 slides + Q&A)  
**Público:** Paytime (executivos, product, comercial)  
**Objetivo:** Validar escala, modelo de integração, piloto de 90 dias

---

## PRÉ-APRESENTAÇÃO (5 MIN ANTES)

- [ ] Abra o deck PowerPoint em apresentação
- [ ] Teste áudio/vídeo do MP4 (compartilhar tela)
- [ ] Hub de navegação aberto em segundo monitor (opcional, mas recomendado)
- [ ] Garrafinha de água à mão
- [ ] Câmera/microfone testados (Zoom/Meet/Teams)

---

## ROTEIRO ANOTADO

### SLIDE 1 — Abertura (2 min)
**Imagem:** Logo AquariOS + Paytime, fundo gradiente  
**Fala:**
> "Bom dia. Temos uma proposta de escala para vocês. AquariOS é um sistema operacional da vida — saúde, dinheiro, rotina em uma conversa. Mas ele precisa de uma infraestrutura de pagamento que não restrinja, que habilite. Isso é Paytime.
>
> Em 13 minutos vocês entendem o fluxo, validam dois cases de verticalização e veem a curva de negócio. Se der match, fechamos piloto em 14 dias."

**Notas:** Deixe claro que Paytime não é fornecedor de PaaS genérico — é partner de escala.

---

### SLIDE 2 — O Problema (2 min)
**Imagem:** Split com red (problema) e cyan (solução)  
**Fala:**
> "Hoje, quando alguém quer pagar, enfrenta fragmentação. Abre a clínica, paga. Manda um alinhador, paga em outro app. Compra energia solar, paga em terceiro. São N pontos de atrito.
>
> O que queremos: um único ponto. Usuário fala 'quero pagar', no mesmo fio da conversa. Cobrança gerada. Paytime faz o roteamento automático para clínica, para parceiro, para plataforma — cada um com sua regra. Comprovante volta junto. Menos de 3 segundos."

**Notas:** Enfatize "mesmo fio da conversa" — é o diferencial. Não é mais um app de pagamento, é extensão da conversa.

---

### SLIDE 3 — O Fluxo (2 min)
**Imagem:** Diagrama com 4 boxes + Paytime como roteador  
**Fala:**
> "Quatro passos. Um: usuário fala 'quero pagar'. Dois: cobrança é gerada com contexto — sabe que é odontologia, sabe se é primeira consulta ou retorno, sabe o iVi do paciente. Três: Paytime faz o split automático. Regra parametrizada por vertical. Clínica fica com 70%, plataforma com 20%, seguro com 10% — tudo automático. Quatro: comprovante volta ao chat. Imagem, valores, data, assinatura digital."

**Notas:** Se perguntarem "e se for uma transferência entre usuários?", responda: "Paytime vai para zero em transferência peer-to-peer — só cobra quando há roteamento com split. Faz sentido?"

---

### SLIDE 4 — Verticais Validadas (2 min)
**Imagem:** Tabela com 4 verticais, cores, badges ATIVO/DEV  
**Fala:**
> "Não é lab. Odontologia está com o backend pronto e pipeline-ready para produção. Alinhadores — tratamento ortodôntico guiado por IA — entram no mesmo trilho. Custo de integração? Mais 5%. Por quê? Porque Paytime não precisa ser refeito. Parametrizamos regra por vertical.
>
> Energia solar em piloto. Saúde integrada em validação. Cada uma traz volume. Volume que cresce enquanto custo cai."

**Notas:** Se perguntarem sobre dropout de pagamento em odonto, responda: "Ainda não temos volume em produção para número — é o que o piloto vai medir. Arquitetura é inside the app, sem redirecionamento externo, o que historicamente reduz dropout."

---

### SLIDE 5 — A Curva de Negócio (2 min)
**Imagem:** Scatter plot com 2 séries: volume cresce, custo cai  
**Fala:**
> "Aqui está a tese. Volume cresce linearmente. Custo de integração cai exponencialmente. Por quê? Porque cada nova vertical não refaz nada — entra no trilho único. Muda o parametrização. Não muda a base.
>
> Primeira vertical: integração cara, volume pequeno. Rácio ruim. Terceira vertical: custo marginal próximo a zero. Rácio ótimo. Quinta? Ainda melhor. Isso só funciona se o trilho for único."

**Notas:** Este é o argumento financeiro mais importante para Paytime. Se não entenderem este slide, não entendem nada. Volte aqui quantas vezes for necessário.

---

### SLIDE 6 — iVi × Paytime (2 min)
**Imagem:** Dois boxes: esquerda (iVi dados), direita (compliance)  
**Fala:**
> "Agora vira interessante. AquariOS coleta dados de vitalidade pelo iVi — físico, mental, espiritual e social. Paytime usa isso para scoring de risco. Sabe se a pessoa tem histórico de pagamento, sabe o iVi dela, sabe se houve skip em remédio recentemente. Propensão de risco calculada.
>
> Mas — e isso é importante — Paytime não possui os dados. Não guarda. Acessa pela API de AquariOS. E qualquer decisão que Paytime toma tem explicação e direito de contestação. Revisor humano obrigatório. LGPD artigo 20. Isso é raro no mercado."

**Notas:** Se perguntarem sobre privacidade, reafirme: "AquariOS is the house, Paytime is the guest. Dados permanecem com o usuário. Paytime é middleware de inteligência, não datalake."

---

### SLIDE 7 — Piloto (2 min)
**Imagem:** Timeline com 4 steps, numeration 1-4, cada um com meta  
**Fala:**
> "Piloto de 90 dias. Passo um: ir a produção com odontologia, que já está pipeline-ready. Meta: zero bugs, 50 transações por semana. Passo dois: escalar vertical. Alinhadores entram. Custo marginal validado. Passo três: dados de modelo. iVi começa a influenciar limite de crédito, taxa, parcelamento. Medimos impacto. Passo quatro: decisão.
>
> Investimento e retorno esperados: vamos fechar os números junto com vocês no term sheet do piloto — não antecipo aqui para não travar a negociação."

**Notas:** Se perguntarem "quando começa?", responda: "14 dias após assinatura. Odontologia já está pipeline-ready. Alinhadores em homolog. Go-live em paralelo."

---

### SLIDE 8 — Fecho (1 min)
**Imagem:** Logo só, fundo escuro, texto destaque em cyan  
**Fala:**
> "AquariOS é o sistema operacional da vida. Paytime é a infraestrutura de pagamento que torna isso viável. Sem escala, sem volume. Com escala, sem custo proporcional.
>
> Próximo passo: reunião de 30 minutos com seu time de produto e operações. Validamos requerimentos técnicos. Se der match, assinamos NDA e vamos para o piloto."

**Notas:** Fim. Pronto para Q&A. Deixe silêncio por 2 segundos antes de "Perguntas?"

---

## INTERRUPÇÕES FREQUENTES (E COMO RESPONDER)

### "E se a transação falhar no meio do split?"
**Resposta:** "Paytime tem idempotência garantida. Se falhar no roteamento, reversivelmente. Webhook de confirma ao Paytime só depois que todos os destinos confirmam. Atomic transaction — ou tudo passa ou nada passa."

### "Vocês concorrem com Stripe/Adyen?"
**Resposta:** "Não. Stripe e Adyen são pipes. Paytime é inteligência em cima do pipe. Sabemos que é odontologia, então split é diferente de e-commerce. Sabemos o iVi da pessoa, então taxa é dinâmica. Somos complementares, não concorrentes."

### "Qual é a latência máxima?"
**Resposta:** "P95: 800ms do 'quero pagar' até 'pago'. P99: 1,2s. Sem retry. Isto porque Paytime toca cache local antes de API remota."

### "Vocês têm suporte 24/7?"
**Resposta:** "Suporte 24/5. Fins de semana: chat automático que escalona para on-call se crítico. SLA-alvo: 99.9% uptime. Histórico de odonto em produção começa com o piloto — ainda não temos track record para citar."

### "Qual é o horizonte de escalabilidade? Mil transactions/segundo?"
**Resposta:** "Hoje: 200 TX/s sem strain. Arquitectura permite 10k TX/s com mais máquinas. Roadmap: multi-region em 2027. Para o piloto, não é constraint."

---

## DEPOIS DA APRESENTAÇÃO

- [ ] Envie o deck, animatic HD, e link do hub dentro de 1 hora
- [ ] Agende reunião de follow-up com 48h de antecedência
- [ ] Leve a documentação técnica (API, webhooks, compliance) impressa para o next meeting
- [ ] Se perguntarem sobre preço, responda: "Variável por volume. Típico: 1,8-2,2%. Negociável."
- [ ] Agradeça, troque contatos, peça um referral se tiverem contato em outro vertical

---

## MÉTRICAS DE SUCESSO

✅ Entenderam a tese de escala (volume cresce, custo cai)  
✅ Viram que é real (odontologia com backend pronto, pipeline-ready)  
✅ Concordam que iVi + Paytime é diferencial  
✅ Agendaram reunião com produto + operações  
✅ Pediram NDA (sinal de interesse)

---

**Última atualização:** 12 de agosto de 2026  
**Responsável:** Fabiano Gomes Leite  
**Versão:** 1.0812
