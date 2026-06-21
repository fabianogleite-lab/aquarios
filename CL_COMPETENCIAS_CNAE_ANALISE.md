# C&L — Competências por CNAE + Alinhamento com o AquariOS

> **Uso:** material interno / argumentação para investidores (robustez societária).
> **Disclaimer honesto:** isto é enquadramento **estratégico**, não parecer jurídico. O CNAE define o **objeto social** (o que a empresa *pode* fazer). **Operar** atividade regulada (serviços financeiros, cartões, fundos, criptoativos) exige **autorização setorial** (BACEN/CVM) **além** do CNAE. O "(Dispensada *)" no cartão = dispensa de licenciamento municipal/alvará no registro, **não** isenção da regulação setorial. Validar com advogado/contador.

## Identificação
- **Razão social:** CARVALHO & LEITE GESTORA DE RECURSOS LIMITADA
- **Nome fantasia:** C&L Gestora de Recursos
- **CNPJ:** 41.191.506/0001-02 · **Porte:** DEMAIS (não ME/EPP) · **Sede:** Belo Horizonte/MG
- **Fundador:** Fabiano Gomes Leite — cirurgião-dentista, especialista em Saúde Coletiva (CFO)

## A tese em uma frase
C&L **não é uma tech startup comum** — é uma **gestora de recursos com objeto social fintech + tech de espectro completo**. Os 10 CNAEs cobrem, no papel, toda a cadeia de valor: software, consultoria, pagamentos, cartões (crédito e débito), correspondente bancário, fundos, outros serviços financeiros, intermediação de negócios, gestão de intangíveis e cobrança/cadastro. **Para o investidor, a leitura é: escalar para cada vertical é uma etapa de licenciamento/ativação, não uma reestruturação societária. A estrutura já está montada.**

---

# PARTE A — Potencial de cada CNAE (isolado, SEM considerar o AquariOS)

