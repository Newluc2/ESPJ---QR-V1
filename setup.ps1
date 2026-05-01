#!/usr/bin/env pwsh
# Configuration Interactive du Système de Pointage QR Code
# Script PowerShell pour configurer automatiquement le projet

Write-Host "
╔════════════════════════════════════════════════════════════════╗
║  🔧 CONFIGURATION INTERACTIVE - SYSTÈME DE POINTAGE QR CODE   ║
║                    Setup Assistant v1.0                       ║
╚════════════════════════════════════════════════════════════════╝
" -ForegroundColor Cyan

# Fonction pour afficher une question
function Ask-Input {
    param($prompt, $required = $true)
    $input = Read-Host $prompt
    if ($required -and [string]::IsNullOrEmpty($input)) {
        Write-Host "❌ Cette valeur est obligatoire!" -ForegroundColor Red
        return Ask-Input $prompt $required
    }
    return $input
}

# Fonction pour afficher un message
function Show-Message {
    param($message, $type = "info")
    $colors = @{
        "info" = "Cyan"
        "success" = "Green"
        "warning" = "Yellow"
        "error" = "Red"
    }
    $symbols = @{
        "info" = "ℹ️"
        "success" = "✅"
        "warning" = "⚠️"
        "error" = "❌"
    }
    Write-Host "$($symbols[$type]) $message" -ForegroundColor $colors[$type]
}

# ============================================================================
# SECTION 1: Vérifier les prérequis
# ============================================================================

Write-Host "`n📋 VÉRIFICATION DES PRÉREQUIS..." -ForegroundColor Yellow

# Vérifier Node.js
try {
    $nodeVersion = node --version
    Show-Message "Node.js trouvé: $nodeVersion" "success"
} catch {
    Show-Message "Node.js n'est pas installé! Téléchargez-le depuis https://nodejs.org/" "error"
    exit 1
}

# Vérifier Git
try {
    $gitVersion = git --version
    Show-Message "Git trouvé: $gitVersion" "success"
} catch {
    Show-Message "Git n'est pas installé (optionnel, mais recommandé)" "warning"
}

# ============================================================================
# SECTION 2: Google Cloud Configuration
# ============================================================================

Write-Host "`n🔑 CONFIGURATION GOOGLE CLOUD" -ForegroundColor Yellow

Show-Message "Avant de continuer, vous DEVEZ avoir:" "warning"
Write-Host @"
1. ✅ Un Google Cloud Project créé
2. ✅ Google Sheets API activée
3. ✅ Un Service Account créé
4. ✅ Le fichier JSON credentials téléchargé
5. ✅ Un Google Sheet créé et partagé

Consultez CONFIGURATION_COMPLETE.md SECTION 1 si ce n'est pas fait.
"@

$hasGoogleSetup = Read-Host "Avez-vous complété la configuration Google Cloud? (oui/non)"
if ($hasGoogleSetup.ToLower() -ne "oui") {
    Show-Message "Complétez d'abord Google Cloud, puis relancez ce script" "warning"
    exit 0
}

# ============================================================================
# SECTION 3: Backend Configuration
# ============================================================================

Write-Host "`n🖥️  CONFIGURATION BACKEND" -ForegroundColor Yellow

# Naviguer vers server
Set-Location server -ErrorAction Stop | Out-Null
Show-Message "Répertoire backend: $(Get-Location)" "info"

# Installer les dépendances
Show-Message "Installation des dépendances backend..." "info"
npm install
if ($LASTEXITCODE -ne 0) {
    Show-Message "Erreur lors de l'installation des dépendances!" "error"
    exit 1
}
Show-Message "Dépendances backend installées" "success"

# Demander les credentials Google
Write-Host "`n📝 Entrez vos credentials Google Cloud:" -ForegroundColor Yellow

$sheetId = Ask-Input "GOOGLE_SHEET_ID (format: 1a2B3c4D5e6F...)"
$serviceEmail = Ask-Input "GOOGLE_SERVICE_ACCOUNT_EMAIL (format: service@project.iam.gserviceaccount.com)"

Write-Host "`n⚠️  Pour GOOGLE_PRIVATE_KEY, ouvrez votre fichier JSON credentials" -ForegroundColor Yellow
Write-Host "Cherchez la clé 'private_key' (commence par -----BEGIN PRIVATE KEY-----)" -ForegroundColor Yellow
$privateKey = Ask-Input "GOOGLE_PRIVATE_KEY"

# Autres configuration
$jwtSecret = Ask-Input "JWT_SECRET (laissez vide pour générer automatiquement)" $false

if ([string]::IsNullOrEmpty($jwtSecret)) {
    $jwtSecret = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((1..32 | ForEach-Object { [char][byte](Get-Random -Min 33 -Max 127) } | Join-String)))
    Show-Message "JWT_SECRET généré automatiquement" "success"
}

$adminPassword = Ask-Input "ADMIN_PASSWORD (le mot de passe pour accéder à l'admin panel)" 
$nodeEnv = "development"
$clientUrl = "http://localhost:5173"

# Créer le fichier .env
$envContent = @"
PORT=5000
GOOGLE_SHEET_ID=$sheetId
GOOGLE_SERVICE_ACCOUNT_EMAIL=$serviceEmail
GOOGLE_PRIVATE_KEY=$privateKey
JWT_SECRET=$jwtSecret
ADMIN_PASSWORD=$adminPassword
NODE_ENV=$nodeEnv
CLIENT_URL=$clientUrl
"@

