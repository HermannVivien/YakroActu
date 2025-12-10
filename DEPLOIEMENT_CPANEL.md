# ========================================

# GUIDE DE DÉPLOIEMENT cPANEL

# YakroActu - Backend Node.js + Prisma

# ========================================

## 📋 PRÉREQUIS

1. **Compte cPanel avec Node.js activé**

   - Node.js 18+ (vérifier dans cPanel > Setup Node.js App)
   - MySQL 8.0+
   - Accès SSH (recommandé)
   - Certificat SSL actif

2. **Outils locaux**
   - Git
   - Node.js 18+
   - npm ou yarn

## 🗂️ STRUCTURE FINALE SUR cPANEL

```
~/
├── public_html/
│   ├── api/                    # ← Backend Node.js (ce dossier)
│   │   ├── index.js           # Point d'entrée Passenger
│   │   ├── server.js
│   │   ├── package.json
│   │   ├── .env               # Variables d'environnement
│   │   ├── prisma/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── uploads/           # Fichiers uploadés
│   │   └── node_modules/
│   │
│   ├── admin/                  # React Admin (build)
│   │   ├── index.html
│   │   ├── assets/
│   │   └── ...
│   │
│   └── .htaccess              # Redirections

```

## 🚀 ÉTAPE 1 : PRÉPARER LA BASE DE DONNÉES MySQL

### Via cPanel > MySQL Databases

1. **Créer la base de données**

   - Nom : `username_yakroactu`

2. **Créer un utilisateur**

   - User : `username_yakro`
   - Password : (générer un mot de passe fort)

3. **Assigner les privilèges**

   - Cocher : ALL PRIVILEGES
   - Cliquer : "Make Changes"

4. **Noter les informations**
   ```
   Host: localhost
   Database: username_yakroactu
   User: username_yakro
   Password: votre_password
   ```

## 🚀 ÉTAPE 2 : CONFIGURER NODE.JS APP DANS cPANEL

### Via cPanel > Setup Node.js App

1. **Créer une application**

   - Node.js version : 18.x ou supérieur
   - Application mode : Production
   - Application root : `public_html/api`
   - Application URL : `api.votredomaine.com` (ou `/api`)
   - Application startup file : `index.js`

2. **Variables d'environnement** (ajouter dans cPanel)

   ```env
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=mysql://username_yakro:password@localhost/username_yakroactu
   JWT_SECRET=GÉNÉRER_SECRET_256BITS
   JWT_REFRESH_SECRET=GÉNÉRER_AUTRE_SECRET
   ALLOWED_ORIGINS=https://votredomaine.com,https://admin.votredomaine.com
   ```

3. **Commande NPM à exécuter** (optionnel)
   ```
   npm install --production
   ```

## 🚀 ÉTAPE 3 : DÉPLOYER LES FICHIERS

### Option A : Via Git (recommandé)

```bash
# Sur votre machine locale
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/votre-repo/yakroactu.git
git push -u origin main

# Sur le serveur via SSH
cd ~/public_html
git clone https://github.com/votre-repo/yakroactu.git api
cd api
```

### Option B : Via cPanel File Manager

1. Compresser le dossier `admin/` en local en `.zip`
2. Upload via cPanel > File Manager > `public_html/`
3. Extraire le fichier .zip
4. Renommer le dossier en `api`

## 🚀 ÉTAPE 4 : INSTALLER LES DÉPENDANCES

### Via SSH (recommandé)

```bash
cd ~/public_html/api

# Charger l'environnement Node.js de cPanel
source /home/username/nodevenv/public_html/api/18/bin/activate

# Installer les dépendances
npm install --production

# Générer le client Prisma
npx prisma generate

# Exécuter les migrations
npx prisma migrate deploy

# Seed (optionnel - données de test)
node prisma/seed.js
```

### Via Terminal cPanel (si SSH non disponible)

Dans cPanel > Terminal, exécuter les mêmes commandes.

## 🚀 ÉTAPE 5 : CRÉER LE FICHIER .env

```bash
cd ~/public_html/api
nano .env
```

Contenu du fichier `.env` :

```env
# ==================== PRODUCTION ====================
NODE_ENV=production
PORT=3000

# ==================== DATABASE ====================
DATABASE_URL="mysql://username_yakro:VOTRE_PASSWORD@localhost/username_yakroactu"

# ==================== JWT ====================
JWT_SECRET=GÉNÉRER_UN_SECRET_FORT_256BITS_ICI
JWT_REFRESH_SECRET=GÉNÉRER_AUTRE_SECRET_FORT_256BITS
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# ==================== CORS ====================
ALLOWED_ORIGINS=https://votredomaine.com,https://admin.votredomaine.com

# ==================== RATE LIMITING ====================
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# ==================== UPLOAD ====================
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret
MAX_FILE_SIZE=5242880

# ==================== REDIS (si disponible) ====================
REDIS_HOST=localhost
REDIS_PORT=6379
CACHE_TTL=300

# ==================== LOGS ====================
LOG_LEVEL=error
```

