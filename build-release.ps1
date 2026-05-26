# AquariOS — Build local + GitHub Release
# Uso: .\build-release.ps1 -version "4.4.0" -notes "Descricao do release"

param(
    [string]$version = "",
    [string]$notes = "Nova versao do AquariOS"
)

$JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
$ANDROID_HOME = "C:\Users\DWOS\AppData\Local\Android\Sdk"
$env:JAVA_HOME = $JAVA_HOME
$env:ANDROID_HOME = $ANDROID_HOME
$env:PATH = "$JAVA_HOME\bin;$ANDROID_HOME\platform-tools;$ANDROID_HOME\build-tools\37.0.0;$env:PATH"

$MOBILE_DIR = "$PSScriptRoot\mobile"
$ANDROID_DIR = "$MOBILE_DIR\android"

Write-Host "`n🔧 AquariOS Build Release" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan

# Pegar versão do app.json se não informada
if (-not $version) {
    $appJson = Get-Content "$MOBILE_DIR\app.json" | ConvertFrom-Json
    $version = $appJson.expo.version
}

Write-Host "📦 Versao: $version" -ForegroundColor Yellow

# Step 1: Prebuild
Write-Host "`n[1/4] Gerando projeto Android nativo..." -ForegroundColor Green
Set-Location $MOBILE_DIR
npx expo prebuild --platform android --clean 2>&1 | Tail -20

# Step 2: Build APK
Write-Host "`n[2/4] Compilando APK..." -ForegroundColor Green
Set-Location $ANDROID_DIR
.\gradlew.bat assembleRelease 2>&1 | Select-String -Pattern "BUILD|error|warning|apk" | Select-Object -Last 20

# Step 3: Verificar APK gerado
$apkPath = "$ANDROID_DIR\app\build\outputs\apk\release\app-release.apk"
if (-not (Test-Path $apkPath)) {
    Write-Host "❌ APK nao encontrado em $apkPath" -ForegroundColor Red
    exit 1
}

$apkSize = [math]::Round((Get-Item $apkPath).Length / 1MB, 1)
Write-Host "`n✅ APK gerado: $apkSize MB" -ForegroundColor Green

# Renomear APK
$apkName = "AquariOS-v$version.apk"
$apkDest = "$PSScriptRoot\releases\$apkName"
New-Item -ItemType Directory -Force -Path "$PSScriptRoot\releases" | Out-Null
Copy-Item $apkPath $apkDest
Write-Host "📁 APK salvo em: releases\$apkName" -ForegroundColor Green

# Step 4: GitHub Release
Write-Host "`n[4/4] Criando GitHub Release..." -ForegroundColor Green
Set-Location $PSScriptRoot

$tagName = "v$version"
gh release create $tagName $apkDest `
    --title "AquariOS $tagName" `
    --notes $notes `
    --latest

Write-Host "`n🚀 Release publicado!" -ForegroundColor Cyan
Write-Host "Link: https://github.com/fabianogleite-lab/aquarios/releases/tag/$tagName" -ForegroundColor Yellow
