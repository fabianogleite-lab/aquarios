═══════════════════════════════════════════════════════════════════
✅ BUILD CONCLUÍDO COM SUCESSO!
═══════════════════════════════════════════════════════════════════

📱 APK GERADO
───────────────────────────────────────────────────────────────────
Localização: 
  mobile/android/app/build/outputs/apk/debug/app-debug.apk
  
Tamanho: 231 MB
Status: ✅ Pronto para instalar


═══════════════════════════════════════════════════════════════════
PASSO 1: ABRA COMMAND PROMPT (CMD) NO SEU WINDOWS
═══════════════════════════════════════════════════════════════════

1. Pressione: Windows Key + R
2. Digite: cmd
3. Pressione: Enter


═══════════════════════════════════════════════════════════════════
PASSO 2: VERIFIQUE CONEXÃO ADB
═══════════════════════════════════════════════════════════════════

Cole no CMD:
```
adb devices
```

Você deve ver:
```
List of attached devices
XXXXXXXXXXXXXX    device
```

⚠️ Se não aparecer "device":
  - Certifique-se que seu celular está conectado via USB
  - Ative "USB Debugging" nas configurações do celular
  - Se solicitado, toque em "Confiar neste computador" no celular
  - Reconecte o USB
  - Digite novamente: adb devices


═══════════════════════════════════════════════════════════════════
PASSO 3: COPIAR APK PARA O CELULAR
═══════════════════════════════════════════════════════════════════

Cole no CMD:
```
cd C:\Users\DWOS\Desktop\AquariOS\aquarios-v2-complete\mobile
adb push android/app/build/outputs/apk/debug/app-debug.apk /sdcard/app-debug.apk
```

Você deve ver:
```
app-debug.apk: 1 file pushed. 100.0%
```


═══════════════════════════════════════════════════════════════════
PASSO 4: INSTALAR O APK
═══════════════════════════════════════════════════════════════════

Cole no CMD:
```
adb install /sdcard/app-debug.apk
```

Você deve ver:
```
Success
```

⚠️ Se houver erro "INSTALL_FAILED_ALREADY_EXISTS":
  Cole estes dois comandos:
  ```
  adb uninstall com.aquarios.app
  adb install /sdcard/app-debug.apk
  ```


═══════════════════════════════════════════════════════════════════
PASSO 5: ABRIR NO CELULAR
═══════════════════════════════════════════════════════════════════

Opção A (automático via CMD):
```
adb shell am start -n com.aquarios.app/com.aquarios.MainActivity
```

Opção B (manual):
1. Procure o ícone "AquariOS" na tela inicial do celular
2. Toque para abrir o app


═══════════════════════════════════════════════════════════════════
PASSO 6: TESTAR COMUNIDADES
═══════════════════════════════════════════════════════════════════

1. O app deve abrir com a tela inicial
2. Toque na tab "Comunidades" (👥 Social) na barra inferior
3. Você deve ver:
   - Tab "📰 Posts" (vazia se primeiro acesso)
   - Tab "👥 Helpers" (com helpers se houver dados)
   - Botão FAB verde (+) no canto inferior direito

4. Toque no botão + para criar um novo post
5. Preencha:
   - Título: "Tenho uma dúvida sobre saúde"
   - Conteúdo: "Estou sentindo muito cansaço nos últimos dias, o que fazer?"
6. Toque "Publicar"

✅ Se tudo funcionar, você verá o post aparecer na lista!


═══════════════════════════════════════════════════════════════════
PRÓXIMOS PASSOS
═══════════════════════════════════════════════════════════════════

📋 Siga o guia completo de testes:
   mobile/CELULAR_TEST_GUIDE_S15.md

Testes incluem:
  ✅ Criar posts
  ✅ Adicionar respostas
  ✅ Avaliar respostas (👎 👌 👍)
  ✅ Validar dados no Supabase
  ✅ Testar Edge Function
  ✅ Verificar categorização automática
  ✅ Testar rate limiting


═══════════════════════════════════════════════════════════════════
TROUBLESHOOTING
═══════════════════════════════════════════════════════════════════

❌ "adb: command not found"
  → Adicione adb ao PATH ou use o caminho completo:
     C:\Users\DWOS\AppData\Local\Android\Sdk\platform-tools\adb.exe devices

❌ "Rejected: forbidden"
  → Toque em "Confiar neste computador" no celular
  → Reconecte o USB

❌ "INSTALL_FAILED_INVALID_APK"
  → O APK pode estar corrompido
  → Tente recompilando: cd mobile/android && ./gradlew clean assembleDebug

❌ "INSTALL_FAILED_INSUFFICIENT_STORAGE"
  → Seu celular está sem espaço
  → Libere espaço e tente novamente


═══════════════════════════════════════════════════════════════════
DÚVIDAS DURANTE O TESTE?
═══════════════════════════════════════════════════════════════════

Para ver logs do aplicativo em tempo real:
```
adb logcat | grep -i aquarios
```

Para desinstalar se necessário:
```
adb uninstall com.aquarios.app
```

═══════════════════════════════════════════════════════════════════
