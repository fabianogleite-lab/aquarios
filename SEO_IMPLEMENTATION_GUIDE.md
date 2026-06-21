# GUIA COMPLETO — Implementação de SEO para podiumtec.com.br

**Data:** 17/Jun/2026  
**Status:** CRÍTICO → BOM (70/100)  
**Tempo estimado:** 2-3 horas

---

## 📋 PRIORIZAÇÃO (O QUE FAZER E QUANDO)

### 🔴 HOJE — CRÍTICO (30 min)
Sem essas mudanças, o SEO não funciona:
1. [ ] Adicionar meta description em `/investidores.html`
2. [ ] Verificar se todas as páginas têm viewport meta

### 🟠 HOJE/AMANHÃ — IMPORTANTE (1 hora)
Precisam estar feitas antes de submeter ao Google Search Console (já feito o ping):
3. [ ] Adicionar Open Graph tags em TODAS as páginas
4. [ ] Adicionar canonical tags em TODAS as páginas
5. [ ] Implementar schema.org JSON-LD

### 🟡 PRÓXIMA SEMANA — RECOMENDADO (1 hora)
Melhoram ranking e indexação:
6. [ ] Adicionar alt text em todas as imagens
7. [ ] Adicionar schema LocalBusiness
8. [ ] Monitorar PageSpeed Insights

---

## 🛠️ IMPLEMENTAÇÃO PASSO A PASSO

### PASSO 1: Identificar todos os arquivos que precisam ser editados

**Arquivo principal:**
```
C:\Users\DWOS\Desktop\AquariOS\aquarios-v2-complete\docs\index.html
```

**Subpáginas:**
```
docs/engenharia.html
docs/investidores.html
docs/backoffice.html
docs/privacy-policy.html
docs/terms.html
docs/deletion.html
```

**Subdomínios (fora do escopo hoje, mas anotar):**
```
docs/escambos/index.html
docs/heysky/index.html
```

---

## 🔴 CRÍTICO #1: Meta Description em /investidores.html

**O que fazer:**
Abrir: `docs/investidores.html`
Procurar por: `<meta name="description"`
Se não existir, adicionar após `<title>`:

```html
<meta name="description" content="Hub de investimentos em 3 projetos inovadores: AquariOS (assistente pessoal de saúde), EscambOS (marketplace), heYskY (energia solar). Conheça as oportunidades.">
```

**Validar:** Meta description deve ter 120-160 caracteres.

---

## 🟠 IMPORTANTE #2: Open Graph Tags (Redes Sociais)

**Onde adicionar:** No `<head>` de TODAS as páginas, após meta description.

### Template para cada página:

**Para `index.html` (Página Principal):**
```html
<meta property="og:title" content="AquariOS — Sistema Operacional Pessoal">
<meta property="og:description" content="Assistente pessoal de saúde com IA. 4 dimensões e iVi — a fórmula científica da qualidade de vida.">
<meta property="og:type" content="website">
<meta property="og:url" content="https://podiumtec.com.br/">
<meta property="og:image" content="https://podiumtec.com.br/og-aquarios.png">
```

**Para `engenharia.html`:**
```html
<meta property="og:title" content="Engenharia e Arquitetura — podiumtec.com.br">
<meta property="og:description" content="Tecnologia de ponta: HygeiOS v2, ProteOS, CerberOS. 9 módulos em 5 agentes inteligentes.">
<meta property="og:type" content="website">
<meta property="og:url" content="https://podiumtec.com.br/engenharia.html">
<meta property="og:image" content="https://podiumtec.com.br/og-engenharia.png">
```

**Para `investidores.html`:**
```html
<meta property="og:title" content="Investidores — AquariOS, EscambOS, heYskY">
<meta property="og:description" content="Três projetos inovadores em saúde, marketplace e energia solar. Oportunidades de investimento.">
<meta property="og:type" content="website">
<meta property="og:url" content="https://podiumtec.com.br/investidores.html">
<meta property="og:image" content="https://podiumtec.com.br/og-investidores.png">
```

**⚠️ NOTA IMPORTANTE:** OG:IMAGE

Você DEVE criar imagens OG para cada página:
- Dimensões: 1200x630px
- Formato: PNG ou JPG
- Tamanho: max 300KB
- Caminho: `/og-[page].png`

**Por enquanto**, use URLs de placeholder:
```html
<meta property="og:image" content="https://podiumtec.com.br/og-aquarios.png">
```

