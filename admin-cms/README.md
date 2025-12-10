# YakroActu CMS Admin

Interface d'administration pour gérer le contenu de l'application YakroActu.

## Technologies

- React 18
- React Router v6
- Axios
- React Quill (éditeur WYSIWYG)
- React Toastify (notifications)
- Chart.js (graphiques)

## Installation

```bash
cd admin-cms
npm install
```

## Configuration

Créer un fichier `.env` :

```
REACT_APP_API_URL=http://localhost:5000/api
```

## Démarrage

```bash
npm start
```

L'application sera accessible sur http://localhost:3000

## Connexion par défaut

Utiliser les identifiants créés via Prisma seed ou créer un compte admin via l'API.

## Fonctionnalités

### ✅ Implémentées

- 🔐 Authentification (login/logout)
- 📊 Dashboard avec statistiques
- 📰 Gestion des articles (CRUD complet)
- 🏷️ Gestion des catégories
- 📝 Éditeur WYSIWYG pour le contenu
- 🖼️ Upload d'images
- 🔄 Auto-refresh du token JWT

### 🚧 À implémenter

- 💊 Gestion des pharmacies de garde
- ⚡ Gestion des flash infos
- 👥 Gestion des utilisateurs
- 📈 Analytics détaillées
- 💬 Modération des commentaires
- 🔔 Gestion des notifications push

## Structure

```
admin-cms/
├── public/
├── src/
│   ├── components/
│   │   ├── Layout.js
│   │   └── PrivateRoute.js
│   ├── pages/
│   │   ├── Login.js
│   │   ├── Dashboard.js
│   │   ├── Articles.js
│   │   ├── ArticleForm.js
│   │   ├── Categories.js
│   │   ├── Pharmacies.js
│   │   ├── FlashInfo.js
│   │   └── Users.js
│   ├── services/
│   │   ├── api.js
│   │   ├── authService.js
│   │   ├── articleService.js
│   │   └── categoryService.js
│   ├── App.js
│   └── index.js
└── package.json
```

## API Endpoints utilisés

- `POST /api/auth/login` - Connexion
- `POST /api/auth/logout` - Déconnexion
- `POST /api/auth/refresh` - Rafraîchir le token
- `GET /api/articles` - Liste des articles
- `GET /api/articles/:id` - Détail article
- `POST /api/articles` - Créer article
- `PUT /api/articles/:id` - Modifier article
- `DELETE /api/articles/:id` - Supprimer article
- `GET /api/categories` - Liste catégories
- `POST /api/categories` - Créer catégorie
- `PUT /api/categories/:id` - Modifier catégorie
- `DELETE /api/categories/:id` - Supprimer catégorie
- `POST /api/media/upload` - Upload d'image

## Build pour production

```bash
npm run build
```

Le dossier `build/` contiendra les fichiers statiques prêts pour le déploiement.
