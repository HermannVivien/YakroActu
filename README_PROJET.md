# YakroActu - Application d'Information

Application complète de gestion et diffusion d'actualités avec application mobile Flutter et interface CMS React.

## 🏗️ Architecture

```
YakroActu/
├── admin/                  # Backend Node.js + Express + Prisma
│   ├── controllers/        # Logique métier
│   ├── routes/            # Définition des endpoints
│   ├── services/          # Services (auth, cache, socket)
│   ├── middleware/        # Auth, RBAC, validation
│   ├── prisma/            # Schéma Prisma
│   └── server.js          # Point d'entrée
│
├── admin-cms/             # Interface CMS React
│   ├── src/
│   │   ├── components/    # Composants réutilisables
│   │   ├── pages/         # Pages principales
│   │   └── services/      # Services API
│   └── package.json
│
└── yakro_actu/            # Application mobile Flutter
    ├── lib/
    │   ├── models/        # Modèles de données
    │   ├── services/      # Services (API, WebSocket)
    │   ├── data/          # Repositories
    │   ├── screens/       # Écrans de l'app
    │   └── widgets/       # Widgets réutilisables
    └── pubspec.yaml
```

## 🚀 Stack Technique

### Backend

- **Node.js** 18+ avec Express.js
- **Prisma** ORM avec MySQL
- **JWT** pour l'authentification
- **Socket.IO** pour le chat temps réel
- **Multer** pour l'upload de fichiers
- **Swagger** pour la documentation API

### Frontend Admin (CMS)

- **React** 18 avec React Router
- **Axios** pour les requêtes HTTP
- **React Quill** éditeur WYSIWYG
- **React Toastify** notifications
- **Chart.js** pour les graphiques

### Mobile

- **Flutter** 3.0+
- **Dart** langage
- **Dio** client HTTP
- **Provider** state management
- **Socket.IO Client** pour le chat
- **flutter_secure_storage** pour les tokens

## 📦 Installation

### 1. Backend

```bash
cd admin
npm install

# Configuration
cp .env.example .env
# Éditer .env avec vos paramètres

# Base de données
npx prisma generate
npx prisma db push
npx prisma db seed

# Démarrage
npm run dev
```

### 2. CMS Admin

```bash
cd admin-cms
npm install

# Configuration
cp .env.example .env

# Démarrage
npm start
```

### 3. Application Mobile

```bash
cd yakro_actu

# Installation des dépendances
flutter pub get

# iOS (macOS uniquement)
cd ios && pod install && cd ..

# Lancer l'app
flutter run
```

## 🔑 Fonctionnalités

### ✅ Backend Implémenté

- [x] Authentification JWT (access + refresh tokens)
- [x] CRUD Articles avec pagination, filtres, recherche
- [x] CRUD Catégories
- [x] CRUD Pharmacies de garde
- [x] Flash Info avec priorités
- [x] Système de commentaires
- [x] Système de favoris
- [x] Chat en temps réel (Socket.IO)
- [x] Notifications push
- [x] Upload de médias
- [x] RBAC (Admin, Journaliste, Utilisateur)
- [x] Rate limiting
- [x] Validation des données
- [x] Documentation Swagger

### ✅ CMS Admin Implémenté

- [x] Authentification
- [x] Dashboard avec statistiques
- [x] Gestion des articles (CRUD + éditeur WYSIWYG)
- [x] Gestion des catégories
- [x] Upload d'images
- [x] Interface responsive

### ✅ Mobile Implémenté

- [x] Modèles de données (10 models)
- [x] Services API complets (8 services)
- [x] Service WebSocket pour le chat
- [x] Repositories avec Provider
- [x] Auto-refresh JWT
- [x] Gestion sécurisée des tokens

### 🚧 À Compléter

- [ ] Migration complète de Firebase vers REST API
- [ ] Écrans Flutter (articles, chat, profil, etc.)
- [ ] Push notifications (FCM)
- [ ] Tests unitaires et d'intégration
- [ ] CI/CD pipeline
- [ ] Déploiement production

## 📚 Documentation

- [Guide Backend](admin/README.md)
- [Guide CMS](admin-cms/README.md)
- [Architecture Complète](ARCHITECTURE.md)
- [Analyse Flutter-Backend](ANALYSE_FLUTTER_BACKEND.md)
- [Déploiement cPanel](DEPLOIEMENT_CPANEL.md)

## 🔐 Rôles et Permissions

### ADMIN

- Accès total
- Gestion utilisateurs
- Modération contenu
- Configuration système

### JOURNALIST

- Créer/modifier articles
- Modérer commentaires
- Créer flash info

### USER

- Lire articles
- Commenter
- Favoris
- Chat

## 🌐 API Endpoints

Base URL: `http://localhost:5000/api`

### Auth

```
POST   /auth/register
POST   /auth/login
POST   /auth/logout
POST   /auth/refresh
```

### Articles

```
GET    /articles
GET    /articles/:id
POST   /articles
PUT    /articles/:id
DELETE /articles/:id
GET    /articles/trending
GET    /articles/breaking
```

### Catégories

```
GET    /categories
POST   /categories
PUT    /categories/:id
DELETE /categories/:id
```

### Chat

```
GET    /chats
POST   /chats
GET    /chats/:id/messages
POST   /chats/:id/messages
```

Voir la documentation Swagger complète sur `/api-docs`

## 🔧 Scripts Utiles

### Backend

```bash
npm run dev          # Mode développement
npm start           # Mode production
npm test            # Tests
npx prisma studio   # UI base de données
```

### CMS

```bash
npm start           # Développement
npm run build       # Build production
npm test            # Tests
```

### Mobile

```bash
flutter run         # Lancer l'app
flutter build apk   # Build Android
flutter build ios   # Build iOS
flutter test        # Tests
```

## 🐛 Débogage

### Backend

```bash
# Logs détaillés
DEBUG=* npm run dev

# Prisma Studio (GUI DB)
npx prisma studio
```

### Mobile

```bash
# Logs en temps réel
flutter logs

# Analyser les performances
flutter run --profile
```

## 📄 Licence

Propriétaire - YakroActu © 2024

## 👥 Équipe

- **Backend**: Node.js + Prisma + Socket.IO
- **Frontend**: React CMS
- **Mobile**: Flutter

## 📞 Support

Pour toute question ou problème, consulter la documentation ou contacter l'équipe de développement.