Depois crie as imagens e suba em `/docs/`:
- `og-aquarios.png`
- `og-engenharia.png`
- `og-investidores.png`
- etc

---

## 🟠 IMPORTANTE #3: Canonical Tags

**Onde adicionar:** No `<head>` de cada página, após OG tags.

```html
<!-- index.html -->
<link rel="canonical" href="https://podiumtec.com.br/">

<!-- engenharia.html -->
<link rel="canonical" href="https://podiumtec.com.br/engenharia.html">

<!-- investidores.html -->
<link rel="canonical" href="https://podiumtec.com.br/investidores.html">

<!-- etc para todas as páginas -->
```

**Por que:** Evita conteúdo duplicado se a página for acessada de múltiplas URLs.

---

## 🟠 IMPORTANTE #4: Schema.org JSON-LD

**Onde adicionar:** No `<head>`, ANTES de `</head>`, como último script.

### Para Página Principal (index.html):

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "podiumtec.com.br",
  "url": "https://podiumtec.com.br",
  "description": "Somos o que todos precisam e ninguém ofereceu, ainda. Assistente pessoal de saúde integral com IA, quatro dimensões e iVi.",
  "logo": "https://podiumtec.com.br/logo.png",
  "sameAs": [
    "https://www.linkedin.com/company/podiumtec",
    "https://www.instagram.com/aquarios.app"
  ]
}
</script>
```

### Para Página de Investidores (investidores.html):

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Investidores — AquariOS, EscambOS, heYskY",
  "description": "Hub de três projetos inovadores com oportunidades de investimento",
  "mainEntity": [
    {
      "@type": "Product",
      "name": "AquariOS",
      "description": "Sistema Operacional Pessoal para saúde integral",
      "url": "https://podiumtec.com.br/"
    },
    {
      "@type": "Product",
      "name": "EscambOS",
      "description": "Marketplace de trocas e serviços",
      "url": "https://podiumtec.com.br/escambos/"
    },
    {
      "@type": "Product",
      "name": "heYskY",
      "description": "Energia solar inteligente",
      "url": "https://podiumtec.com.br/heysky/"
    }
  ]
}
</script>
```

---

## 🟡 RECOMENDADO #5: Alt Text em Imagens

**O que fazer:**
1. Abrir cada página HTML
2. Procurar por tags `<img>`
3. Verificar se possuem atributo `alt`
4. Se não tiverem, adicionar:

```html
<!-- ANTES (falta alt) -->
<img src="image.jpg">

<!-- DEPOIS (com alt) -->
<img src="image.jpg" alt="Descrição breve e significativa da imagem">
```

**Exemplo de bons alt texts:**
```html
<img src="team.jpg" alt="Equipe de desenvolvimento podiumtec">
<img src="architecture.png" alt="Arquitetura de 5 agentes: ProteOS, HygeiOS, CerberOS, PanaceIA, SandeirOS">
<img src="chart.png" alt="Grafico de crescimento em 6 dimensões de bem-estar">
```

---

## 📋 CHECKLIST DE IMPLEMENTAÇÃO

### Arquivo: `docs/index.html`
- [ ] Meta description: 120-160 chars ✓ (já tem)
- [ ] OG tags completas (title, desc, image, url)
- [ ] Canonical tag
- [ ] Schema.org Organization JSON-LD
- [ ] Viewport meta tag ✓ (já tem)
- [ ] Title tag ✓ (já tem)
- [ ] H1 tag ✓ (já tem)

### Arquivo: `docs/engenharia.html`
- [ ] Meta description: 120-160 chars ✓ (já tem)
- [ ] OG tags completas
- [ ] Canonical tag
- [ ] Schema.org WebPage JSON-LD
- [ ] Viewport meta tag ✓
- [ ] Title tag ✓
- [ ] H1 tag ✓

### Arquivo: `docs/investidores.html`
- [ ] Meta description: **FALTA** (CRÍTICO)
- [ ] OG tags completas
- [ ] Canonical tag
- [ ] Schema.org CollectionPage JSON-LD
- [ ] Viewport meta tag ✓
- [ ] Title tag ✓

### Arquivo: `docs/backoffice.html`
- [ ] Meta description: verificar
- [ ] OG tags completas
- [ ] Canonical tag
- [ ] Schema.org

### Arquivo: `docs/privacy-policy.html`
- [ ] Meta description
- [ ] Canonical tag
- [ ] Schema.org

### Arquivo: `docs/terms.html`
- [ ] Meta description
- [ ] Canonical tag
- [ ] Schema.org

