@echo off
REM Script para fazer deploy da Edge Function do Supabase

echo ========================================
echo AquariOS - Deploy Edge Function Chat
echo ========================================
echo.

REM 1. Login no Supabase
echo [1/3] Fazendo login no Supabase...
echo (Uma janela do navegador vai abrir)
echo.
call supabase login
echo.

REM 2. Deploy da função
echo [2/3] Deployando Edge Function 'chat'...
call supabase functions deploy chat --project-ref agebsmjsjrmazbozphnh
echo.

REM 3. Confirmar sucesso
echo [3/3] Deploy finalizado!
echo.
echo ========================================
echo ✓ ProteOS Chat Edge Function está online!
echo ========================================
echo.
pause
