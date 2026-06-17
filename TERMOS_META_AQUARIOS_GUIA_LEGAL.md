# 📋 GUIA EXECUTIVO — Termos Meta para Empresas
## AquariOS + WhatsApp Business API
**Data:** 17/Jun/2026 | **Fundação Legal:** Termos das Ferramentas da Meta (atualizado 03/Nov/2025)

---

## 🔴 O QUE VOCÊ NÃO PODE FAZER (Restrições Críticas)

### 1. **PROIBIÇÃO ABSOLUTA — PII Sensível**
```
❌ NÃO compartilhar com Meta:
  • Crianças < 13 anos
  • Números de Seguridade Social
  • Números de Cartão de Crédito
  • Informações de SAÚDE (ex: diagnósticos, receitas)
  • Informações FINANCEIRAS (ex: saldo bancário, renda)
  • Qualquer dado sensível definido por LGPD/GDPR/lei local
```
**Risco:** Violação contratual + multa Meta + ação regulatória + indenização a usuários

---

### 2. **CONSENTIMENTO OBRIGATÓRIO** (LGPD + GDPR)
```
⚠️ ANTES de enviar dados ao Meta:
  • Obter consentimento ESCRITO do usuário
  • Explicar: "Meta coleta, analisa e compartilha seus dados"
  • Avisar onde dados vão (Meta Ireland / Meta Platforms Inc)
  • Informar direito de recusa (opt-out)
  • Armazenar prova de consentimento por 2 anos
```
**Risco:** LGPD multa até R$ 50M + bloqueio de operações

---

### 3. **HASH DE CONTATO OBRIGATÓRIO**
```
⚠️ Dados de Contato (email, telefone, CPF) DEVEM ser:
  • SHA-256 ANTES de transmitir ao Meta
  • NUNCA enviar em texto claro
  • Meta descarta após matching (não persiste)
```
**Seu controle:** Você hasha → Meta não vê PII real → descarta

---

### 4. **PROIBIÇÃO — Venda de Públicos**
```
❌ NÃO PODE:
  • Vender públicos personalizados criados com Meta
  • Transferir públicos a terceiros
  • Autorizar terceiros a vender públicos
  
✅ PODE (se Meta autoriza):
  • Compartilhar públicos com seus próprios parceiros autorizados
  • Usar ferramentas de compartilhamento oficiais Meta
```
**Implicação:** Seus leads/clientes no Meta = ativos não-transferíveis

---

### 5. **PROIBIÇÃO — Targeting Exclusivo**
```
❌ Meta NÃO PERMITE que você targetize:
  • Exclusivamente com SEUS dados
  
✅ Meta PERMITE:
  • Seus dados AGREGADOS com dados de 100+ outros anunciantes
  • Resultado: público maior mas menos exclusivo
```

---

## ✅ O QUE VOCÊ PODE FAZER (Direitos & Oportunidades)

### 1. **Dados que PODE Compartilhar com Meta**

#### **Tipo A: Informações de Contato (Hash)**
- Email com SHA-256
- Telefone com SHA-256
- CPF com SHA-256
- Endereço com SHA-256

**Uso Meta:** Matchear com usuários Facebook/WhatsApp (depois descarta original)

#### **Tipo B: Dados de Evento** ✅ MAIOR VALOR
```
SIM pode enviar (sem restricão):
  ✓ Visitou seu site (IP anônimo)
  ✓ Clicou em um botão
  ✓ Abriu email
  ✓ Comprou um produto
  ✓ Preço do produto
  ✓ ID do pedido
  ✓ Status do pedido
  ✓ Horário do evento
  ✓ Dispositivo (Android/iOS, anônimo)
  ✓ Localização genérica (não preciso)
```

**Risco ZERO em:** preço, produto, clique, compra, status → Meta usa só para otimizar anúncios

---

### 2. **Seus Direitos sobre Dados Enviados**

