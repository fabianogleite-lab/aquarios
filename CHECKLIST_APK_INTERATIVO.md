# ✅ CHECKLIST INTERATIVO — PASSO-A-PASSO APK BUILD

**Use este arquivo para acompanhar seu progresso**

---

## FASE 1: PREPARAÇÃO DOS ASSETS (30 min)

### 1.1 Criar icon.png (512×512)

- [ ] Abrir Canva OU GIMP OU online generator
- [ ] Criar novo projeto 512×512 px
- [ ] Adicionar logo/ícone (⚗ ou design custom)
- [ ] Fundo: #090c14 (escuro)
- [ ] Export como PNG
- [ ] Salvar em: `mobile/assets/icon.png`
- [ ] Verificar tamanho: > 1 KB ✅

### 1.2 Criar splash.png (1080×1920)

- [ ] Abrir Canva OU GIMP OU online generator
- [ ] Criar novo projeto 1080×1920 px
- [ ] Centralizar logo/nome "AquariOS"
- [ ] Adicionar subtítulo
- [ ] Fundo: #090c14 (escuro)
- [ ] Export como PNG
- [ ] Salvar em: `mobile/assets/splash.png`
- [ ] Verificar tamanho: > 1 KB ✅

### 1.3 Criar adaptive-icon.png (192×192)

- [ ] Abrir Canva OU GIMP OU online generator
- [ ] Criar novo projeto 192×192 px
- [ ] Fundo: TRANSPARENTE (RGBA)
- [ ] Desenhar ícone/logo
- [ ] Export como PNG
- [ ] Salvar em: `mobile/assets/adaptive-icon.png`
- [ ] Verificar tamanho: > 1 KB ✅

### 1.4 Validar Assets

```bash
# Executar no terminal:
ls -lh mobile/assets/

# Esperado:
# icon.png                50-200 KB  ✅
# splash.png             100-500 KB  ✅
# adaptive-icon.png       20-100 KB  ✅
```

- [ ] icon.png existe e tem tamanho > 0 KB
- [ ] splash.png existe e tem tamanho > 0 KB
- [ ] adaptive-icon.png existe e tem tamanho > 0 KB

**✅ FASE 1 CONCLUÍDA?** → Sim ( ) Não ( )

---

## FASE 2: SETUP BACKEND (15 min)

### 2.1 Instalar Node.js e npm

```bash
node -v      # Deve ser ≥18.0.0
npm -v       # Deve ser ≥9.0.0
```

- [ ] Node.js ≥18 instalado (se não, instalar de nodejs.org)
- [ ] npm ≥9 instalado (vem com Node.js)

### 2.2 Criar arquivo .env

```bash
cd backend
cp .env.example .env
nano .env    # Ou abrir com editor
```

**Editar os valores:**

- [ ] DATABASE_URL → `postgresql://user:password@localhost:5432/aquarios_v2`
- [ ] REDIS_URL → `redis://localhost:6379`
- [ ] JWT_SECRET → gerar string aleatória 64+ caracteres
- [ ] ENCRYPTION_KEY → gerar string aleatória 64+ caracteres
- [ ] ANTHROPIC_API_KEY → `sk-ant-xxxxx` (sua chave)
- [ ] CORS_ORIGIN → `http://localhost:8081,exp://localhost:8081`

### 2.3 Instalar dependências backend

```bash
cd backend
npm install
```

- [ ] npm install concluído sem erros
- [ ] node_modules/ criado
- [ ] package-lock.json atualizado

### 2.4 Verificar/Criar Database PostgreSQL

```bash
# Verificar se PostgreSQL está rodando:
psql --version

# Criar database:
createdb aquarios_v2

# Carregar schema:
psql aquarios_v2 < schema_v2_0000.sql

# Verificar:
psql aquarios_v2 -c "SELECT COUNT(*) FROM users;"
```

- [ ] PostgreSQL instalado e rodando
- [ ] Database `aquarios_v2` criado
- [ ] Schema carregado (18 tabelas)

### 2.5 Verificar/Iniciar Redis

```bash
# Verificar:
redis-cli ping    # Deve responder PONG

# Se não tiver:
redis-server      # Iniciar em outro terminal
# Ou usar Docker: docker run -d -p 6379:6379 redis:latest
```

- [ ] Redis rodando na porta 6379
- [ ] Redis respondendo ao ping

### 2.6 Iniciar Backend

```bash
cd backend
npm run dev
```

Esperado na tela:
```
🚀 Server running on port 3000
✅ Database connected
✅ Redis connected
📡 35+ endpoints available
```

- [ ] Backend iniciado na porta 3000
- [ ] Database conectado
- [ ] Redis conectado
- [ ] Nenhum erro crítico

**✅ FASE 2 CONCLUÍDA?** → Sim ( ) Não ( )

---

## FASE 3: SETUP MOBILE (10 min)

### 3.1 Instalar Expo CLI e EAS CLI

```bash
npm install -g expo-cli
npm install -g eas-cli
```

- [ ] expo-cli instalado globalmente
- [ ] eas-cli instalado globalmente

### 3.2 Instalar dependências mobile

```bash
cd mobile
npm install
```

- [ ] npm install concluído sem erros
- [ ] node_modules/ criado
- [ ] package-lock.json atualizado

### 3.3 Configurar API URL (se testar em dispositivo)

Se testar em emulador/seu PC:
```
EXPO_PUBLIC_API_URL=http://localhost:3000
```

