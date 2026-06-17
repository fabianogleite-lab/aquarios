# HANDOFF — 16/Jun/2026
## OdontolarPlus + Shopify ProteOS + Heysky Energia Solar

---

## 📖 LER ANTES DE QUALQUER COISA

Este handoff cobre **3 projetos PF do fundador Fabianogleite** entregues na sessão de 16/Jun/2026:
1. OdontolarPlus — sidebar ProteOS completa (ao vivo)
2. Shopify ProteOS-Shopify — extensions criadas (1 passo manual pendente)
3. Heysky Energia Solar — nova marca + landing page (ao vivo)

---

## 1. ODONTOLARPLUS — ProteOS Sidebar ✅ AO VIVO

**URL:** https://odontolarplus.com.br
**Repo:** fabianogleite-lab/odontolarplus — commit `53de235`

### O que foi entregue
- Tab fixo lateral direita (`#proteOS-sidebar`) com toggle open/close
- **Spotlight rotativo:** 10 serviços × fotos AVIF (15–138KB), embaralha aleatório a cada 5s, fade 350ms, 10 dots de paginação
- **Chat ProteOS contextual:**
  - Detecta intenção: alinhador / implante / dor / convênio / preço / limpeza / criança
  - Fallback: usa `window.getProteOSContext()` (dwell time por seção) para personalizar
  - "ProteOS digitando..." 1.2–1.8s → resposta + CTA WhatsApp pré-preenchido
- Auto-abre após 90s se sidebar ainda fechada
- **20 fotos AVIF** adicionadas em `docs/images/`
- **Smart CTA** (45s/25s/scroll 70%) contextual por seção — já estava implementado sessão anterior
- `window.getProteOSContext()` — tracker de dwell time por seção (alimenta ProteOS + Google dwell signal)

### Arquivos modificados
```
C:\Users\DWOS\Desktop\OdontolarPlus\docs\index.html   ← tudo num arquivo
C:\Users\DWOS\Desktop\OdontolarPlus\docs\images\      ← 20 AVIFs novos
```

### Verificado em preview
```
sidebarExists: true
tabExists: true
sidebarOpenAfterClick: true
msgCount: 3 (bot inicial + user + bot resposta)
dotsCount: 10
spotlightTitle: rodando ✅
```

### Pendências OdontolarPlus
- [ ] Textos hero/sobre/serviços — aguarda Adriana (aprovação)
- [ ] Google Reviews nativo (sem Elfsight)
- [ ] Shopify CTAs com handles reais dos produtos (ver seção 2)
- [ ] ProteOS chat → backend real `api.podiumtec.com.br/chat` (hoje mock)
- [ ] STT `language_code` dinâmico no ElevenLabs (hoje fixo `'pt'`)

---

## 2. SHOPIFY — ProteOS-Shopify App ⏳ 1 PASSO PENDENTE

**Local:** `C:\Users\DWOS\Desktop\AquariOS\prote-os-shopify\`
**Loja:** `odontolar-plus.myshopify.com`
**Commit:** `ea7ada6` (local, não tem remote ainda)

### O que foi criado
```
extensions/
  proteOS-chat/
    shopify.extension.toml        ← Theme App Extension
    blocks/proteOS_chat.liquid    ← Widget Liquid (chat + spotlight produto + WA)
    locales/en.default.json
  proteOS-pos/
    shopify.extension.toml        ← POS Extension
    src/index.jsx                 ← 5 ações rápidas no balcão

