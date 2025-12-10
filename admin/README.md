# YakroActu - Backend Node.js

Backend REST API pour l'application mobile YakroActu et l'interface CMS admin.

## Stack Technique

- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.21.2
- **ORM**: Prisma 5.22.0
- **Base de données**: MySQL
- **Auth**: JWT (access + refresh tokens)
- **Upload**: Multer
- **Cache**: Redis (optionnel)
- **WebSocket**: Socket.IO (chat en temps réel)
- **Documentation**: Swagger/OpenAPI

## Installation

```bash
cd admin
npm install
```

## Configuration

Créer un fichier `.env` :

```env
# Base de données
DATABASE_URL="mysql://user:password@localhost:3306/yakroactu"

# JWT
JWT_SECRET=votre_secret_jwt_tres_long_et_securise
JWT_REFRESH_SECRET=votre_refresh_secret_encore_plus_long
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Server
PORT=5000
NODE_ENV=development

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Redis (optionnel)
REDIS_URL=redis://localhost:6379
```

## Initialisation de la base de données

```bash
# Générer le client Prisma
npx prisma generate

# Créer les tables
npx prisma db push

# Seed (données de test)
npx prisma db seed
```

## Démarrage

```bash
# Développement
npm run dev

# Production
npm start
```

Le serveur démarre sur http://localhost:5000

## API Documentation

Une fois le serveur démarré, accéder à la documentation Swagger :
http://localhost:5000/api-docs

## Structure du projet

```
admin/
├── config/
│   ├── database.js        # Connexion MongoDB (legacy)
│   ├── prisma.js          # Client Prisma
│   └── swagger.js         # Configuration Swagger
├── controllers/
│   ├── article.controller.js
│   ├── auth.controller.js
│   ├── category.controller.js
│   ├── chat.controller.js
│   ├── comment.controller.js
│   ├── favorite.controller.js
│   ├── flashInfo.controller.js
│   ├── notification.controller.js
│   ├── pharmacy.controller.js
│   └── user.controller.js
├── middleware/
│   ├── auth.js            # JWT authentication
│   ├── roles.js           # RBAC authorization
│   ├── rateLimiter.js     # Rate limiting
│   ├── errorHandler.js    # Global error handler
│   ├── upload.js          # Multer config
│   └── validate.js        # Request validation
├── models/                # Mongoose models (legacy)
├── prisma/
│   └── schema.prisma      # Prisma schema
├── routes/
│   ├── article.routes.js
│   ├── auth.routes.js
│   ├── category.routes.js
│   ├── chat.routes.js
│   ├── comment.routes.js
│   ├── favorite.routes.js
│   ├── flashInfo.routes.js
│   ├── notification.routes.js
│   ├── pharmacy.routes.js
│   └── user.routes.js
├── services/
│   ├── article.service.js
│   ├── auth.service.js
│   ├── cache.service.js
│   ├── media.service.js
│   └── socket.service.js
├── utils/
│   └── helpers.js
├── validators/
│   └── common.validator.js
├── server.js              # Point d'entrée
└── index.js               # cPanel/Passenger entry
```

## Endpoints principaux

### Authentication

- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/logout` - Déconnexion
- `POST /api/auth/refresh` - Rafraîchir le token
- `POST /api/auth/forgot-password` - Mot de passe oublié
- `POST /api/auth/reset-password` - Réinitialiser
- `PUT /api/auth/change-password` - Changer mot de passe

### Articles

- `GET /api/articles` - Liste (avec pagination, filtres)
- `GET /api/articles/:id` - Détail
- `POST /api/articles` - Créer (auth requise)
- `PUT /api/articles/:id` - Modifier (auth requise)
- `DELETE /api/articles/:id` - Supprimer (auth requise)
- `GET /api/articles/trending` - Articles tendance
- `GET /api/articles/breaking` - Breaking news
- `GET /api/articles/search?q=` - Recherche

### Categories

- `GET /api/categories` - Liste
- `POST /api/categories` - Créer (admin)
- `PUT /api/categories/:id` - Modifier (admin)
- `DELETE /api/categories/:id` - Supprimer (admin)

### Comments

- `GET /api/articles/:id/comments` - Commentaires d'un article
- `POST /api/articles/:id/comments` - Ajouter (auth)
- `PUT /api/comments/:id` - Modifier (auth)
- `DELETE /api/comments/:id` - Supprimer (auth)

### Favorites

- `GET /api/favorites` - Mes favoris (auth)
- `POST /api/favorites` - Ajouter (auth)
- `DELETE /api/favorites/:articleId` - Retirer (auth)

### Chat (WebSocket + REST)

- `GET /api/chats` - Mes conversations (auth)
- `POST /api/chats` - Créer conversation (auth)
- `GET /api/chats/:id/messages` - Messages (auth)
- `POST /api/chats/:id/messages` - Envoyer (auth)

### Notifications

- `GET /api/notifications` - Mes notifications (auth)
- `POST /api/notifications/:id/read` - Marquer lue (auth)
- `POST /api/notifications/read-all` - Tout marquer (auth)

### Flash Info

- `GET /api/flash-info` - Actifs
- `POST /api/flash-info` - Créer (admin)
- `PUT /api/flash-info/:id` - Modifier (admin)
- `DELETE /api/flash-info/:id` - Supprimer (admin)

### Pharmacies

- `GET /api/pharmacies` - Liste
- `GET /api/pharmacies/on-duty` - Pharmacies de garde
- `POST /api/pharmacies` - Créer (admin)
- `PUT /api/pharmacies/:id` - Modifier (admin)

### Media

- `POST /api/media/upload` - Upload fichier (auth)

## WebSocket Events (Socket.IO)

### Client → Server

- `join_chats` - Rejoindre toutes mes conversations
- `join_chat` - Rejoindre une conversation
- `send_message` - Envoyer un message
- `typing` - Commence à écrire
- `stop_typing` - Arrête d'écrire
- `mark_read` - Marquer comme lu

### Server → Client

- `new_message` - Nouveau message reçu
- `user_typing` - Utilisateur écrit
- `user_stop_typing` - Utilisateur arrête
- `messages_read` - Messages lus
- `notification` - Nouvelle notification

## Sécurité

- ✅ Helmet (headers sécurisés)
- ✅ CORS configuré
- ✅ Rate limiting
- ✅ JWT avec refresh tokens
- ✅ Validation des entrées (express-validator)
- ✅ Hachage bcrypt pour mots de passe
- ✅ RBAC (Role-Based Access Control)
- ✅ Upload fichiers sécurisé avec Multer

## Tests

```bash
npm test
```

## Déploiement cPanel

Voir `DEPLOIEMENT_CPANEL.md` pour les instructions détaillées.