Se testar em dispositivo físico:
```
EXPO_PUBLIC_API_URL=http://SEU_IP_DO_PC:3000
# Exemplo: http://192.168.1.100:3000
```

- [ ] EXPO_PUBLIC_API_URL definida corretamente
- [ ] Se device: usando IP real, não localhost

### 3.4 Testar no Expo Go (opcional)

```bash
cd mobile
npm start
# Scannear QR code com Expo Go app
```

- [ ] Expo Go app aberto
- [ ] QR code escaneado
- [ ] App iniciando sem crash
- [ ] Tela de login visível

**✅ FASE 3 CONCLUÍDA?** → Sim ( ) Não ( )

---

## FASE 4: BUILD APK (15-20 min)

### 4.1 Login EAS (primeira vez apenas)

```bash
cd mobile
eas login
# Ou: eas login --email seu@email.com --password sua_senha
```

- [ ] Conta Expo criada (https://expo.dev)
- [ ] Login realizado com sucesso

### 4.2 Build APK via EAS

```bash
eas build --platform android --type apk
```

Monitorar:
```
✅ Build iniciado
⏳ Processando... (10-15 min)
✅ Build concluído
📥 Download link fornecido
```

- [ ] Build enviado com sucesso
- [ ] Aguardando conclusão (paciência!)
- [ ] Link de download recebido

### 4.3 Download do APK

```
Copiar link fornecido por EAS
Abrir em navegador
Salvar arquivo: aquarios-v2-v2.0.0.apk
```

- [ ] APK baixado (tamanho ~50-80 MB)
- [ ] Arquivo íntegro (verificar tamanho > 40 MB)

**✅ FASE 4 CONCLUÍDA?** → Sim ( ) Não ( )

---

## FASE 5: TESTES (10-15 min)

### 5.1 Instalar em Dispositivo

```bash
adb devices                    # Ver dispositivos conectados
adb install aquarios-v2-v2.0.0.apk
```

Ou transferir arquivo manualmente e clicar para instalar.

- [ ] APK instalado com sucesso
- [ ] Ícone visível no home screen

### 5.2 Verificações de Inicialização

```
Abrir app AquariOS
```

- [ ] Splash screen aparece
- [ ] App não trava
- [ ] Tela de login visível
- [ ] Permissões solicitadas (localização, câmera, etc)
- [ ] Todas permissões concedidas (ou testadas)

### 5.3 Testar Autenticação

```
Login Screen:
├─ Campo email visível
├─ Campo senha visível
├─ Botão "Login" funciona
├─ Botão "Registrar" funciona
```

- [ ] Entrou com credenciais de teste (beta@aquarios.app)
- [ ] Login com sucesso (redirecionou para dashboard)

### 5.4 Testar Telas Principais

```
Dashboard:
├─ [ ] IVI (Índice de Vitalidade Integrada) visível
├─ [ ] Status cards carregando
├─ [ ] Botões funcionam

Diário:
├─ [ ] Lista de entradas aparece
├─ [ ] Botão "Adicionar" funciona
├─ [ ] Journal entry forma abre

Nutrição:
├─ [ ] Lista de refeições aparece
├─ [ ] Pode adicionar refeição

Chat ProteOS:
├─ [ ] Interface chat aparece
├─ [ ] Pode digitar mensagem
├─ [ ] Mensagem envia ao backend

Comunidades:
├─ [ ] Lista de comunidades carrega
├─ [ ] Pode visualizar posts

Configurações:
├─ [ ] Perfil visível
├─ [ ] Pode editar dados
├─ [ ] Logout funciona
```

### 5.5 Testar Comunicação com API

Mensagens no console:
```
✅ API calls sucedendo
✅ Dados carregando
❌ Sem erros de conexão
```

- [ ] Nenhum erro de "Cannot connect to API"
- [ ] Dados carregam sem delay excessivo (< 2 seg)
- [ ] Nenhum 401/403 errors (exceto primeiro login)

### 5.6 Verificação de Performance

```
Tempos esperados:
├─ Startup: < 3 segundos
├─ Carregamento tela: < 1 segundo
├─ API response: < 200 ms
└─ Uso memória: < 150 MB
```

- [ ] App não trava
- [ ] Não há lag perceptível
- [ ] Navegação fluida

**✅ FASE 5 CONCLUÍDA?** → Sim ( ) Não ( )

---

## 🎉 CHECKLIST COMPLETO?

Se todos os passos acima estão checked ✅:

```
✅ FASE 1: ASSETS CRIADOS
✅ FASE 2: BACKEND RODANDO
✅ FASE 3: MOBILE PRONTO
✅ FASE 4: APK CONSTRUÍDO
✅ FASE 5: TESTES PASSARAM

🎉 APK VÁLIDO E PRONTO PARA USAR!
```

---

## 📋 TROUBLESHOOTING

Se algo deu errado:

### Build falhou
```
→ Verificar VALIDACAO_APK_COMPLETA.md → "PROBLEMAS CONHECIDOS"
→ Ou: eas build --platform android --type apk --verbose
```

### API não conecta
```
→ Backend está rodando? npm run dev?
→ EXPO_PUBLIC_API_URL está correta?
→ Firewall bloqueando porta 3000?
```

### Crash ao abrir
```
→ Verificar logs: adb logcat | grep AquariOS
→ Criar issue no GitHub: github.com/fabianogleite/arkhe-app/issues
```

---

**Status Final:** ⏳ EM ANDAMENTO

Salve este arquivo e volte sempre que completar uma fase!

---

*Última atualização: 14 de Maio de 2026*
