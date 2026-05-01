@echo off
REM Script de démarrage rapide pour Windows

echo.
echo 🚀 Demarrage du Systeme de Pointage QR Code...
echo.

REM Verifier Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo ❌ Node.js n'est pas installe
    pause
    exit /b 1
)

echo ✅ Node.js installe : 
node --version

REM Demarrer le serveur
echo.
echo 📦 Demarrage du serveur...
cd server

if not exist "node_modules" (
    echo 📥 Installation des dependances serveur...
    call npm install
)

if not exist ".env" (
    echo ⚠️  Creation du fichier .env...
    copy .env.example .env
    echo 📝 Fichier .env cree - veuillez le configurer
)

echo.
echo ⏳ Demarrage du serveur...
start "Serveur Pointage QR" cmd /k npm run dev

REM Attendre un peu
timeout /t 3 /nobreak

REM Demarrer le client
echo.
echo 🎨 Demarrage du client...
cd ..\client

if not exist "node_modules" (
    echo 📥 Installation des dependances client...
    call npm install
)

echo.
echo ⏳ Demarrage du client...
start "Client Pointage QR" cmd /k npm run dev

echo.
echo 🎉 Application prete !
echo.
echo 📱 Frontend  : http://localhost:5173
echo 🔌 Backend   : http://localhost:5000
echo 👤 Admin     : http://localhost:5173/admin/login
echo 📸 Scan QR   : http://localhost:5173/scan?userId=1
echo.
