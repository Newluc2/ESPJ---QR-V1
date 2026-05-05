#!/bin/bash
# Setup script pour les nouvelles variables d'environnement de sécurité

echo "=== Configuration Sécurité - ESPJ QR V1 ==="
echo ""
echo "Les variables d'environnement suivantes DOIVENT être configurées:"
echo ""
echo "1. DEVICE_SECRET - Secret pour la génération des device tokens (min 32 chars)"
DEVICE_SECRET=$(openssl rand -hex 16 || base64 /dev/urandom | head -c32)
echo "   Suggestion: $DEVICE_SECRET"
echo ""

echo "2. QR_SECRET - Secret pour les tokens JWT dans les QR codes (min 32 chars)"
QR_SECRET=$(openssl rand -hex 16 || base64 /dev/urandom | head -c32)
echo "   Suggestion: $QR_SECRET"
echo ""

echo "3. ADMIN_NAME - Nom de l'administrateur (par défaut: Admin)"
echo "   Exemple: Admin"
echo ""

echo "Ajoutez ces valeurs dans votre fichier .env:"
echo ""
echo "DEVICE_SECRET=$DEVICE_SECRET"
echo "QR_SECRET=$QR_SECRET"
echo "ADMIN_NAME=Admin"
echo ""

echo "=== Changelog des Sécurité ==="
echo ""
echo "✅ Système d'authentification refactorisé (deviceTokens)"
echo "✅ Rate limiting global + par endpoint"
echo "✅ Validation stricte des entrées (Zod schemas)"
echo "✅ Logging structuré et audit trail (Winston)"
echo "✅ Headers de sécurité (Helmet + CSP)"
echo "✅ CSRF protection (SameSite strict)"
echo "✅ Endpoints d'énumération bloqués"
echo "✅ Protections contra brute-force"
echo ""

echo "=== Installation ==="
echo "cd server && npm install"
echo "cd ../client && npm install"
echo ""

echo "=== Démarrage ==="
echo "cd server && npm run dev"
echo "# Dans un autre terminal:"
echo "cd client && npm run dev"
echo ""

echo "=== Important ==="
echo "⚠️  Changez les DEVICE_SECRET et QR_SECRET par des valeurs aléatoires fortes"
echo "⚠️  Ne committez JAMAIS le .env en production"
echo "⚠️  Vérifiez que les logs sont écrits dans /server/logs/"
echo ""