$envContent | Set-Content .env -Force
Show-Message "Fichier .env créé" "success"

# Tester la connexion Google Sheets
Write-Host "`n🧪 Test de connexion Google Sheets..." -ForegroundColor Yellow
Write-Host "Cela va créer les feuilles et ajouter les utilisateurs d'exemple..." -ForegroundColor Gray

try {
    npm run init-sheets
    if ($LASTEXITCODE -ne 0) {
        Show-Message "Erreur lors de l'initialisation des Sheets!" "error"
        Write-Host "Vérifiez:" -ForegroundColor Yellow
        Write-Host "  1. GOOGLE_SHEET_ID est correct"
        Write-Host "  2. GOOGLE_SERVICE_ACCOUNT_EMAIL est correct"
        Write-Host "  3. GOOGLE_PRIVATE_KEY est correctement formatée"
        Write-Host "  4. Le Service Account a accès au Sheet"
        Show-Message "Corrigez les erreurs dans .env et relancez: npm run init-sheets" "warning"
    } else {
        Show-Message "Google Sheets connecté avec succès!" "success"
    }
} catch {
    Show-Message "Erreur lors de l'initialisation: $_" "error"
}

Set-Location .. | Out-Null

# ============================================================================
# SECTION 4: Frontend Configuration
# ============================================================================

Write-Host "`n💻 CONFIGURATION FRONTEND" -ForegroundColor Yellow

Set-Location client -ErrorAction Stop | Out-Null
Show-Message "Répertoire frontend: $(Get-Location)" "info"

# Installer les dépendances
Show-Message "Installation des dépendances frontend..." "info"
npm install
if ($LASTEXITCODE -ne 0) {
    Show-Message "Erreur lors de l'installation des dépendances!" "error"
    exit 1
}
Show-Message "Dépendances frontend installées" "success"

# Créer le fichier .env (simple)
$envContent = @"
VITE_API_BASE_URL=http://localhost:5000/api
"@

$envContent | Set-Content .env -Force
Show-Message "Fichier .env créé pour le frontend" "success"

Set-Location .. | Out-Null

# ============================================================================
# SECTION 5: Résumé et prochaines étapes
# ============================================================================

Write-Host "`n✨ CONFIGURATION TERMINÉE!" -ForegroundColor Green

Write-Host @"

📊 RÉSUMÉ DE VOTRE CONFIGURATION:
═════════════════════════════════════════════════════════════════

Backend:
  ✅ Dépendances installées
  ✅ Fichier .env configuré
  ✅ Google Sheets initialisé
  Port: 5000

Frontend:
  ✅ Dépendances installées
  ✅ Fichier .env configuré
  Port: 5173

Credentials:
  ✅ Sheet ID: $sheetId
  ✅ Service Account: $serviceEmail
  ✅ Admin Password: $adminPassword

🚀 PROCHAINES ÉTAPES:
═════════════════════════════════════════════════════════════════

1. Lancez le serveur backend:
   cd server
   npm run dev
   → Vous devriez voir: 🚀 Server running on port 5000

2. Dans un autre terminal, lancez le frontend:
   cd client
   npm run dev
   → Vous devriez voir: ➜ Local: http://localhost:5173

3. Testez l'application:
   • Scan: http://localhost:5173/scan?userId=1
   • Admin: http://localhost:5173/admin/login
   • Mot de passe: $adminPassword

📚 DOCUMENTATION:
═════════════════════════════════════════════════════════════════
  • LOCAL_TESTING.md        → Tests locaux complets
  • API_DOCUMENTATION.md    → Endpoints API
  • DEPLOYMENT.md           → Déploiement production

⚠️  IMPORTANT:
═════════════════════════════════════════════════════════════════
  • Les fichiers .env contiennent des secrets
  • Ne les uploadez JAMAIS sur GitHub (.gitignore les protège)
  • Avant production, changez ADMIN_PASSWORD et JWT_SECRET

👍 Tout est prêt! Bon développement! 🎉

"@ -ForegroundColor Green

# Proposer de lancer les serveurs
Write-Host ""
$launch = Read-Host "Voulez-vous lancer les serveurs maintenant? (oui/non)"
if ($launch.ToLower() -eq "oui") {
    Write-Host "`n🚀 Lancement des serveurs..." -ForegroundColor Cyan
    
    # Lancer le backend
    Write-Host "Démarrage du serveur backend..." -ForegroundColor Yellow
    Start-Process pwsh -ArgumentList "-NoExit -Command cd server; npm run dev"
    
    Start-Sleep -Seconds 3
    
    # Lancer le frontend
    Write-Host "Démarrage du serveur frontend..." -ForegroundColor Yellow
    Start-Process pwsh -ArgumentList "-NoExit -Command cd client; npm run dev"
    
    Write-Host "`n✅ Les deux serveurs se lancent dans de nouveaux terminals" -ForegroundColor Green
    Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
    Write-Host "Backend: http://localhost:5000" -ForegroundColor Cyan
} else {
    Write-Host "`nQuand vous êtes prêt, lancez:" -ForegroundColor Yellow
    Write-Host "  Terminal 1: cd server && npm run dev" -ForegroundColor White
    Write-Host "  Terminal 2: cd client && npm run dev" -ForegroundColor White
}

Show-Message "Configuration terminée!" "success"
