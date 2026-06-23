# Política de Privacidade — AquariOS

> **STATUS:** RASCUNHO v0.1 (Pacote D · D0 · item #1) — PT-BR canônico.
> **Próximo passo:** o fundador submete este documento à Meta AI **item a item** (seção por seção), contra a *WhatsApp Business Messaging Policy*, os *Platform Terms* e as *Health/Wellness restrictions*. Correções voltam para cá antes do espelho em EN (exigido por EUA/Nigéria na Onda 1).
> **Vigência:** [A DEFINIR após aprovação] · **Última atualização:** 10/06/2026

---

## ⚠️ PLACEHOLDERS A PREENCHER (antes de publicar)

Estes campos exigem dado real do fundador ou parecer jurídico — **não foram inventados**:

| Campo | Onde aparece | Status |
|---|---|---|
| CNPJ da controladora | §1 | ✅ preenchido (41.191.506/0001-02) |
| Endereço sede | §1 | ✅ preenchido |
| Encarregado/DPO (nome + e-mail) | §1, §19 | `[DPO: ________]` — pendente: confirmar contador como encarregado |
| Períodos exatos de retenção | §10 | `[A CONFIRMAR juridicamente]` |
| Parecer OFAC (Irã) | §17 | bloqueante para release IR |
| Idade mínima por país (pisos legais) | §15 + Anexo A | default 18; pisos `[A VALIDAR]` |
| Registro/representante local (UE, NG, KR) | Anexo A | `[A VALIDAR]` |

---

## 1. Quem somos (controlador dos dados)

A plataforma **AquariOS** e seus agentes (**ProteOS**, **HygeiOS**, **CerberOS**, **PanaceIA**, **SandeirOS**) são operados por:

- **Razão social:** CARVALHO & LEITE GESTORA DE RECURSOS LIMITADA
- **CNPJ:** 41.191.506/0001-02
- **Endereço:** Rua Adriano Chaves e Matos, 486 — Belo Horizonte/MG — CEP 30390-552
- **E-mail de privacidade:** contato@podiumtec.com.br
- **Encarregado pelo Tratamento de Dados (DPO):** `[DPO: ________]`

Para os fins da legislação aplicável (LGPD, GDPR, CCPA/CPRA e equivalentes — ver Anexo A), atuamos como **controlador** dos dados pessoais tratados na plataforma.

---

## 2. O que o AquariOS é — e o que NÃO é

**AquariOS é uma plataforma de bem-estar integral (lifestyle).** Oferece acompanhamento de hábitos, reflexão, comunidades de apoio e o índice **iVi** (Índice de Vitalidade integral, composto pelas dimensões Físico, Mental, Espiritual e Social).

> **AquariOS NÃO é um serviço médico.** Não fornece diagnóstico, tratamento, prescrição ou aconselhamento médico, psicológico ou psiquiátrico. As informações e interações têm finalidade de bem-estar e autoconhecimento, e **não substituem** a avaliação de um profissional de saúde habilitado. Em situação de emergência, procure atendimento médico ou os serviços de urgência da sua região.

Essa distinção é estrutural: define como classificamos e protegemos seus dados (ver §6) e como nos integramos a plataformas de terceiros como a Meta (ver §7 e §14).

---

## 3. Você está conversando com uma Inteligência Artificial

Parte das interações no AquariOS é conduzida por **agentes de IA**. No primeiro contato e sempre que aplicável, exibimos a declaração:

> *"Você está conversando com o ProteOS, agente de Inteligência Artificial do AquariOS."*

A IA processa o que você escreve ou fala para gerar respostas de bem-estar. Ela **não toma decisões médicas** e, quando detecta conteúdo sensível ou de risco, encaminha para orientação humana ou para canais de ajuda apropriados. Os modelos de IA utilizados estão listados como operadores em §7.

---

## 4. Dados que coletamos

Coletamos apenas o necessário para a finalidade declarada (princípio da minimização):

**a) Dados de cadastro e identificação**
- Nome ou apelido, e-mail, idioma/país, e — quando você opta pelo canal WhatsApp/Meta — número de telefone.

**b) Dados de uso e bem-estar** *(ver salvaguardas em §6)*
- Respostas a questionários, registros do Diário do Ser, humor, hábitos, e o índice **iVi** (Físico/Mental/Espiritual/Social).

**c) Dados de comunicação**
- Mensagens trocadas com os agentes de IA e com canais Meta (WhatsApp, Instagram, Messenger), incluindo áudio quando você usa a voz.

