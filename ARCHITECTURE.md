# 🏗️ ARCHITECTURE YAKROACTU - Production Ready

## 📁 Structure Backend (Node.js + Express + Prisma)

```
admin/
├── server.js                 # Point d'entrée principal
├── index.js                  # Point d'entrée cPanel/Passenger
├── package.json
├── .env.example
│
├── config/
│   ├── database.js          # Configuration DB
│   ├── prisma.js            # Client Prisma
│   ├── swagger.js           # Configuration Swagger
│   ├── redis.js             # Configuration Redis (cache)
│   └── cloudinary.js        # Upload images
│
├── prisma/
│   ├── schema.prisma        # Schéma complet
│   ├── seed.js              # Données de test
│   └── migrations/          # Historique migrations
│
├── middleware/
│   ├── auth.js              # JWT authentication
│   ├── roles.js             # RBAC (admin, journalist, user)
│   ├── validate.js          # Validation req
│   ├── upload.js            # Multer config
│   ├── rateLimiter.js       # Protection DDoS
│   ├── errorHandler.js      # Gestion erreurs globale
│   └── cache.js             # Redis middleware
│
├── controllers/
│   ├── auth.controller.js
│   ├── user.controller.js
│   ├── article.controller.js
│   ├── category.controller.js
│   ├── media.controller.js
│   ├── pharmacy.controller.js
│   ├── flashInfo.controller.js
│   ├── comment.controller.js
│   ├── analytics.controller.js
│   └── notification.controller.js
│
├── services/
│   ├── auth.service.js      # Logique métier auth
│   ├── article.service.js   # Logique métier articles
│   ├── media.service.js     # Upload/compression
│   ├── email.service.js     # Envoi emails
│   ├── push.service.js      # Notifications push
│   └── cache.service.js     # Gestion cache
│
├── routes/
│   ├── index.js             # Centralisateur routes
│   ├── auth.routes.js
│   ├── user.routes.js
│   ├── article.routes.js
│   ├── category.routes.js
│   ├── media.routes.js
│   ├── pharmacy.routes.js
│   ├── flashInfo.routes.js
│   └── analytics.routes.js
│
├── validators/
│   ├── auth.validator.js
│   ├── article.validator.js
│   ├── user.validator.js
│   └── common.validator.js
│
├── utils/
│   ├── helpers.js           # Fonctions utilitaires
│   ├── slugify.js           # Génération slugs
│   ├── pagination.js        # Helper pagination
│   └── response.js          # Formattage réponses
│
├── uploads/                 # Fichiers uploadés (temp)
│
└── tests/
    ├── auth.test.js
    ├── article.test.js
    └── setup.js
```

## 🗄️ Schéma Base de Données (Relations)

```
Users (Admin, Journalist, User)
  ↓ 1:N
Articles
  ↓ N:1
Categories
  ↓ N:N
Tags (via ArticleTag)
  ↓ 1:N
Comments
  ↓ 1:N
Favorites
  ↓ N:1
Media

Pharmacies (Standalone)
FlashInfo (Standalone)
Notifications (1:N avec Users)
```

## 🔐 Authentification & Autorisation

- **JWT** : Access token (15min) + Refresh token (7j)
- **Rôles** : ADMIN, JOURNALIST, USER
- **Permissions** :
  - ADMIN : Full access
  - JOURNALIST : CRUD articles, médias
  - USER : Read only, comments, favorites

## 📡 Endpoints REST API

### Auth

- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/refresh
- POST /api/auth/logout
- POST /api/auth/forgot-password
- POST /api/auth/reset-password

### Users

- GET /api/users (admin)
- GET /api/users/:id
- PUT /api/users/:id
- DELETE /api/users/:id (admin)
- GET /api/users/me

### Articles

- GET /api/articles (pagination, filters, search)
- GET /api/articles/:id
- POST /api/articles (journalist+)
- PUT /api/articles/:id (journalist+)
- DELETE /api/articles/:id (admin)
- PATCH /api/articles/:id/publish (journalist+)
- GET /api/articles/trending
- GET /api/articles/breaking

### Categories

- GET /api/categories
- POST /api/categories (admin)
- PUT /api/categories/:id (admin)
- DELETE /api/categories/:id (admin)

