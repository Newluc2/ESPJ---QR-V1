@echo off
REM Script pour ajouter des utilisateurs de test

setlocal enabledelayedexpansion

echo.
echo 📋 Generateur d'Utilisateurs de Test
echo ====================================
echo.

REM Verifier si le serveur est lance
echo 🔍 Verification du serveur...
powershell -Command "try { $null = Invoke-WebRequest -Uri 'http://localhost:5000/api/health' -ErrorAction Stop; Write-Host '✅ Serveur actif' } catch { Write-Host '❌ Le serveur ne repond pas'; exit 1 }"

if errorlevel 1 (
    echo.
    echo Veuillez lancer: cd server ^&^& npm run dev
    pause
    exit /b 1
)

echo.
echo 🚀 Generation des utilisateurs...
echo.

REM Demander le token admin
set /p ADMIN_PASSWORD="🔐 Entrez le mot de passe admin: "

REM Login pour obtenir le token
echo 🔑 Obtention du token...
for /f "delims=" %%A in ('powershell -Command "Invoke-RestMethod -Uri 'http://localhost:5000/api/auth/login' -Method Post -Headers @{'Content-Type'='application/json'} -Body '{\"password\": \"%ADMIN_PASSWORD%\"}' | ConvertTo-Json | Select-String 'token' | ForEach-Object { $_ -replace '.*\"token\": \"' -replace '\".*' }"') do set TOKEN=%%A

if "!TOKEN!"=="" (
    echo ❌ Mot de passe incorrect
    pause
    exit /b 1
)

echo ✅ Token obtenu
echo.

REM Liste d'utilisateurs
set users[0]={"id":"10","firstName":"Anne","lastName":"Garcia","email":"anne@example.com","department":"Marketing"}
set users[1]={"id":"11","firstName":"Carlos","lastName":"Rodriguez","email":"carlos@example.com","department":"Sales"}
set users[2]={"id":"12","firstName":"Lisa","lastName":"Chen","email":"lisa@example.com","department":"IT"}
set users[3]={"id":"13","firstName":"Ahmed","lastName":"Hassan","email":"ahmed@example.com","department":"Operations"}
set users[4]={"id":"14","firstName":"Emma","lastName":"Wilson","email":"emma@example.com","department":"HR"}

set count=0
for /L %%i in (0,1,4) do (
    echo 📝 Ajout: !users[%%i]!
    powershell -Command "Invoke-RestMethod -Uri 'http://localhost:5000/api/admin/users' -Method Post -Headers @{'Content-Type'='application/json'; 'Authorization'='Bearer !TOKEN!'} -Body '!users[%%i]!'"
    set /a count+=1
    echo.
)

echo ===========================================
echo 🎉 !count! utilisateurs ajoutes avec succes
echo ===========================================
echo.
pause