**d) Dados de consentimento (opt-in)**
- Texto exato do consentimento exibido, versão, data/hora (UTC), endereço IP, origem (página/anúncio) e idioma — guardados como **prova de opt-in** (ver §18).

**e) Dados técnicos**
- Tipo de dispositivo, sistema operacional, identificadores do app, endereço IP, e dados de interação do widget (cliques, UTMs).

**f) Dados de pagamento**
- Processados **diretamente pelos provedores de pagamento** (Stripe, Paystack). **Não armazenamos números completos de cartão** em nossos servidores.

---

## 5. Como e por que tratamos seus dados (finalidades e bases legais)

| Finalidade | Base legal (LGPD / GDPR) |
|---|---|
| Criar e manter sua conta; prestar o serviço | Execução de contrato (LGPD art. 7º, V / GDPR 6(1)(b)) |
| Gerar o iVi e o acompanhamento de bem-estar | Consentimento (LGPD art. 7º, I; art. 11 / GDPR 6(1)(a)) |
| Enviar mensagens de marketing no WhatsApp/Meta | Consentimento explícito (opt-in — §18) |
| Segurança, prevenção a fraude e auditoria | Legítimo interesse / cumprimento legal |
| Melhorar o produto (dados agregados/anonimizados) | Legítimo interesse |

Você pode **revogar o consentimento a qualquer momento** (ver §11), sem prejuízo das finalidades baseadas em contrato ou obrigação legal.

---

## 6. Dados de bem-estar — tratamento especial e a regra do Pixel

Os dados da seção 4(b) refletem aspectos pessoais sensíveis do seu bem-estar. Embora **não sejam dados de saúde no sentido médico** (não há diagnóstico nem tratamento), nós os tratamos com salvaguardas reforçadas:

- **Criptografia ponta a ponta (AES-256-GCM)** dos registros sensíveis;
- **Isolamento por usuário** via Row-Level Security (RLS) — você só acessa os seus dados;
- **Registro de auditoria** de acessos (audit_logs);
- Defesa em camadas do agente **CerberOS**.

> **Regra firme — nunca enviamos dados de bem-estar à Meta.** Dados das dimensões iVi, humor, diário e conteúdo de conversas de bem-estar **não são enviados ao Meta Pixel, à Conversions API (CAPI) nem a qualquer ferramenta de publicidade**. Para a Meta, transmitimos somente eventos não sensíveis e categorizados como *lifestyle* (ex.: visualização de página, lead, compra) — nunca sintomas, diagnósticos ou conteúdo de bem-estar.

---

## 7. Com quem compartilhamos (operadores e sub-processadores)

Compartilhamos dados apenas com operadores que nos prestam serviço, sob contrato e instrução:

| Operador | Finalidade | Local |
|---|---|---|
| **Supabase** | Banco de dados e autenticação | Nuvem (ver §9 — transferência internacional) |
| **Oracle Cloud** | Infraestrutura da API (api.podiumtec.com.br) | São Paulo, BR |
| **Anthropic (Claude)** | Modelos de IA do ProteOS | EUA |
| **ElevenLabs** | Voz (transcrição e síntese de fala) | EUA |
| **Meta Platforms** | Canais WhatsApp / Instagram / Messenger | Global |
| **Stripe** | Pagamentos (maioria dos países) | Global |
| **Paystack** | Pagamentos (Nigéria) | Nigéria / Global |

Não vendemos seus dados pessoais. Uma lista atualizada de sub-processadores pode ser solicitada em contato@podiumtec.com.br.

---

## 8. Inteligência Artificial — como seus dados alimentam a IA

Quando você interage com um agente de IA, o conteúdo da sua mensagem é enviado ao provedor de modelo (§7) para gerar a resposta. Diretrizes:

- Não usamos suas conversas privadas para treinar modelos de terceiros sem base legal e aviso;
- A IA opera com guardas de conteúdo que **bloqueiam linguagem de diagnóstico/tratamento** e termos médicos, encaminhando a interação para orientação humana quando necessário;
- A IA é uma ferramenta de bem-estar — **decisões sobre sua saúde são suas e do seu médico**, não da IA.

---

## 9. Transferências internacionais de dados

Parte da infraestrutura (operadores em §7) está fora do Brasil e do seu país. Quando transferimos dados internacionalmente, adotamos salvaguardas exigidas pela legislação aplicável — por exemplo, **cláusulas contratuais padrão (SCCs)**, decisões de adequação ou seu consentimento informado, conforme o regime (LGPD art. 33; GDPR Cap. V). `[Salvaguardas específicas por operador: A CONFIRMAR juridicamente]`.