shopify.app.toml                  ← scopes: write_products + read/write_orders + read/write_customers
```

### Como o Theme Extension funciona
- Bloco Liquid adicionado ao tema da loja pelo merchant (Online Store > Themes > Customize)
- Lê `product.title` e `product.featured_image` automaticamente
- Chat detecta intenção + CTA WhatsApp pré-preenchido com nome do produto
- Sidebar CSS inline, zero dependência externa
- Auto-abre após 60s se usuário está numa página de produto

### Como o POS Extension funciona
- Aparece em `pos.home.modal.render` (botão no Shopify POS app no celular/tablet)
- 5 ações rápidas: Agendar / Alinhadores / Implante / Verificar Convênio / Emergência
- Abre WhatsApp com texto pré-preenchido

### ⚠️ PASSO MANUAL OBRIGATÓRIO — 1 COMANDO

O `client_id` em `shopify.app.toml` está vazio. O fundador precisa rodar:

```powershell
cd "C:\Users\DWOS\Desktop\AquariOS\prote-os-shopify"
npm run config:link
```

Isso abre o browser, seleciona o app no Shopify Partners, e preenche o `client_id` automaticamente.

**Depois de config:link:**
```powershell
npm run deploy
```

### Handles reais dos produtos
Para substituir `/collections/all` nos CTAs da landing OdontolarPlus, obter os handles em:
- `odontolar-plus.myshopify.com/admin/products` → cada produto tem um handle (slug)
- Formato: `odontolar-plus.myshopify.com/products/{handle}`

---

## 3. HEYSKY ENERGIA SOLAR ✅ AO VIVO

**Nome confirmado:** Heysky (Hey + Sky — solar, global, sem tradução)
**URL Pages:** https://fabianogleite-lab.github.io/heysky/
**Repo:** fabianogleite-lab/heysky — branch master, /docs
**Local:** `C:\Users\DWOS\Desktop\Helius\docs\index.html`

### Domínios (REGISTRAR AGORA)
| Domínio | Status | Custo | Link direto |
|---------|--------|-------|-------------|
| **heysky.com.br** | ✅ DISPONÍVEL | ~R$ 40/ano | https://registro.br/pesquisa-dominio/?fqdn=heysky.com.br |
| **heysky.solar** | ✅ DISPONÍVEL | ~$20/ano | namecheap.com ou godaddy.com |
| heysky.com | ❌ Chinês desde 2005 | $5k-50k via Sedo | Negociar no futuro |

### Estrutura da landing page
```
Hero
  └─ Calculadora de economia solar (JS puro, zero backend)
     • Entrada: valor conta de luz + tipo (residencial/comercial/rural)
     • Saída: economia/mês, economia/ano, payback (anos), CO2 evitado/ano
     • Fórmula: eco = conta×0.92, custo = max(conta×42, 12000), payback = custo/ecoAnual
     • CTA WA pré-preenchido com os dados calculados

Números Impacto (dark section)
  └─ 95% economia / 4-6 anos payback / 25 anos garantia / 2 dias instalação

Como Funciona (4 passos)
  └─ Visita técnica → Proposta → Instalação → Economia

Tipos de Sistema (3 cards)
  └─ Residencial / Comercial / Rural — CTA WA específico por tipo

Payback Visual (dark section)
  └─ 3 barras animadas: retorno / vida útil / valorização imóvel

Benefícios (6 cards)
  └─ Equipamentos T1 / Tudo incluído / 120x / Monitoramento / Garantia / CO2

FAQ (10 perguntas — schema.org FAQPage)
  └─ CTAs WhatsApp contextuais em cada resposta

ProteOS Sidebar
  └─ Mini-calculadora inline
  └─ Chat: responde valor numérico da conta → calcula e propõe orçamento
  └─ Links rápidos: orçamento / como funciona / tipos / payback / FAQ

Smart CTA
  └─ 45s geral / 25s seção high-intent / scroll>70% + 30s