### Subdomínios: `docs/escambos/index.html`
- [ ] Meta description
- [ ] OG tags
- [ ] Canonical tag
- [ ] Schema.org

### Subdomínios: `docs/heysky/index.html`
- [ ] Meta description
- [ ] OG tags
- [ ] Canonical tag
- [ ] Schema.org (já tem LocalBusiness)

---

## ⏱️ CRONOGRAMA REALISTA

| Fase | O Quê | Tempo | Quando |
|------|-------|-------|--------|
| 1 | Meta description em investidores.html | 5 min | Hoje |
| 2 | OG tags em 3 páginas principais | 20 min | Hoje |
| 3 | Canonical tags em 6 páginas | 10 min | Hoje |
| 4 | Schema.org em 3 páginas | 15 min | Hoje |
| 5 | Commit e push | 5 min | Hoje |
| 6 | Testar no Search Console | 10 min | Amanhã |
| **TOTAL** | | **65 min** | **Hoje + Amanhã** |

---

## 🚀 COMO EXECUTAR

### Opção A: Manual (Editar com VS Code)

1. Abrir `C:\Users\DWOS\Desktop\AquariOS\aquarios-v2-complete\docs\`
2. Abrir cada `.html` em VS Code
3. Colar templates acima na posição correta
4. Salvar (Ctrl+S)
5. Fazer commit e push

### Opção B: Automático (Usar Script Python)

```bash
cd C:\Users\DWOS\Desktop\AquariOS\aquarios-v2-complete
python3 scripts/add_seo_tags.py
```

(Script será criado se você quiser)

---

## ✅ VALIDAR DEPOIS DE FAZER

### 1. Testar meta tags:
Abrir cada página no navegador e clicar direito → "Ver página de origem"  
Procurar por `<meta name="description">` e `<meta property="og:title">`

### 2. Validar com Google:
https://search.google.com/structured-data/testing-tool

Cole o HTML de cada página. Deve mostrar:
- [x] Organization (ou WebPage, ou Product)
- [x] Sem erros

### 3. Validar com Facebook:
https://developers.facebook.com/tools/debug/og/object

Cole cada URL. Deve mostrar:
- OG title
- OG description  
- OG image

### 4. Testar no Search Console:
https://search.google.com/search-console/

Menu "Inspecionar URL" → digitar cada página → "Testar a URL ao vivo"  
Deve dizer: "A URL é totalmente indexável"

---

## 📊 RESULTADO ESPERADO

Depois de implementar tudo:

**Antes:** Score SEO 70/100
**Depois:** Score SEO 85-90/100

**Métricas:**
- ✅ Meta descriptions em 100% das páginas
- ✅ OG tags em 100% das páginas
- ✅ Canonical tags em 100% das páginas
- ✅ Schema.org em 100% das páginas
- ✅ Alt text em 100% das imagens

---

## 🎯 PRÓXIMOS PASSOS (DEPOIS DE HOJE)

1. **Criar imagens OG** (1200x630px) para cada página
2. **Implementar FAQ schema** (já tem nos landings OdontolarPlus/Heysky)
3. **Implementar LocalBusiness schema** com dados de contato
4. **Monitorar PageSpeed Insights** e melhorar Core Web Vitals
5. **Implementar Google Analytics 4** (tracking)
6. **Criar sitemap de imagens** (sitemap-images.xml)

---

## 💡 DÚVIDAS FREQUENTES

**P: Qual é a diferença entre meta description e og:description?**
R: Meta description aparece no Google Search. OG description aparece quando compartilha no Facebook/LinkedIn.

**P: Posso usar os mesmos textos em ambas?**
R: Sim, pode. Mas idealmente og: deveria ser mais atrativo (para redes sociais).

**P: Se eu não adicionar og:image, afeta ranking?**
R: Não afeta ranking no Google, mas afeta compartilhamento social (não aparece preview).

**P: Canonical tag é obrigatória?**
R: Tecnicamente não, mas evita problemas com conteúdo duplicado.

**P: Schema.org afeta ranking direto?**
R: Não afeta ranking direto, mas melhora rich snippets (aparência nos resultados).

---

## 🆘 PRECISA DE AJUDA?

Se tiver dúvida:
1. Cole a URL acima no **Structured Data Testing Tool**: https://search.google.com/structured-data/testing-tool
2. Ou use o **Facebook Debugger**: https://developers.facebook.com/tools/debug/
3. Ou me peça para revisar

---

**Dúvidas? Quer que eu prepare um script para automatizar isso?**