---

## 10. Por quanto tempo guardamos

| Categoria | Período |
|---|---|
| Dados de conta | Enquanto a conta estiver ativa + `[período: A CONFIRMAR]` após o encerramento |
| Dados de bem-estar (iVi, diário) | Até você excluí-los ou encerrar a conta (ver §12) |
| Prova de opt-in (§18) | Pelo prazo prescricional da lei aplicável `[A CONFIRMAR juridicamente]` |
| Logs técnicos e de auditoria | `[período: A CONFIRMAR]`, para segurança e cumprimento legal |

Os períodos exatos serão fixados por país no Anexo A após parecer jurídico — **não adotamos números genéricos sem base legal.**

---

## 11. Seus direitos

Conforme o regime aplicável (Anexo A), você pode:

- **Confirmar** a existência de tratamento e **acessar** seus dados;
- **Corrigir** dados incompletos ou desatualizados;
- **Excluir** ou **anonimizar** dados (ver §12);
- **Portar** seus dados a outro fornecedor;
- **Revogar o consentimento** e **opor-se** a tratamentos;
- **Não receber** marketing (opt-out), a qualquer momento.

Para exercer, escreva para **contato@podiumtec.com.br**. Respondemos nos prazos legais (ex.: LGPD — em regra 15 dias; GDPR — 1 mês). Você também pode reclamar à autoridade de controle do seu país (Anexo A).

---

## 12. Exclusão de dados

Você pode solicitar a exclusão dos seus dados:

- No aplicativo, nas configurações de conta; ou
- Pelo endpoint público de exclusão: **https://api.podiumtec.com.br/delete-data**; ou
- Por e-mail: contato@podiumtec.com.br.

