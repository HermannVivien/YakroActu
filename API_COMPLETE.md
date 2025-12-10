# API YakroActu - Gestion Mobile & Web

## Backend complet pour gérer l'application mobile Flutter et le site web

### ✅ Nouvelles fonctionnalités implémentées

## 1. GESTION DES ACTUALITÉS

- **Catégories** : `/api/categories`
- **Sous-catégories** : `/api/subcategories`
- **Tags** : `/api/tags`
- **Articles** : `/api/articles`
- **Breaking News** : `/api/breaking-news`
- **Live Streaming** : `/api/live-streaming`
- **Flux RSS** : `/api/rss-feeds`
- **Commentaires** : `/api/articles/:id/comments`
- **Signalements** : `/api/comment-flags`

## 2. GESTION APP MOBILE

- **Versions App** : `/api/app-versions`
  - Gestion des versions Android/iOS
  - Force update & compatibility
  - Release notes
- **Configuration App** : `/api/app-config`
  - Paramètres par plateforme (Android/iOS/Web)
  - Configuration dynamique
- **Notifications Push** : `/api/push-notifications`

  - Envoi ciblé ou global
  - Planification
  - Tracking (envoi/ouverture)

- **Analytics App** : `/api/app-analytics`
  - Tracking des événements
  - Statistiques par plateforme
  - Comportement utilisateur

## 3. GESTION SITE WEB

- **Pages** : `/api/pages`
  - Pages statiques (CGU, mentions légales, etc.)
  - SEO (meta title/description)
- **Menu Navigation** : `/api/website-menus`
  - Menus hiérarchiques
  - Liens internes/externes
- **Thèmes** : `/api/website-themes`
  - Personnalisation visuelle
  - Couleurs, fonts, logos
  - CSS personnalisé
- **Réseaux Sociaux** : `/api/social-media`
  - Liens réseaux sociaux
  - Ordre d'affichage

## 4. GESTION UTILISATEURS

- **Utilisateurs** : `/api/users`
- **Auteurs** : `/api/authors`
  - Profils journalistes
  - Biographie & réseaux
  - Vérification
- **Sondages** : `/api/surveys`
  - Questions multiples
  - Réponses & statistiques

## 5. GESTION ÉCRAN D'ACCUEIL

- **Bannières** : `/api/banners`
  - Bannières publicitaires
  - Positions variées (TOP/MIDDLE/BOTTOM)
  - Planification & tracking
- **Sections Vedettes** : `/api/featured-sections`
  - Articles à la une
  - Organisation par sections
- **Espaces Pub** : `/api/ad-spaces`
  - Emplacements publicitaires
  - Dates de validité

## 6. COMMUNICATION

- **Messages Contact** : `/api/contact-messages`
  - Formulaire de contact
  - Suivi des réponses
- **Newsletter** : `/api/newsletter`
  - Abonnements
  - Vérification email
  - Désabonnement

## 7. GESTION PERSONNEL

- **Rôles** : `/api/roles`
  - Permissions granulaires
  - Gestion des accès
- **Staff** : `/api/staff`
  - Membres de l'équipe
  - Départements & postes

## 8. SYSTÈME

- **Paramètres** : `/api/settings`
  - Configuration globale
  - Par catégorie
- **Pharmacies** : `/api/pharmacies`
- **Flash Info** : `/api/flash-info`
- **Médias** : `/api/media`

---

## 📱 Endpoints clés pour l'app mobile

### Vérifier la version de l'app

```
GET /api/app-versions/latest/:platform
Response: { version, buildNumber, forceUpdate, downloadUrl, releaseNotes }
```

### Récupérer la configuration

```
GET /api/app-config/:platform
Response: { "API_URL": "...", "TIMEOUT": "30", ... }
```

### Récupérer les bannières actives

```
GET /api/banners/active?type=HOME
Response: [ { imageUrl, link, order, ... } ]
```

### Envoyer une notification push

```
POST /api/push-notifications
Body: { title, message, platform, userIds, scheduledAt }
```

### Tracker un événement

```
POST /api/app-analytics
Body: { platform, event, screen, userId, data }
```

---

## 🌐 Endpoints clés pour le site web

### Thème actif

```
GET /api/website-themes/active
Response: { primaryColor, secondaryColor, logoUrl, ... }
```

### Menu de navigation

```
GET /api/website-menus?isActive=true
Response: [ { name, link, order, icon, ... } ]
```

### Pages statiques

```
GET /api/pages?status=PUBLISHED
Response: [ { title, slug, content, metaTitle, ... } ]
```

### Réseaux sociaux

```
GET /api/social-media?isActive=true
Response: [ { platform, name, url, icon, ... } ]
```

---

## 🔐 Authentification

Toutes les routes de modification (POST, PUT, DELETE) nécessitent un token JWT dans le header :

```
Authorization: Bearer <token>
```

---

## 📊 Base de données

Tous les modèles sont synchronisés avec MySQL via Prisma.
Relations complètes entre articles, catégories, utilisateurs, etc.

Pour appliquer les changements :

```bash
cd admin
npx prisma generate
npx prisma db push
```

---

## 🚀 Démarrer le backend

```bash
cd admin
npm install
npm start
```

Le serveur démarrera sur http://localhost:5000
