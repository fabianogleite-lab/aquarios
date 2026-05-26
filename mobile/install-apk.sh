#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
# SCRIPT DE INSTALAÇÃO DO APK NO CELULAR (Bash/Linux/Mac)
# ═══════════════════════════════════════════════════════════════════

set -e

APK_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/android/app/build/outputs/apk/debug/app-debug.apk"
PACKAGE_NAME="com.aquarios.app"

echo "═══════════════════════════════════════════════════════════════════"
echo "INSTALACAO APK — AquariOS S15 Comunidades"
echo "═══════════════════════════════════════════════════════════════════"
echo ""

# PASSO 1: Verificar se APK existe
if [ ! -f "$APK_PATH" ]; then
    echo "❌ ERRO: APK não encontrado em:"
    echo "   $APK_PATH"
    echo ""
    echo "Verifique se o build foi executado:"
    echo "   cd mobile/android"
    echo "   ./gradlew assembleDebug"
    exit 1
fi

echo "✅ APK encontrado: $APK_PATH"
echo ""

# PASSO 2: Verificar conexão ADB
echo "Verificando conexão ADB..."
if ! adb devices | grep -q "device"; then
    echo "❌ ERRO: Nenhum dispositivo conectado via ADB"
    echo ""
    echo "Verifique:"
    echo "   1. Celular conectado via USB"
    echo "   2. USB Debugging ativado"
    echo "   3. Autorização confirmada no celular"
    echo ""
    echo "Tente reconectar:"
    echo "   adb kill-server"
    echo "   adb devices"
    exit 1
fi

echo "✅ Dispositivo ADB conectado"
echo ""

# PASSO 3: Verificar se app já está instalado
echo "Verificando instalação anterior..."
if adb shell pm list packages | grep -q "$PACKAGE_NAME"; then
    echo "⚠️  Aplicativo já está instalado. Desinstalando versão anterior..."
    adb uninstall "$PACKAGE_NAME" > /dev/null 2>&1
    sleep 2
fi

echo ""

# PASSO 4: Copiar APK para o celular
echo "📤 Copiando APK para o celular..."
adb push "$APK_PATH" /sdcard/app-debug.apk

echo "✅ APK copiado com sucesso"
echo ""

# PASSO 5: Instalar APK
echo "📲 Instalando APK..."
adb install /sdcard/app-debug.apk

echo "✅ APK instalado com sucesso!"
echo ""

# PASSO 6: Opcionalmente abrir o app
read -p "Deseja abrir o aplicativo agora? (s/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
    echo "🚀 Abrindo AquariOS..."
    adb shell am start -n "$PACKAGE_NAME/com.aquarios.MainActivity"
    sleep 2
fi

echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo "✅ INSTALAÇÃO CONCLUÍDA COM SUCESSO!"
echo "═══════════════════════════════════════════════════════════════════"
echo ""
echo "Próximos passos:"
echo "   1. Abra o app no celular (toque no ícone AquariOS)"
echo "   2. Navegue para aba \"Comunidades\" (👥 Social)"
echo "   3. Siga o guia de testes: CELULAR_TEST_GUIDE_S15.md"
echo ""