O detalhamento do fluxo e dos prazos está na **Política de Exclusão de Dados** (documento irmão — Pacote D, item #3).

---

## 13. Segurança da informação

Adotamos medidas técnicas e organizacionais proporcionais ao risco:

- Criptografia em trânsito (HTTPS/TLS) e ponta a ponta (AES-256-GCM) para dados sensíveis;
- Row-Level Security (RLS) e controle de propriedade por usuário;
- Registros de auditoria (audit_logs);
- Arquitetura de defesa em camadas (CerberOS).

Nenhum sistema é 100% inviolável; em caso de incidente de segurança relevante, **notificaremos** você e a autoridade competente nos termos da lei.

---

## 14. Cookies, widget e rastreamento

No site e no widget **Click-to-WhatsApp**, podemos registrar cliques, origem (referrer) e parâmetros de campanha (UTMs) para medir resultados. Reforçando §6: **nenhum dado de bem-estar é enviado a ferramentas de publicidade**. Eventos enviados à Meta restringem-se a categorias *lifestyle* não sensíveis.

---

## 15. Menores de idade

O AquariOS é destinado a maiores de **18 anos** por padrão. Onde a lei local permitir uso por adolescentes com idade de consentimento digital inferior, exigiremos consentimento dos pais/responsáveis na forma da lei. Os pisos legais por país estão no Anexo A `[A VALIDAR]`. Não coletamos intencionalmente dados de crianças abaixo da idade mínima; se identificarmos, excluímos.

---

## 16. Comunicações de marketing (WhatsApp/Meta)

Só enviamos mensagens de marketing no WhatsApp/Meta a quem deu **opt-in explícito** (§18). Cada mensagem permite **descadastro (opt-out)**. O consentimento de marketing é **separado** do consentimento de uso do serviço — recusar um não impede o outro.

---

## 17. Disponibilidade do serviço e sanções (OFAC / Irã)

A disponibilidade do AquariOS em determinados territórios está sujeita a leis de sanções econômicas e controles de exportação. **No Irã, o serviço, quando ofertado, observará restrições aplicáveis** e dependerá de parecer jurídico específico antes de qualquer lançamento.

> **Nota interna (não publicar — pauta para o advogado de sanções):**
> 1. Pode uma sociedade brasileira ofertar app de bem-estar a usuários no Irã via app-stores locais clearnet (Cafe Bazaar / Myket / Aparat) sem violar OFAC, dado que a infraestrutura inclui operadores nos EUA (Anthropic, ElevenLabs, Supabase)?
> 2. O modelo **free tier** (sem cobrança, sem trilho de pagamento US) reduz a exposição? Há licença geral (general license) aplicável a software de comunicação/bem-estar?
> 3. Que segregação técnica (não usar operadores US para tráfego IR) seria exigida?
> 4. Obrigações de *screening* de usuários e de geolocalização.
> → **Gate absoluto:** nenhum release para o Irã antes deste parecer.

---

## 18. Prova de consentimento (opt-in)

Ao marcar a caixa de consentimento, registramos como prova auditável:

- número de telefone (formato E.164);
- texto **exato** exibido (ex.: *"Concordo em receber mensagens de marketing do AquariOS no WhatsApp"*);
- versão do texto, data/hora (UTC), endereço IP, origem e idioma.

Esses registros comprovam, perante autoridades e plataformas, que o consentimento foi livre, informado e inequívoco.

---

## 19. Contato e autoridade de controle

- **Privacidade / DPO:** contato@podiumtec.com.br · `[DPO: ________]`
- **Autoridade de controle:** a do seu país (Anexo A). No Brasil: **ANPD** (gov.br/anpd).

---

## 20. Alterações desta Política

Podemos atualizar esta Política. Mudanças relevantes serão comunicadas no app e/ou por e-mail, com nova data de vigência. O uso continuado após a vigência implica ciência da versão atualizada.

---

# Anexo A — Adendos por país (regime de privacidade)

> **Onda 1** (BR, EUA, Portugal, Nigéria, Peru, Venezuela-free) detalhada abaixo. Demais ondas: arcabouço marcado para detalhamento na onda correspondente. Fonte dos regimes: `COUNTRY_MATRIX.md`.

### 🇧🇷 Brasil — LGPD (Lei 13.709/2018) · Onda 1
- Autoridade: **ANPD**. Bases legais: art. 7º e art. 11 (dados sensíveis).
- Direitos: art. 18. Encarregado (DPO) indicado em §1.
- Idade: tratamento de dados de crianças/adolescentes com melhor interesse e consentimento parental quando aplicável `[A VALIDAR]`.

### 🇺🇸 Estados Unidos — CCPA/CPRA · Onda 1
- Direitos: saber, excluir, corrigir, **opt-out** de "venda/compartilhamento" (não vendemos — §7).
- Menores: opt-in para menores de 16; consentimento parental abaixo de 13 `[A VALIDAR]`.
- Link "Do Not Sell or Share My Personal Information" se/quando aplicável.

### 🇵🇹 Portugal — GDPR (UE) · Onda 1
- Autoridade: **CNPD**. Bases: art. 6 e art. 9. Direitos: art. 15–22.
- Transferências fora da UE: salvaguardas do Cap. V (SCCs) — §9.
- Idade de consentimento digital em PT: `[A VALIDAR — tipicamente 13]`. Representante na UE: `[A VALIDAR]`.

### 🇳🇬 Nigéria — NDPA (2023) · Onda 1
- Autoridade: **NDPC**. Pagamento via **Paystack** (§7).
- Possível exigência de registro/representante local `[A VALIDAR]`.

### 🇵🇪 Peru — Ley 29733 · Onda 1
- Autoridade: **ANPD/Peru (MINJUS)**. Consentimento prévio e informado.

### 🇻🇪 Venezuela — sem regime dedicado · Onda 1 (somente *free tier*)
- Sem cobrança (sem gateway viável). Tratamento conforme princípios gerais desta Política `[A VALIDAR]`.

---

### Ondas seguintes — arcabouço (detalhar na abertura de cada onda)

| País | Regime | Onda | Nota |
|---|---|---|---|
| 🇳🇴 Noruega | GDPR (EEA) | 2 | Igual a §GDPR + Datatilsynet |
| 🇨🇭 Suíça | nFADP | 2 | Autoridade FDPIC; adequação UE |
| 🇹🇭 Tailândia | PDPA | 3 | Consentimento explícito; PDPC-TH |
| 🇰🇷 Coreia do Sul | PIPA | 3 | Regras rígidas; possível representante local `[A VALIDAR]` |
| 🇭🇰/🇸🇬 HK / Singapura | PDPO / PDPA | 3 | Dois regimes distintos |
| 🇮🇱 Israel | PPL | 4 | Privacy Protection Law |
| 🇮🇷 Irã | — (sanções) | 4 | Condicionado a §17 (parecer OFAC) |

---

*Documento gerado como rascunho técnico-jurídico para revisão. Não constitui aconselhamento jurídico. Antes da publicação, exige revisão da Meta AI (conformidade de plataforma) e de advogado habilitado (validade legal por jurisdição).*