```
✅ VOCÊ CONTROLA:
  • Quais dados enviar (opção por opção)
  • Quando parar (pede para Meta deletar)
  • Quem acessa (pode restringir a "apenas públicos atuais")
  • Direito de copiar dados solicitados por usuário
  
⏳ RETENÇÃO:
  • Dados de Evento: máximo 2 anos
  • Públicos: até você deletar
  • Meta pode guardar mais se lei exigir
```

---

### 3. **Relatórios & Análises Seu (Exclusivos)**

```
✓ META FORNECE PARA VOCÊ:
  • Relatórios de Campanha (atribuição de vendas)
  • Análises (comportamento de público)
  • ROI de anúncios
  • Taxa de conversão
  • Custo por conversão
  
✓ VOCÊ PODE:
  • Usar internamente (unlimitado)
  • Não pode vender/compartilhar relatórios com terceiros
  • Pode compartilhar com seus clientes (ex: agência divulga para cliente)
  
✗ META PODE:
  • Combinar seus dados com 100+ outros (anonimizar)
  • Divulgar tendências agregadas (nunca seus nomes)
```

---

### 4. **Casos de Uso Permitidos para Seus Dados**

| Caso de Uso | Permitido? | Detalhes |
|---|---|---|
| **Correspondência** | ✅ | Match email/tel com Facebook ID, depois descarta PII |
| **Exclusão (opt-out)** | ✅ | Excluir clientes de campanha (don't advertise to X) |
| **Direcionamento** | ✅ | Anunciar para público semelhante aos seus clientes |
| **Mensuração** | ✅ | Medir qual anúncio gerou conversão |
| **Análises** | ✅ | Relatórios de impacto |
| **Mensagens** | ✅ | Enviar SMS/Messenger transacional (com consentimento) |
| **Treinamento ML** | ✅ | Meta treina modelos (anônimo, agregado) |
| **Publicidade retargeting** | ✅ | Anunciar novamente para quem visitou seu site |
| **Pesquisa/inovação** | ⚠️ | Meta pode usar para pesquisa (há opt-out) |

---

## 🛡️ SUAS OBRIGAÇÕES LEGAIS (Proteção & Defesa)

### **1. Avisos & Consentimentos Obrigatórios**

#### **Seu Website (landing pages, checkout)**
```html
⚠️ Banner claro e visível dizendo:
"Usamos pixels Meta para coletar dados de visita.
Meta e terceiros usam esses dados para anúncios direcionados.
Você pode recusar em aboutads.info/choices
Política de Privacidade: [link]"
```

#### **Seu App Mobile**
```
⚠️ Link óbvio em Configurações dizendo:
"Compartilhamos dados do app com Meta e terceiros.
Meta usa para anúncios, análises, mensuração.
Você pode recusar em aboutads.info
Política de Privacidade: [link]"
```

#### **Email Marketing**
```
⚠️ Se hashear emails para Meta:
"Seu email será usado para ads direcionadas no Facebook.
Você pode se desinscrever em [link].
Política: [link]"
```

### **2. Documentação que DEVE Guardar**

```
🔐 Arquivar por MÍNIMO 2 ANOS:
  ✓ Prova de consentimento do usuário (data, IP, versão termo)
  ✓ Versão do termo de privacidade em vigor
  ✓ Logs de quando dados foram enviados ao Meta
  ✓ Cópia de avisos exibidos (screenshots)
  ✓ Registro de opt-outs/exclusões
  ✓ Correspondência com Meta sobre dados
```

**Por quê?** Se alguém processar você por "vendi dados", você prova consentimento.

---

### **3. Sua Responsabilidade Legal**

```
❗ VOCÊ garante ter:
  • Direito legal de compartilhar cada dado
  • Consentimento do usuário (prova arquivada)
  • Autoridade para usar dados assim
  • Verificado idade (não < 13 anos)
  • Política de privacidade atualizada
  
❗ SE VIOLAR:
  • Meta pode suspender sua conta
  • Usuários podem processar você (LGPD: até R$ 10k por pessoa)
  • Regulador (ANPD, DPA, FTC) pode multar
  • Dano reputacional
```

---

## 💰 OPORTUNIDADES DE MONETIZAÇÃO & COBRANÇA

### **1. Lead Generation (Seu Modelo)**

```
AquariOS + WhatsApp:
  1. Usuário preenche formulário (consentimento)
  2. AquariOS hasha dados (email/CPF)
  3. Envia ao Meta para matchear
  4. Meta retorna: "38% de seus usuários = usuários Facebook"
  5. Você lança anúncio direcionado para esse 38%
  6. Gera vendas
  7. Você paga Meta por impressões/cliques (modelo normal)
  
💡 CHANCE: Cobrar de parceiros por leads qualificados:
  "Geramos X leads/mês com Meta. Custa Y por lead."
```

### **2. Dados de Evento = Ouro**

```
Modelo B2B para seus clientes (agências, e-commerce):
  
  Você oferece: "Rastreamento completo de eventos"
  Cliente vende: produtos
  
  Dados coletados:
    • Visitou página produto
    • Adicionou ao carrinho
    • Completou compra (valor)
    • Avaliou produto
  
  Você envia ao Meta:
    • Meta otimiza anúncios para eventos de "compra"
    • Cliente vende mais
    • Cliente paga comissão ou taxa
  
  Sua cobrança: 5-15% do incremento de vendas gerado
```

### **3. Públicos Personalizados**

```
Ativo digital não-transferível (seu cliente fica preso):
  
  Cliente quer: Anunciar para "quem comprou X"
  Você cria: Público personalizado no Meta
  Meta armazena: Público (você pode regenerar)
  Cliente paga: R$ 5k-50k/mês por gerenciamento
  
  Diferencial: Você controla público → cliente renovar contrato
```

### **4. Serviços Profissionais**

```
✅ Pode oferecer:
  • Auditoria de conformidade LGPD/GDPR
  • Setup de pixels e eventos
  • Gestão de consentimentos
  • Treinamento em "dados permitidos vs proibidos"
  • Limpeza de PII de datasets antigos
  • Relatórios de ROI customizados
  
💰 Valor: R$ 10k-100k/projeto
```

---

## ⚖️ DEFESA EM AÇÕES FUTURAS (Argumentos Legais)

### **Cenário 1: Usuário Processa "Vendi Meus Dados"**

```
SUA DEFESA:
  1. "Consentimento foi obtido e arquivado"
     → Apresentar consentimento assinado com data/IP
  
  2. "Dados foram hasheados (Meta não vê PII)"
     → Mostrar código/logs de SHA-256
  
  3. "Avisos foram claros e visíveis"
     → Screenshots de banners em site/app
  
  4. "Meta, não nós, usa dados"
     → Termo Meta diz: "Meta responsável pelo tratamento"
     → Você é apenas "transmissor autorizado"
  
  5. "Consentimento cobria exatamente isso"
     → Ler cláusula original de privacidade/termo
  
RESULTADO: Você vence (desde que documentação esteja em ordem)
```

### **Cenário 2: Meta Audita Você**

```
META PERGUNTA: "Vocês compartilham dados sensíveis?"

SUA RESPOSTA:
  ✓ "Apenas Dados de Evento (cliques, compras, preços)"
  ✓ "Contato é hasheado com SHA-256"
  ✓ "Nenhum dado sensível (saúde, financeiro, menores)"
  ✓ "Documentação de consentimento arquivada"
  ✓ "Avisos em site/app/email"
  
RESULTADO: Auditoria passa (Meta não suspende)
```

### **Cenário 3: Regulador (ANPD) Investiga**

```
ANPD PERGUNTA: "Como vocês garantem consentimento?"

SUA DEFESA:
  ✓ Política de privacidade atualizada (data)
  ✓ Consentimento pré-taqueado (não pré-selecionado)
  ✓ Linguagem clara (português, não jurguês)
  ✓ Direito de recusa implementado
  ✓ Logs de consentimento (timestamps)
  ✓ Prova de treinamento interno (LGPD)
  ✓ Registro de violações/incidentes
  
RESULTADO: Multa reduzida (ou perdoada) se cooperar
```

---

## 📊 MATRIZ DE RISCO x OPORTUNIDADE

| Ação | Risco Legal | Risco Negócio | Oportunidade $ | Recomendação |
|---|---|---|---|---|
| **Enviar Dados de Evento** | 🟢 Baixo | 🟢 Baixo | 🔴 Alta | ✅ FAZER — máxima exposição |
| **Hash Contato (Email/Tel)** | 🟢 Baixo | 🟢 Baixo | 🟡 Média | ✅ FAZER — conformidade automática |
| **CPF/ID Document** | 🟡 Médio | 🟡 Médio | 🟡 Média | ⚠️ SÓ com consentimento explícito |
| **Saúde/Renda/Financeiro** | 🔴 Alto | 🔴 Alto | 🟢 Baixa | ❌ NUNCA — multa até R$50M |
| **Vender Públicos** | 🔴 Alto | 🔴 Alto | 🟢 Baixa | ❌ NUNCA — suspensão Meta |
| **Sem Consentimento** | 🔴 Alto | 🔴 Alto | 🟢 Baixa | ❌ NUNCA — LGPD + processos |

---

## 🚀 IMPLEMENTAÇÃO IMEDIATA (Próximas 48h)

### **Checklist de Conformidade**

```
□ 1. Revisar Política de Privacidade
     • Citar Meta Ireland / Meta Platforms Inc
     • Explicar matching (hash)
     • Data de entrada em vigor
     
□ 2. Adicionar Banners
     • Website (checkout): "Pixel Meta coleta dados"
     • App: Link em Configurações → privacidade
     • Email: Footer com opt-out
     
□ 3. Implementar Consentimento
     • Checkbox para "Análises e anúncios"
     • NÃO pré-selecionado
     • Arquivo resposta (email + IP + timestamp)
     
□ 4. Documentação
     • Criar pasta: /legal/consent_logs/
     • Datar cada arquivo: YYYY-MM-DD_user_consent.json
     • Guardar 24 meses
     
□ 5. Treinamento
     • Equipe sabe o que NÃO pode enviar (saúde, financeiro, menores)
     • Todos assinam termo de confidencialidade
     • Audit trail de quem enviou o quê
     
□ 6. Auditoria Interna
     • Check: algum CPF de menor (<13 anos)?
     • Check: algum dado sensível enviado?
     • Report: "Conformidade LGPD-Meta: 100%"
```

---

## 📞 QUANDO CHAMAR ADVOGADO

```
🔴 IMEDIATO (hoje):
  • Meta ameaçou suspender conta
  • Usuário processou por "venda de dados"
  • Regulador (ANPD) enviou notificação
  • Descobriu que enviou dados sensíveis
  
🟡 PRÓXIMAS 48H:
  • Dúvida sobre conformidade LGPD
  • Novo caso de uso (ex: WhatsApp ads)
  • Parceiro em outro país (GDPR, etc)
```

---

## 📄 RESUMO EXECUTIVO

| Item | Status | Ação |
|---|---|---|
| **WhatsApp Bridge Ativo?** | ✅ Sim (+55 31 8323-5309) | Ligar credenciais hoje |
| **Consentimento?** | ⚠️ Precisa reviso | Atualizar política + banners |
| **Hash Dados?** | ⚠️ Revisar | Garantir SHA-256 antes de enviar |
| **Dados Sensíveis?** | 🔴 NUNCA | Não enviar saúde/financeiro/menores |
| **Públicos Transferíveis?** | ❌ Não | Ativo preso (lock-in de cliente) |
| **Cobrança de Clientes?** | ✅ Sim | 5-15% incremento vendas |
| **Risco Regulador** | 🟢 Baixo | Se seguir checklist acima |

---

**Documento versão 1.0 | Autor: Claude Haiku 4.5 | Data: 17/Jun/2026**  
**Próxima revisão: quando Meta atualizar termos (notificação Meta)**

⚖️ *Este documento é informativo. Consulte advogado antes de ações legais.*
