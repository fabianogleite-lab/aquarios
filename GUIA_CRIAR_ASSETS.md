# 🎨 GUIA RÁPIDO — CRIAR ASSETS PARA APK

**Bloqueador:** Faltam 3 arquivos PNG  
**Tempo:** ~30 minutos  
**Dificuldade:** Fácil  

---

## 📋 O QUE PRECISA

```
mobile/assets/
├── icon.png (512x512 px) — Ícone do aplicativo
├── splash.png (1080x1920 px) — Tela de inicialização
└── adaptive-icon.png (192x192 px) — Ícone adaptável Android
```

---

## 🛠️ OPÇÃO 1: USAR CANVA (Mais Fácil)

### Passo 1: Ir para Canva
```
https://www.canva.com/
Criar conta (gratuita)
```

### Passo 2: Criar Icon (512×512)
```
1. Novo design → Buscar "512×512"
2. Designs → "Mobile App Icon"
3. Mudar fundo para #090c14 (escuro)
4. Adicionar logo/ícone "⚗" (químico)
   Ou: Usar template AquariOS
5. Download → PNG
6. Salvar em: mobile/assets/icon.png
```

### Passo 3: Criar Splash (1080×1920)
```
1. Novo design → "Mobile App Splash"
2. Fundo: #090c14
3. Centralizar: Logo/nome "AquariOS"
4. Adicionar: Subtítulo "Sistema Operacional"
5. Download → PNG
6. Salvar em: mobile/assets/splash.png
```

### Passo 4: Criar Adaptive Icon (192×192)
```
1. Novo design → "Icon Design"
2. Tamanho: 192×192
3. Fundo: Transparente
4. Logo/símbolo apenas
5. Download → PNG
6. Salvar em: mobile/assets/adaptive-icon.png
```

---

## 🛠️ OPÇÃO 2: USAR GIMP (Grátis, Local)

### Setup GIMP
```
Baixar: https://www.gimp.org/downloads/
Instalar versão estável
```

### Criar Icon.png

```bash
1. Abrir GIMP
2. File → New → 512×512 px, RGB
3. Image → Fill with Color → #090c14
4. Add layer para desenho
5. Use ferramentas para criar logo
   OU: File → Open as layers → import imagem existente
6. Export As → icon.png → PNG format
7. Salvar em mobile/assets/
```

### Criar Splash.png

```bash
1. File → New → 1080×1920 px, RGB
2. Image → Fill → #090c14
3. Adicionar camadas com logo + texto
4. Centralizar conteúdo
5. Export As → splash.png
6. Salvar em mobile/assets/
```

### Criar Adaptive-Icon.png

```bash
1. File → New → 192×192 px, RGBA (com transparência!)
2. Layer → Transparency → Add Alpha Channel
3. Desenhar logo/ícone
4. Export As → adaptive-icon.png
5. Salvar em mobile/assets/
```

---

## 🛠️ OPÇÃO 3: USAR ONLINE GENERATOR (Mais Rápido)

### Android Icon Generator
```
https://romannurik.github.io/AndroidAssetStudio/icons-app.html

1. Abrir link
2. Upload imagem base (logo/símbolo)
3. Configurar cores: #090c14
4. Download → Android Assets
5. Extrair arquivos de tamanhos
```

### Splash Generator
```
https://www.pngmaker.com/

1. Criar imagem 1080×1920
2. Background: #090c14
3. Centralizar logo
4. Download → PNG
```

---

## ✅ VERIFICAÇÃO RÁPIDA

Após criar os 3 arquivos:

```bash
ls -lh mobile/assets/

# Esperado:
# icon.png (50-200 KB) ✅
# splash.png (100-500 KB) ✅
# adaptive-icon.png (20-100 KB) ✅
```

---

## 💡 DICAS DE DESIGN

### Icon (512×512)
- Use símbolo: ⚗ (alambique/químico)
- Ou: Gota + cérebro (saúde integrada)
- Cores: #b8952a (dourado) em #090c14 (escuro)
- Deixe espaço em branco (não ocupe 100% da área)

### Splash (1080×1920)
```
Layout:
┌─────────────────────┐
│                     │
│                     │ 30%
│      Logo (⚗)       │
│    AquariOS v2      │
│   "Sistema Integrado" │
│                     │
│                     │ 70%
│                     │
└─────────────────────┘

Cores:
- Fundo: #090c14 (escuro)
- Texto: #b8952a (dourado)
- Logo: Branco/dourado
```

### Adaptive Icon (192×192)
```
Pode ser simplificado:
- Apenas símbolo ⚗
- Sem texto
- Fundo: Transparente
- A cor de fundo vem do app
```

---

## 🚀 PRÓXIMO PASSO

Depois de criar os 3 arquivos PNG:

```bash
cd mobile
npm install
npm run android              # Testa no Expo Go

# Ou diretamente:
eas build --platform android --type apk
```

---

## ⚠️ ERROS COMUNS

### "Arquivo PNG muito pequeno"
```
Solução: Verificar dimensões
- icon.png: 512×512
- splash.png: 1080×1920
- adaptive-icon.png: 192×192
```

### "Arquivo PNG com fundo errado"
```
Solução:
- icon.png: Fundo #090c14 (escuro)
- splash.png: Fundo #090c14 (escuro)
- adaptive-icon.png: Transparente (RGBA)
```

### "Arquivo PNG corrompido"
```
Solução:
- Verificar formato: deve ser PNG
- Verificar tamanho: > 1 KB
- Recriar se necessário
```

---

## 📞 ALTERNATIVA: USAR ASSETS GENÉRICOS

Se não quiser criar agora, use assets temporários:

```bash
# Criar cor sólida como placeholder
convert -size 512x512 xc:'#090c14' mobile/assets/icon.png
convert -size 1080x1920 xc:'#090c14' mobile/assets/splash.png
convert -size 192x192 xc:'#090c14' mobile/assets/adaptive-icon.png

# Depois customizar propriamente
```

---

**Tempo total:** 30 min  
**Dificuldade:** 🟢 Fácil  
**Pronto para build APK:** ✅ Sim

Volte aqui quando tiver os 3 arquivos prontos!