### ⭐ Principal · 6619-3/02 — Correspondente de instituições financeiras
- **Habilita:** prestar serviços bancários em nome de instituições autorizadas — recebimentos, pagamentos, Pix/TED, propostas de crédito, abertura/movimentação de contas.
- **Potencial de mercado:** ser o "agente bancário"/**embedded finance** sem licença bancária plena; espinha dorsal de banking-as-a-service e distribuição de produtos financeiros.
- **Para operar:** contrato com IF autorizada + conformidade **BACEN (Res. CMN 4.935/2021)**.

### 6201-5/01 — Desenvolvimento de software sob encomenda
- **Habilita:** criar e vender software proprietário e sob demanda.
- **Potencial:** SaaS, B2B, white-label, licenciamento de produto.
- **Para operar:** nenhuma licença especial. É o CNAE-base da operação tech.

### 6204-0/00 — Consultoria em tecnologia da informação
- **Habilita:** serviços de consultoria, arquitetura, implantação e assessoria em TI.
- **Potencial:** receita de serviços/projetos, implantação para clientes corporativos, due diligence técnica.
- **Para operar:** nenhuma licença especial.

### 6499-9/99 — Outras atividades de serviços financeiros n.e.
- **Habilita:** bucket flexível para serviços financeiros inovadores não cobertos por código específico.
- **Potencial:** produtos fintech novos, programas de fidelidade/recompensa financeira e — **com ressalva** — atividades adjacentes a ativos virtuais.
- **Ressalva criptomoeda:** emissão/intermediação de criptoativos é regulada pela **Lei 14.478/2022 (Marco Legal dos Criptoativos)** + BACEN (prestador de serviços de ativos virtuais). **Token utilitário interno ≠ criptomoeda negociável.** Operar cripto "de verdade" exige enquadramento próprio — é o item de **maior fricção regulatória** da lista.

### 6613-4/00 — Administração de cartões de crédito
- **Habilita:** administrar programas de cartão de crédito (inclusive private label).
- **Potencial:** cartão próprio do ecossistema, co-branded, crédito ao consumidor.
- **Para operar:** regras de **arranjos/instituições de pagamento (Lei 12.865/2013 + BACEN)**.

### 6619-3/05 — Operadoras de cartões de débito
- **Habilita:** operar cartões de débito / pré-pago.
- **Potencial:** carteira (wallet) e cartão pré-pago do ecossistema, conta-pagamento.
- **Para operar:** idem (instituição de pagamento / BACEN).

### 6630-4/00 — Administração de fundos por contrato ou comissão
- **Habilita:** o **core "gestora de recursos"** — administrar fundos/carteiras de terceiros por contrato/comissão.
- **Potencial:** gestão de patrimônio, fundos temáticos (ex.: fundo de inovação/saúde), receita recorrente de comissão.
- **Para operar:** **autorização CVM** (administração de carteiras — Res. CVM 21/2021).

### 7490-1/04 — Intermediação e agenciamento de negócios em geral (exceto imobiliário)
- **Habilita:** intermediar e agenciar serviços e negócios.
- **Potencial:** marketplace, comissionamento de parcerias, geração e venda de leads, agência.
- **Para operar:** nenhuma licença especial (depende do que intermedeia).

### 7740-3/00 — Gestão de ativos intangíveis não-financeiros
- **Habilita:** deter, gerir e **licenciar propriedade intelectual** — marcas, software, patentes, know-how.
- **Potencial:** **monetizar o próprio IP** (white-label, royalties, licenciamento internacional). É o CNAE que mais **viaja** (não depende de licença financeira local) → o melhor para globalizar primeiro.
- **Para operar:** nenhuma licença especial; valoriza-se com registro de marcas/patentes (INPI).

### 8291-1/00 — Cobranças e informações cadastrais
- **Habilita:** serviços de cobrança e gestão de informações cadastrais/crédito.
- **Potencial:** billing recorrente, recuperação, scoring/cadastro.
- **Para operar:** **LGPD** + regras de cadastro (Lei 12.414/2011 — Cadastro Positivo) quando aplicável.

---

# PARTE B — O que JÁ está implantado no AquariOS (mapa por CNAE)

| CNAE | Atividade | Status no AquariOS | Evidência |
|---|---|---|---|
| 6201-5/01 | Software sob encomenda | ✅ **TOTAL** | app Expo, 5 agentes, backend Supabase/Oracle |
| 7740-3/00 | Gestão de intangíveis | ✅ **núcleo** | IP do AquariOS (iVi, 5 agentes, marca); registro de PI (AlexandriOS item 25) |
| 8291-1/00 | Cobrança/cadastro | ✅ **parcial** | CRM (migration 30), tiers de assinatura, business-agent |
| 6204-0/00 | Consultoria em TI | 🟡 **parcial** | case OdontolarPlus, oferta B2B/RH, white-label |
| 7490-1/04 | Intermediação de negócios | 🟡 **parcial** | marketplace PanaceIA, parcerias, motor de agência (leads via widget/Meta) |
| 6499-9/99 | Outros serv. financeiros | 🟡 **embrionário** | economia de tokens PanaceIA (token **utilitário interno**, não negociável) |
| 6619-3/02 | Correspondente bancário | ⏳ **não implantado** | base legal do **Paytime** (futuro) |
| 6613-4/00 | Cartão de crédito | ⏳ **não implantado** | futuro cartão do ecossistema |
| 6619-3/05 | Cartão de débito | ⏳ **não implantado** | futuro wallet/pré-pago |
| 6630-4/00 | Administração de fundos | ⏳ **não no app** | competência da controladora (patrimônio) |

**Resumo:** das 10 competências, **3 estão ativas** (software, intangíveis, cobrança), **3 parciais** (consultoria, intermediação, serviços financeiros embrionários) e **4 são potencial estruturado** (correspondente, 2 cartões, fundos).

---

# PARTE C — A tese "C&L não depende de terceiros" (integração vertical)

Hoje o AquariOS usa **terceiros para pagamento** (Stripe/Paystack). Mas o **objeto social da C&L já contém os CNAEs** para internalizar cada elo:

| Função hoje terceirizada | CNAE que internaliza |
|---|---|
| Cartão de crédito | 6613-4/00 |
| Cartão de débito / wallet | 6619-3/05 |
| Pagamentos / agente bancário | 6619-3/02 + 6499-9/99 |
| Cobrança / billing | 8291-1/00 |
| Gestão de patrimônio / fundos | 6630-4/00 |
| Criptomoeda / token | 6499-9/99 (+ Marco dos Criptoativos) |
| IP / ativos intangíveis | 7740-3/00 |

→ **Paytime** (provedor BR de pagamentos via **BaaS**, já contratado — setup absorvido) é o trilho que já entrega esses elos **sem a C&L virar instituição financeira**. No modelo BaaS, a C&L oferece serviços financeiros **sob a própria marca usando a licença de uma IF/IP autorizada pelo BACEN** (o próprio Paytime ou seu banco-parceiro). **Plano contratado: Business Vitalício (R$ 61.199, taxa única — sem mensalidade vitalícia).** Custo fixo recorrente = **R$ 0**. Tarifa por transação **repassada ao cliente** (neutra ao caixa). Único custo variável da C&L: **royalty de 15% sobre os ganhos** da C&L com pagamentos (o cliente **não** paga isso — sai da margem da C&L). O tier Business **destrava o stack financeiro completo, já pago e vitalício**: adquirência (cartões), banking (conta de pagamento por usuário), comissão banking, checkout POS, app personalizado e kit de contratos → os CNAEs 6613, 6619-3/05, 6619-3/02 e 8291 passam de "potencial" a "contratado e disponível". **Gatilho de internalização:** quando os 15% pagos ao Paytime superarem o custo de licença própria (≈ marco de R$ 500M/ano), vale virar IP própria.

**Esforço regulatório real (via Paytime):** para operar pagamentos por aqui, a C&L **NÃO precisa de autorização própria no BACEN** — a licença é do Paytime/parceiro. Basta **contrato + objeto social cobrindo a atividade** (cobre: 6619-3/02, 64.99) **+ PLD/compliance** previsto no contrato. Não há "registro da C&L no BACEN" para este modelo.

**Capacidades que o Paytime divulga publicamente** (confirmar escopo exato no contrato): Pix, split de pagamentos, cobrança recorrente, antecipação de recebíveis, conciliação bancária, contas/BaaS sob marca própria. *(Cartão de crédito/débito, 3DS e boleto: confirmar no contrato — a IF/IP que dá lastro não é divulgada no material público.)*

**Internalização total (opcional, marco de escala):** virar a *própria* instituição de pagamento (capital R$ 1–3M + autorização BACEN) só compensa **acima de R$ 500M/ano** — aí a C&L captura 100% da margem. **Não é passo de entrada; é meta de escala.**

**Leitura para o investidor:** a estrutura societária já permite toda a cadeia; a C&L **já opera pagamentos via Paytime a custo ~zero**; ativar licença própria é **escolha de margem no futuro, não pré-requisito**. Empresa preparada, não improvisada.

### Roadmap MVP 2 — camada financeira do PanaceIA (via Paytime)
O Paytime (paytime.com.br/api) entrega **pronto para integrar**: **BaaS** (contas digitais, boleto, PIX, TED — white-label), **Payment-as-a-Service** (split, juros ao comprador, parcelamento 18x), **KYC com biometria** (validação de identidade + checagem documental) e **segurança transacional** (3DS, antifraude, IDPay). Isso habilita um **cadastro em dois níveis**:
- **AquariOS = simplificado** (free, baixa fricção, **sem KYC** — minimização LGPD);
- **PanaceIA = completo, com KYC + conta de pagamento por usuário** (a camada financeira/comercial).

Para o investidor: **KYC e contas não são risco de engenharia** — são configuração do Paytime, roadmapadas para o MVP 2. *(Termo correto: "conta de pagamento/digital", não "conta corrente" — esta é exclusiva de banco. O KYC fica restrito à camada financeira, que é o gatilho legal de PLD.)*

---

# PARTE D — Preparação para a globalização

1. **O que globaliza primeiro:** software (6201) + **gestão de intangíveis (7740)**. Licenciar o IP do AquariOS (white-label) **não depende de licença financeira local** — é o caminho mais rápido para receita internacional.
2. **Pagamentos por país:** até o Paytime amadurecer, a estratégia multi-trilho do `COUNTRY_MATRIX` (Stripe, Paystack, etc.) cobre as Ondas 1–4.
3. **Sequência sugerida:** globalizar **produto + IP** → depois **ativar serviços financeiros por jurisdição** (cada país tem seu BACEN/CVM equivalente).

---

# PARTE E — Autoridade do fundador (notoriedade)

**Fabiano Gomes Leite — cirurgião-dentista, especialista em Saúde Coletiva (registrado no CFO).**

- **Fit fundador-mercado (forte p/ investidor):** um especialista em **Saúde Coletiva** — a ciência da saúde **populacional** — fundando uma plataforma de **bem-estar populacional** (índice iVi, Comunidades, 4 dimensões) é uma narrativa **coerente e diferenciada**. Não é um tecnólogo entrando em saúde; é um sanitarista construindo a ferramenta do seu próprio campo.
- **Autoridade como responsável pela empresa:** ✅ credencial real de saúde dá **domínio e credibilidade** no vertical.
- **Como Encarregado/DPO:** a credencial **ajuda no contexto** (lida com dado sensível de bem-estar), mas **não o qualifica como DPO** — a autoridade de DPO vem da **designação formal + competência em LGPD**. Não confundir os dois papéis.
- ⚠️ **Duas ressalvas:**
  1. **Não posicionar o app como serviço odontológico/médico** — manter o "**não médico**" da política. A credencial dá autoridade ao *fundador*, não transforma o *produto* em serviço de saúde regulado.
  2. O **CFO tem código de ética e publicidade** para cirurgiões-dentistas — cuidar de *como* "o dentista por trás" promove alegações de saúde, para não esbarrar nas regras de publicidade do conselho.

---

*Documento de enquadramento estratégico. Não constitui parecer jurídico, contábil ou regulatório. Antes de qualquer ativação de atividade financeira regulada, exige parecer de advogado/contador e a autorização setorial correspondente (BACEN/CVM).*