**⚠️ Important :** Générer des secrets forts :

```bash
# Générer JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Générer JWT_REFRESH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 🚀 ÉTAPE 6 : CONFIGURER .htaccess (REDIRECTIONS)

Créer `/public_html/.htaccess` :

```apache
# ========================================
# YakroActu - Redirections
# ========================================

RewriteEngine On

# Forcer HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# API - Rediriger vers Node.js app
RewriteCond %{REQUEST_URI} ^/api/
RewriteRule ^api/(.*)$ http://localhost:3000/$1 [P,L]

# Admin Dashboard
RewriteCond %{REQUEST_URI} ^/admin/
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^admin/(.*)$ /admin/index.html [L]

# Mobile app (si hébergé)
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /index.html [L]
```

## 🚀 ÉTAPE 7 : DÉMARRER L'APPLICATION

### Via cPanel > Setup Node.js App

1. Cliquer sur votre application
2. Cliquer sur **"Restart"**
3. Vérifier le statut : **Running**

### Via Terminal/SSH

```bash
cd ~/public_html/api

# Redémarrer avec Passenger
touch tmp/restart.txt

# Ou redémarrer l'application Node.js dans cPanel
```

## 🧪 ÉTAPE 8 : TESTER L'API

```bash
# Test de santé
curl https://api.votredomaine.com/health

# Devrait retourner :
# {"status":"OK","timestamp":"...","uptime":...}

# Test authentification
curl -X POST https://api.votredomaine.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@yakroactu.com","password":"Admin123!"}'
```

## 📊 ÉTAPE 9 : MONITORING & LOGS

### Logs Node.js dans cPanel

1. cPanel > Setup Node.js App
2. Cliquer sur votre app
3. Onglet "Log"

### Logs d'erreurs

```bash
# Via SSH
tail -f ~/public_html/api/logs/error.log
tail -f ~/logs/yakroactu-error.log
```

## 🔄 MISE À JOUR (REDÉPLOIEMENT)

```bash
cd ~/public_html/api

# Pull des derniers changements
git pull origin main

# Installer nouvelles dépendances
npm install --production

# Migrations Prisma
npx prisma migrate deploy

# Générer client Prisma
npx prisma generate

# Redémarrer l'app
touch tmp/restart.txt
```

## 🔒 SÉCURITÉ POST-DÉPLOIEMENT

### ✅ Checklist

- [ ] SSL/HTTPS activé
- [ ] Fichier `.env` protégé (pas accessible via web)
- [ ] `.gitignore` contient `.env`, `node_modules/`, `uploads/`
- [ ] Permissions fichiers : 644 (fichiers), 755 (dossiers)
- [ ] CORS configuré correctement
- [ ] Rate limiting activé
- [ ] Logs en mode production (erreurs uniquement)
- [ ] Variables sensibles dans `.env`, pas dans le code

### Protéger .env via .htaccess

Ajouter dans `/public_html/api/.htaccess` :

```apache
<Files ".env">
    Order allow,deny
    Deny from all
</Files>
```

## 🐛 DÉPANNAGE

### Application ne démarre pas

```bash
# Vérifier les logs
cat ~/public_html/api/logs/error.log

# Vérifier Node.js
node --version

# Vérifier Prisma
npx prisma --version

# Tester manuellement
node index.js
```

### Erreur de connexion MySQL

```bash
# Tester la connexion
mysql -h localhost -u username_yakro -p username_yakroactu

# Vérifier DATABASE_URL dans .env
cat .env | grep DATABASE_URL
```

### Erreur 502 Bad Gateway

- Vérifier que l'app Node.js est bien démarrée dans cPanel
- Vérifier le port dans `index.js` (doit correspondre à cPanel)
- Redémarrer : `touch tmp/restart.txt`

### Uploads ne fonctionnent pas

```bash
# Créer le dossier uploads
mkdir -p ~/public_html/api/uploads

# Permissions
chmod 755 ~/public_html/api/uploads
```

## 📞 SUPPORT

- Documentation Prisma : https://www.prisma.io/docs
- cPanel Node.js : https://docs.cpanel.net/cpanel/software/application-manager/
- Support hébergeur : Contacter votre hébergeur cPanel

## ✅ CHECKLIST FINALE

- [x] Base de données MySQL créée
- [x] Utilisateur MySQL créé et privilèges assignés
- [x] Application Node.js configurée dans cPanel
- [x] Variables d'environnement définies
- [x] Fichiers déployés via Git ou File Manager
- [x] Dépendances npm installées
- [x] Prisma client généré
- [x] Migrations exécutées
- [x] Fichier .env créé et sécurisé
- [x] .htaccess configuré
- [x] Application démarrée
- [x] API testée (health check)
- [x] SSL/HTTPS actif
- [x] Logs accessibles

**🎉 Votre backend YakroActu est maintenant déployé sur cPanel !**
