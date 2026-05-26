═══════════════════════════════════════════════════════════════════
INSTALAÇÃO APK — GUIA PASSO A PASSO
═══════════════════════════════════════════════════════════════════

PRÉ-REQUISITOS
═══════════════════════════════════════════════════════════════════
✅ Android Debug Bridge (ADB) instalado
✅ Celular conectado via USB com debugging ativado
✅ APK gerado em: mobile/android/app/build/outputs/apk/debug/app-debug.apk

PASSO 1: VERIFICAR CONEXÃO ADB
───────────────────────────────────────────────────────────────────
```bash
adb devices
```

Saída esperada:
```
List of attached devices
XXXXXXXXXXXXXX    device
```

Status: CONECTADO (aguardando APK)


PASSO 2: COPIAR APK PARA O CELULAR
───────────────────────────────────────────────────────────────────
```bash
adb push "C:\Users\DWOS\Desktop\AquariOS\aquarios-v2-complete\mobile\android\app\build\outputs\apk\debug\app-debug.apk" /sdcard/app-debug.apk
```

Saída esperada:
```
app-debug.apk: 1 file pushed.
```


PASSO 3: INSTALAR APK
───────────────────────────────────────────────────────────────────
```bash
adb install /sdcard/app-debug.apk
```

Saída esperada:
```
Success
```

Se houver erro "INSTALL_FAILED_ALREADY_EXISTS":
```bash
adb uninstall com.aquarios.app
adb install /sdcard/app-debug.apk
```


PASSO 4: ABRIR APP NO CELULAR
───────────────────────────────────────────────────────────────────
```bash
adb shell am start -n com.aquarios.app/com.aquarios.MainActivity
```

Ou manualmente: Toque no ícone "AquariOS" na tela inicial


PASSO 5: VERIFICAR INSTALAÇÃO
───────────────────────────────────────────────────────────────────
```bash
adb shell pm list packages | grep aquarios
```

Saída esperada:
```
package:com.aquarios.app
```


═══════════════════════════════════════════════════════════════════
TROUBLESHOOTING
═══════════════════════════════════════════════════════════════════

❌ "Rejected: forbidden" (USB connection denied)
  → Verifique se confirmou a autorização no celular
  → Desconecte e reconecte o USB
  → Retire o app.properties de build

❌ INSTALL_FAILED_INVALID_APK
  → APK pode estar corrompido
  → Limpe cache: adb shell pm clear-cache-files
  → Recrie o APK: ./gradlew assembleDebug

❌ INSTALL_FAILED_PERMISSION_DENIED
  → Celular pode ter espaço insuficiente
  → Libere espaço: adb shell rm -rf /data/cache/*
  → Ou use: adb install -r (force-reinstall)


═══════════════════════════════════════════════════════════════════
PRÓXIMOS PASSOS APÓS INSTALAÇÃO
═══════════════════════════════════════════════════════════════════

1. ✅ Abra o app no celular
2. ✅ Vá para tab "Comunidades" (👥 Social)
3. ✅ Teste: Criar post, responder, avaliar
4. ✅ Verifique dados no Supabase dashboard
5. ✅ Rode testes da lista: CELULAR_TEST_GUIDE.md

═══════════════════════════════════════════════════════════════════
