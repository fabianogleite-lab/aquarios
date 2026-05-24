@echo off
REM ═══════════════════════════════════════════════════════════════════
REM SCRIPT DE INSTALAÇÃO DO APK NO CELULAR
REM ═══════════════════════════════════════════════════════════════════

setlocal enabledelayedexpansion

REM Configurações
set APK_PATH=%~dp0android\app\build\outputs\apk\debug\app-debug.apk
set PACKAGE_NAME=com.aquarios.app

echo ═══════════════════════════════════════════════════════════════════
echo INSTALACAO APK — AquariOS S15 Comunidades
echo ═══════════════════════════════════════════════════════════════════
echo.

REM PASSO 1: Verificar se APK existe
if not exist "%APK_PATH%" (
    echo ❌ ERRO: APK não encontrado em:
    echo    %APK_PATH%
    echo.
    echo Verifique se o build foi executado:
    echo   cd mobile/android
    echo   ./gradlew assembleDebug
    pause
    exit /b 1
)

echo ✅ APK encontrado: %APK_PATH%
echo.

REM PASSO 2: Verificar conexão ADB
echo Verificando conexão ADB...
adb devices | find /i "device" >nul 2>&1

if errorlevel 1 (
    echo ❌ ERRO: Nenhum dispositivo conectado via ADB
    echo.
    echo Verifique:
    echo   1. Celular conectado via USB
    echo   2. USB Debugging ativado
    echo   3. Autorização confirmada no celular
    echo.
    echo Tente reconectar:
    echo   adb kill-server
    echo   adb devices
    pause
    exit /b 1
)

echo ✅ Dispositivo ADB conectado
echo.

REM PASSO 3: Verificar se app já está instalado
echo Verificando instalação anterior...
adb shell pm list packages | find /i "%PACKAGE_NAME%" >nul 2>&1

if not errorlevel 1 (
    echo ⚠️  Aplicativo já está instalado. Desinstalando versão anterior...
    adb uninstall %PACKAGE_NAME% >nul 2>&1
    timeout /t 2 /nobreak >nul
)

echo.

REM PASSO 4: Copiar APK para o celular
echo 📤 Copiando APK para o celular...
adb push "%APK_PATH%" /sdcard/app-debug.apk

if errorlevel 1 (
    echo ❌ ERRO ao copiar APK
    pause
    exit /b 1
)

echo ✅ APK copiado com sucesso
echo.

REM PASSO 5: Instalar APK
echo 📲 Instalando APK...
adb install /sdcard/app-debug.apk

if errorlevel 1 (
    echo ❌ ERRO ao instalar APK
    echo.
    echo Possíveis causas:
    echo   - Espaço insuficiente no celular
    echo   - APK corrompido
    echo   - Versão incompatível
    pause
    exit /b 1
)

echo ✅ APK instalado com sucesso!
echo.

REM PASSO 6: Opcionalmente abrir o app
echo Deseja abrir o aplicativo agora? (S/N)
set /p OPEN_APP=

if /i "%OPEN_APP%"=="S" (
    echo 🚀 Abrindo AquariOS...
    adb shell am start -n %PACKAGE_NAME%/com.aquarios.MainActivity
    timeout /t 2 /nobreak >nul
)

echo.
echo ═══════════════════════════════════════════════════════════════════
echo ✅ INSTALAÇÃO CONCLUÍDA COM SUCESSO!
echo ═══════════════════════════════════════════════════════════════════
echo.
echo Próximos passos:
echo   1. Abra o app no celular (toque no ícone AquariOS)
echo   2. Navegue para aba "Comunidades" (👥 Social)
echo   3. Siga o guia de testes: CELULAR_TEST_GUIDE_S15.md
echo.
pause
