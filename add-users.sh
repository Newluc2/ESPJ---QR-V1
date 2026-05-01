#!/bin/bash

# 📋 Script pour générer des utilisateurs de test

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "📋 Générateur d'Utilisateurs de Test"
echo "===================================="
echo ""

# Vérifier si le serveur est lancé
echo "🔍 Vérification du serveur..."
response=$(curl -s http://localhost:5000/api/health)

if [[ $response == *"OK"* ]]; then
    echo -e "${GREEN}✅ Serveur actif${NC}"
else
    echo -e "${RED}❌ Le serveur ne répond pas${NC}"
    echo "Veuillez lancer: cd server && npm run dev"
    exit 1
fi

echo ""
echo "🚀 Génération des utilisateurs..."
echo ""

# Liste d'utilisateurs à ajouter
declare -a users=(
    '{"id":"10","firstName":"Anne","lastName":"Garcia","email":"anne@example.com","department":"Marketing"}'
    '{"id":"11","firstName":"Carlos","lastName":"Rodriguez","email":"carlos@example.com","department":"Sales"}'
    '{"id":"12","firstName":"Lisa","lastName":"Chen","email":"lisa@example.com","department":"IT"}'
    '{"id":"13","firstName":"Ahmed","lastName":"Hassan","email":"ahmed@example.com","department":"Operations"}'
    '{"id":"14","firstName":"Emma","lastName":"Wilson","email":"emma@example.com","department":"HR"}'
)

# Demander le token admin
read -sp "🔐 Entrez le mot de passe admin: " ADMIN_PASSWORD
echo ""

# Login pour obtenir le token
echo "🔑 Obtention du token..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"password\": \"$ADMIN_PASSWORD\"}")

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ Mot de passe incorrect${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Token obtenu${NC}"
echo ""

# Ajouter les utilisateurs
count=0
for user in "${users[@]}"; do
    echo "📝 Ajout: $user"
    
    RESPONSE=$(curl -s -X POST http://localhost:5000/api/admin/users \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -d "$user")
    
    if echo $RESPONSE | grep -q '"success":true'; then
        echo -e "${GREEN}✅ Utilisateur ajouté${NC}"
        ((count++))
    else
        echo -e "${YELLOW}⚠️  Erreur: $RESPONSE${NC}"
    fi
    echo ""
done

echo "==========================================="
echo -e "${GREEN}🎉 $count utilisateurs ajoutés avec succès${NC}"
echo "==========================================="