### Media

- POST /api/media/upload
- GET /api/media
- DELETE /api/media/:id

### Pharmacies

- GET /api/pharmacies
- GET /api/pharmacies/on-duty
- POST /api/pharmacies (admin)
- PUT /api/pharmacies/:id (admin)

### Flash Info

- GET /api/flash-info
- POST /api/flash-info (admin)
- PUT /api/flash-info/:id (admin)
- DELETE /api/flash-info/:id (admin)

### Analytics

- GET /api/analytics/dashboard (admin)
- GET /api/analytics/articles/:id

## 🚀 Déploiement cPanel

### 1. Structure compatible Passenger

```
public_html/
├── api/                     # Backend Node.js
│   ├── index.js            # Point d'entrée Passenger
│   ├── package.json
│   ├── node_modules/
│   ├── prisma/
│   └── ... (tout le backend)
│
├── admin/                   # React Admin (build)
│   ├── index.html
│   ├── assets/
│   └── ...
│
└── .htaccess               # Redirections
```

### 2. Configuration Passenger (index.js)

```javascript
// Passenger nécessite index.js à la racine
const app = require("./server");
module.exports = app;
```

### 3. Variables d'environnement cPanel

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=mysql://user:pass@localhost:3306/yakroactu
JWT_SECRET=votre_secret_super_secure
JWT_REFRESH_SECRET=refresh_secret_super_secure
CLOUDINARY_URL=cloudinary://...
ALLOWED_ORIGINS=https://yakroactu.com,https://admin.yakroactu.com
```

### 4. Script package.json

```json
{
  "scripts": {
    "start": "node server.js",
    "build": "prisma generate && prisma migrate deploy",
    "deploy": "npm install && npm run build",
    "seed": "node prisma/seed.js"
  }
}
```

## ⚡ Optimisations Performance

1. **Redis Cache** : Articles, catégories (TTL 5min)
2. **Compression** : gzip activé
3. **CDN** : Cloudinary pour images
4. **Pagination** : Max 50 items/page
5. **Index DB** : Sur tous les champs de recherche
6. **Rate Limiting** : 100 req/15min par IP
7. **Lazy Loading** : Images articles

## 🔒 Sécurité Checklist

- ✅ Helmet.js (headers sécurisés)
- ✅ CORS configuré
- ✅ Rate limiting
- ✅ Input validation (express-validator)
- ✅ SQL Injection : Prisma protège automatiquement
- ✅ XSS : Sanitize inputs
- ✅ JWT rotation
- ✅ HTTPS only
- ✅ Environnement variables sécurisées
- ✅ Upload files : whitelist extensions
- ✅ Logs sécurisés (pas de données sensibles)

## 📊 Monitoring & Logs

- Winston : Logs structurés
- Morgan : Logs HTTP
- Sentry : Error tracking (prod)
- PM2 : Process manager + monitoring

## 🧪 Tests

```bash
npm test                    # Tous les tests
npm run test:coverage       # Coverage
npm run test:watch          # Mode watch
```

## 📱 Intégration Flutter

```dart
// services/api_service.dart
class ApiService {
  static const baseUrl = 'https://api.yakroactu.com';

  Future<List<Article>> getArticles() async {
    final response = await http.get('$baseUrl/api/articles');
    return parseArticles(response.body);
  }
}
```

## 🎯 Plan de Développement (Étapes)

1. ✅ Setup projet backend (Express + Prisma)
2. ✅ Configuration base de données MySQL
3. ✅ Schéma Prisma + migrations
4. ✅ Middleware auth + roles
5. ✅ Controllers + Services
6. ✅ Routes API REST
7. ✅ Validation + error handling
8. ✅ Upload médias (Cloudinary)
9. ✅ Cache Redis
10. ✅ Documentation Swagger
11. ✅ Tests unitaires
12. ✅ Déploiement cPanel
13. ✅ React Admin (dashboard)
14. ✅ Flutter mobile app
15. ✅ Production optimization

## 📈 KPIs & Métriques

- Response time < 200ms (90th percentile)
- Uptime > 99.9%
- Cache hit rate > 80%
- Error rate < 0.1%
