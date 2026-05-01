#!/bin/bash

# 🧹 Script de nettoyage du projet

echo "🧹 Nettoyage du projet Pointage QR..."
echo ""

# Nettoyer server
echo "📦 Nettoyage du serveur..."
cd server
rm -rf node_modules package-lock.json
echo "✅ Serveur nettoyé"

# Nettoyer client
echo "📦 Nettoyage du client..."
cd ../client
rm -rf node_modules package-lock.json dist .next
echo "✅ Client nettoyé"

echo ""
echo "🎉 Nettoyage terminé !"
echo ""
echo "Pour réinstaller:"
echo "  cd server && npm install && npm run init-sheets"
echo "  cd ../client && npm install"