```

### Aprendizados de OdontolarPlus aplicados
- Mesma arquitetura de scroll infinito com sub-landpages por seção
- `window.getProteOSContext()` — dwell time tracker idêntico (Google ranking signal)
- Smart CTA com mesmo sistema de timing + contexto
- FAQ sanfona com `grid-template-rows: 0fr → 1fr`
- Prompts Adriana-style nas respostas FAQ ("Me diga o valor da conta...")
- ProteOS sidebar adaptada com mini-calc específica para energia
- Schema.org LocalBusiness + FAQPage para SEO local BH
- AVIF pronto para quando tiver fotos reais de instalação

### Pendências Heysky
- [ ] **Registrar heysky.com.br + heysky.solar** (domínios disponíveis agora)
- [ ] Fotos reais de instalação de painéis / equipe
- [ ] Depoimentos reais de clientes Power Mais
- [ ] Textos revisados (conteúdo draft — sem revisão de comunicação ainda)
- [ ] CNAME para custom domain após registro
- [ ] Conectar ao Oracle VM / FastAPI quando tiver leads (hoje 100% estático)

---

## 4. ARQUITETURA APRENDIDA — TEMPLATE PF DO FUNDADOR

Padrão repetível para qualquer novo produto PF (OdontolarPlus, Heysky, etc.):

```
Landing Page Estática (GitHub Pages /docs)
  │
  ├── Hero: Calculadora / Prova imediata de valor
  ├── Seções: Sub-landpages por tema (IntersectionObserver)
  ├── FAQ: Schema.org FAQPage + CTAs contextuais por pergunta
  ├── ProteOS Sidebar: Chat + Spotlight + Mini-ferramenta específica
  ├── Smart CTA: 45s/25s/scroll 70% com contexto por seção
  └── dwell time: window.getProteOSContext() → Google ranking signal

Stack: HTML puro + CSS + JS vanilla
CDN: Zero (tudo inline)
Imagens: AVIF (15-140KB)
CTA: WhatsApp wa.me/5531983140497?text=... (pré-preenchido por contexto)
Deploy: git push → GitHub Pages (1-2min)
```

---

## 5. STATUS GERAL DOS 3 PROJETOS

| Projeto | Landing | Chat | Shopify | Domínio |
|---------|---------|------|---------|---------|
| OdontolarPlus | ✅ ao vivo | ✅ mock | ⏳ config:link | ✅ odontolarplus.com.br |
| Heysky | ✅ ao vivo | ✅ mock | — | ⏳ registrar heysky.com.br |
| AquariOS App | ✅ ao vivo | ✅ ElevenLabs | — | ✅ podiumtec.com.br |

---

## 6. PRÓXIMA SESSÃO — ORDEM DE PRIORIDADE

1. **`npm run config:link`** no prote-os-shopify (1 min, requer browser) → habilita deploy
2. **Registrar heysky.com.br + heysky.solar** → conectar CNAME ao repo
3. **Handles reais dos produtos Shopify** → atualizar CTAs da landing OdontolarPlus
4. **Textos OdontolarPlus** → aguardar Adriana (hero/sobre/serviços)
5. **Meta CLI wiring** → `business-agent/main.py` + ProteOS real (gate: credenciais Meta)
6. Fotos de instalação Heysky → substituir hero placeholder

---

## REFERÊNCIAS RÁPIDAS

| Recurso | Localização |
|---------|-------------|
| OdontolarPlus HTML | `C:\Users\DWOS\Desktop\OdontolarPlus\docs\index.html` |
| OdontolarPlus fotos | `C:\Users\DWOS\Desktop\OdontolarPlus\docs\images\` |
| Heysky HTML | `C:\Users\DWOS\Desktop\Helius\docs\index.html` |
| Shopify app | `C:\Users\DWOS\Desktop\AquariOS\prote-os-shopify\` |
| Theme Extension | `.../prote-os-shopify/extensions/proteOS-chat/blocks/proteOS_chat.liquid` |
| POS Extension | `.../prote-os-shopify/extensions/proteOS-pos/src/index.jsx` |
| WhatsApp number | `5531983140497` |
| Oracle VM | `opc@137.131.158.242` |
| FastAPI prod | `api.podiumtec.com.br` |
