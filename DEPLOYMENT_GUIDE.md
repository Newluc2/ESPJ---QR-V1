# Guide de Déploiement - ESPJ QR V1 Sécurisé

## 📋 Checklist Pré-Déploiement

### 1. Configuration Environnement
- [ ] `DEVICE_SECRET` - Générer 32 chars aléatoires
- [ ] `QR_SECRET` - Générer 32 chars aléatoires
- [ ] `ADMIN_NAME` - Définir le nom de l'admin
- [ ] `LOG_LEVEL` - Definir à `info` ou `warn`
- [ ] `NODE_ENV` - Définir à `production`

```bash
# Générer secrets forts
openssl rand -hex 16  # 32 chars en hex
```

### 2. Installation Dépendances
```bash
# Backend
cd server
npm install
npm audit fix --force  # Fixer les vulnérabilités

# Frontend
cd ../client
npm install
```

### 3. Variables d'Environnement
```bash
# server/.env
DEVICE_SECRET=<generated>
QR_SECRET=<generated>
ADMIN_NAME=Admin
LOG_LEVEL=info
NODE_ENV=production
CLIENT_URL=https://your-domain.com

# Google Sheets (existant)
GOOGLE_SHEET_ID=...
GOOGLE_SERVICE_ACCOUNT_EMAIL=...
GOOGLE_PRIVATE_KEY=...
```

### 4. Démarrage
```bash
# Terminal 1 - Backend
cd server
npm run dev  # ou npm start pour production

# Terminal 2 - Frontend
cd client
npm run dev  # ou npm run build pour production
```

## 🔍 Vérification Post-Déploiement

### Logs
```bash
# Vérifier que les logs sont créés
ls -la server/logs/
tail -f server/logs/combined.log  # Vérifier les events
tail -f server/logs/error.log     # Vérifier les erreurs
```

### Health Check
```bash
curl http://localhost:5000/api/health
# {"status":"OK","message":"Server is running","timestamp":"..."}
```

### Tests Authentification
```bash
# Test login valide
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Admin","lastName":"User"}'

# Response: {"success":true,"deviceToken":"...","user":{...},"expiresAt":"..."}

# Test rate limit (5e+ tentative dans la fenêtre)
# Response: 429 Too Many Requests
```

### Vérification Headers Sécurité
```bash
curl -i http://localhost:5000/api/health
# Vérifier présence:
# X-Frame-Options: DENY
# X-Content-Type-Options: nosniff
# X-XSS-Protection: 1; mode=block
# Content-Security-Policy: ...
# Referrer-Policy: no-referrer
```

### Tests Endpoints Bloqués
```bash
curl http://localhost:5000/api/users       # 404
curl http://localhost:5000/api/users/123   # 404
# ✅ Enumération empêchée
```

## 📊 Monitoring Logs

### Important Events à Surveiller
```
LOGIN_SUCCESS   - Connexion réussie
LOGIN_FAILED    - Tentative échouée
AUTH_RATE_LIMIT - Brute-force détecté
ATTENDANCE_     - Pointage ou erreur
ADMIN_          - Action admin (qrcode, add user)
ENUMERATION_    - Tentative énumération
```

### Alertes Recommandées
- [ ] > 5 LOGIN_FAILED de la même IP en 15 min
- [ ] > 5 ENUMERATION_ATTEMPT en 10 min
- [ ] Quelconque ADMIN_ action en !ADMIN_NAME
- [ ] ERROR events

## 🔐 Production Hardening

### Nginx (reverse proxy)
```nginx
server {
  listen 443 ssl http2;
  server_name your-domain.com;
  
  # SSL/TLS
  ssl_certificate /path/to/cert.pem;
  ssl_certificate_key /path/to/key.pem;
  ssl_protocols TLSv1.3 TLSv1.2;
  ssl_ciphers HIGH:!aNULL:!MD5;
  ssl_prefer_server_ciphers on;
  
  # Security headers
  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
  add_header X-Content-Type-Options "nosniff" always;
  add_header X-Frame-Options "DENY" always;
  
  # API proxy
  location /api {
    proxy_pass http://localhost:5000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

### Docker
```dockerfile
# Dockerfile.server
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY src ./src
EXPOSE 5000
CMD ["npm", "start"]
```

```docker-compose.yml
version: '3.8'
services:
  api:
    build:
      context: ./server
      dockerfile: Dockerfile
    environment:
      - NODE_ENV=production
      - DEVICE_SECRET=${DEVICE_SECRET}
      - QR_SECRET=${QR_SECRET}
      - ADMIN_NAME=${ADMIN_NAME}
    ports:
      - "5000:5000"
    volumes:
      - ./server/logs:/app/logs
    restart: unless-stopped
    
  web:
    build:
      context: ./client
      dockerfile: Dockerfile
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./client/nginx.conf:/etc/nginx/conf.d/default.conf
    depends_on:
      - api
    restart: unless-stopped
```

## 📈 Métriques de Sécurité

### Avant Fixes
- **Risk Score**: 9/10
- **CVSS Vector**: CRITICAL
- **Attack Surface**: 100%
- **Audit Trail**: None
- **Vulnérabilités**: 20

### Après Fixes (Cible)
- **Risk Score**: 4/10
- **CVSS Vector**: MEDIUM
- **Attack Surface**: 30%
- **Audit Trail**: Complete + Persistent
- **Vulnérabilités**: 3 (mitigated)

## ⚠️ Notes Importantes

1. **Secrets**: Ne commitez jamais `.env` en production
2. **DEVICE_SECRET/QR_SECRET**: Changez-les régulièrement (implique logout des users)
3. **Logs**: Configurez une sauvegarde/archivage (ELK, CloudWatch, etc)
4. **Rate Limits**: Ajustez selon votre charge (voir `middleware/rateLimiter.js`)
5. **CSP**: Testez la CSP en mode `report-only` avant production
6. **Race Condition**: À améliorer avec transaction DB ou Redis lock
7. **Timing Attacks**: À implémenter avec `crypto.timingSafeEqual`

## 📞 Support

Pour toute question de sécurité, consultez:
- `SECURITY_FIXES_SUMMARY.md` - Documentation technique
- `report.md` - Analyse complète des vulnérabilités
- Server logs: `server/logs/combined.log` et `error.log`

---

**Last Updated**: 2026-05-05
**Système**: ESPJ-QR-V1
**Version**: 1.0 (Sécurisée)
