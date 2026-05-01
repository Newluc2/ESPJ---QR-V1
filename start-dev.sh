#!/bin/bash

# Script de démarrage rapide pour le développement

echo "🚀 Démarrage du Système de Pointage QR Code..."

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé"
    exit 1
fi

echo "✅ Node.js installé : $(node --version)"

# Démarrer le serveur
echo ""
echo "📦 Démarrage du serveur..."
cd server

if [ ! -d "node_modules" ]; then
    echo "📥 Installation des dépendances serveur..."
    npm install
fi

# Créer .env s'il n'existe pas
if [ ! -f ".env" ]; then
    echo "⚠️  Créez le fichier .env dans le dossier server"
    cp .env.example .env
    echo "📝 Fichier .env créé - veuillez le configurer"
fi

npm run dev &
SERVER_PID=$!

# Attendre le démarrage du serveur
echo "⏳ Attente du démarrage du serveur..."
sleep 3

# Démarrer le client
echo ""
echo "🎨 Démarrage du client..."
cd ../client

if [ ! -d "node_modules" ]; then
    echo "📥 Installation des dépendances client..."
    npm install
fi

npm run dev &
CLIENT_PID=$!

echo ""
echo "🎉 Application prête !"
echo ""
echo "📱 Frontend  : http://localhost:5173"
echo "🔌 Backend   : http://localhost:5000"
echo "👤 Admin     : http://localhost:5173/admin/login"
echo "📸 Scan QR   : http://localhost:5173/scan?userId=1"
echo ""
echo "⚠️  Appuyez sur Ctrl+C pour arrêter"
echo ""

# Garder les processus actifs
wait $SERVER_PID $CLIENT_PID
