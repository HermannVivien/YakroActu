# 📋 Guide d'Implémentation Backend - YakroActu

## Fonctionnalités déjà implémentées ✅

### Articles

- ✅ CRUD complet des articles
- ✅ Gestion des catégories et tags
- ✅ Upload de médias
- ✅ Système de publication/brouillon

### Utilisateurs

- ✅ Authentification JWT
- ✅ Gestion des rôles (ADMIN, JOURNALIST, USER)
- ✅ CRUD utilisateurs

### Pharmacies & Flash Info

- ✅ CRUD pharmacies de garde
- ✅ CRUD flash info

### Stats

- ✅ Endpoint /api/stats/dashboard

---

## Fonctionnalités à implémenter 🚧

### 1. Commentaires (`/api/comments`)

**Modèle Prisma existant:**

```prisma
model Comment {
  id        Int      @id @default(autoincrement())
  content   String   @db.Text
  status    String   @default("pending") // À ajouter
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  userId    Int
  user      User     @relation(...)
  articleId Int
  article   Article  @relation(...)
}
```

**Routes à créer:**

```javascript
// admin/routes/comment.routes.js
GET    /api/comments              // Liste tous les commentaires (avec filtres)
GET    /api/comments/:id          // Détails d'un commentaire
PATCH  /api/comments/:id/approve  // Approuver un commentaire
PATCH  /api/comments/:id/reject   // Rejeter un commentaire
DELETE /api/comments/:id          // Supprimer un commentaire

// Query params:
// - status: pending | approved | rejected
// - articleId: filter par article
```

**Controller à créer:**

```javascript
// admin/controllers/comment.controller.js
exports.getComments = async (req, res, next) => {
  const { status, articleId } = req.query;
  // Implémenter la logique
};

exports.approveComment = async (req, res, next) => {
  // Mettre status = 'approved'
};

exports.rejectComment = async (req, res, next) => {
  // Mettre status = 'rejected'
};

exports.deleteComment = async (req, res, next) => {
  // Supprimer le commentaire
};
```

---

### 2. Médiathèque (`/api/media`)

**Modèle Prisma existant:**

```prisma
model Media {
  id        Int       @id @default(autoincrement())
  filename  String    @db.VarChar(255)
  url       String    @db.VarChar(500)
  type      MediaType // IMAGE | VIDEO | AUDIO | DOCUMENT
  mimeType  String    @db.VarChar(100)
  size      Int
  createdAt DateTime  @default(now())
}
```

**Routes à créer:**

```javascript
// admin/routes/media.routes.js
GET    /api/media              // Liste tous les médias (avec filtres)
POST   /api/media/upload       // Upload de fichiers (multipart/form-data)
GET    /api/media/:id          // Détails d'un média
DELETE /api/media/:id          // Supprimer un média

// Query params:
// - type: IMAGE | VIDEO | AUDIO | DOCUMENT
```

**Controller à créer:**

```javascript
// admin/controllers/media.controller.js
exports.getMedia = async (req, res, next) => {
  const { type } = req.query;
  // Lister les médias avec filtre optionnel
};

exports.uploadFiles = async (req, res, next) => {
  // Utiliser multer pour gérer l'upload
  // Sauvegarder dans /uploads ou cloud storage
  // Créer entrées dans la DB
};

exports.deleteMedia = async (req, res, next) => {
  // Supprimer le fichier du disque/cloud
  // Supprimer l'entrée de la DB
};
```

**Middleware upload existant:** `admin/middleware/upload.js` (déjà configuré avec multer)

---

### 3. Événements (`/api/events`)

**Modèle Mongoose existant:** `admin/models/Event.js`

**Routes à créer:**

```javascript
// admin/routes/event.routes.js
GET    /api/events           // Liste tous les événements
POST   /api/events           // Créer un événement
GET    /api/events/:id       // Détails d'un événement
PUT    /api/events/:id       // Modifier un événement
PATCH  /api/events/:id       // Publier/dépublier
DELETE /api/events/:id       // Supprimer un événement
```

**Controller à créer:**

```javascript
// admin/controllers/event.controller.js
exports.getEvents = async (req, res, next) => {};
exports.createEvent = async (req, res, next) => {};
exports.updateEvent = async (req, res, next) => {};
exports.deleteEvent = async (req, res, next) => {};
```

**Champs attendus:**

- title, description, coverImage
- startDate, endDate, location
- category, isPublished

---

### 4. Sondages (`/api/polls`)

**Modèle Mongoose existant:** `admin/models/Poll.js`

**Routes à créer:**

```javascript
// admin/routes/poll.routes.js
GET    /api/polls           // Liste tous les sondages
POST   /api/polls           // Créer un sondage
GET    /api/polls/:id       // Détails d'un sondage
PUT    /api/polls/:id       // Modifier un sondage
PATCH  /api/polls/:id       // Activer/désactiver
DELETE /api/polls/:id       // Supprimer un sondage
GET    /api/polls/:id/results // Résultats du sondage
```

**Controller à créer:**

```javascript
// admin/controllers/poll.controller.js
exports.getPolls = async (req, res, next) => {};
exports.createPoll = async (req, res, next) => {};
exports.updatePoll = async (req, res, next) => {};
exports.deletePoll = async (req, res, next) => {};
exports.getPollResults = async (req, res, next) => {};
```

**Structure:**

```javascript
{
  question: "Question du sondage?",
  description: "Description optionnelle",
  options: [
    { text: "Option 1", votes: 0 },
    { text: "Option 2", votes: 0 }
  ],
  isActive: true,
  expiresAt: Date
}
```

---

### 5. Promotions (`/api/promotions`)

**Modèle Mongoose existant:** `admin/models/Promotion.js`

**Routes à créer:**

```javascript
// admin/routes/promotion.routes.js
GET    /api/promotions      // Liste toutes les promotions
POST   /api/promotions      // Créer une promotion
GET    /api/promotions/:id  // Détails d'une promotion
PUT    /api/promotions/:id  // Modifier une promotion
DELETE /api/promotions/:id  // Supprimer une promotion
```

**Champs attendus:**

- title, description
- image, link
- startDate, endDate
- isActive

---

### 6. Titrilologie (`/api/titrilologie`)

**Modèle Mongoose existant:** `admin/models/Titriloogie.js`

**Routes à créer:**

```javascript
// admin/routes/titrilologie.routes.js
GET    /api/titrilologie           // Liste tous les jeux
POST   /api/titrilologie           // Créer un jeu
GET    /api/titrilologie/:id       // Détails d'un jeu
PUT    /api/titrilologie/:id       // Modifier un jeu
DELETE /api/titrilologie/:id       // Supprimer un jeu
```

**Fonctionnalité:** Jeux de prédiction sportifs où les utilisateurs parient sur des résultats

---

### 7. Paramètres (`/api/settings`)

**Modèle Mongoose existant:** `admin/models/Setting.js`

**Routes à créer:**

```javascript
// admin/routes/setting.routes.js
GET / api / settings; // Récupérer tous les paramètres
PUT / api / settings; // Mettre à jour les paramètres
```

**Structure:**

```javascript
{
  siteName: "YakroActu",
  siteDescription: "...",
  logo: "url",
  contactEmail: "...",
  contactPhone: "...",
  socialMedia: {
    facebook: "...",
    twitter: "...",
    instagram: "...",
    youtube: "..."
  },
  features: {
    commentsEnabled: true,
    registrationEnabled: true,
    maintenanceMode: false
  },
  seo: {
    metaTitle: "...",
    metaDescription: "...",
    metaKeywords: "..."
  }
}
```

---

## 📝 Prochaines étapes

### Priorité 1 (Critique)

1. ✅ Implémenter les routes de commentaires
2. ✅ Implémenter l'upload de médias
3. ✅ Ajouter le champ `status` au modèle Comment dans Prisma

### Priorité 2 (Important)

4. Implémenter les routes d'événements
5. Implémenter les routes de sondages
6. Implémenter les routes de promotions

### Priorité 3 (Avancé)

7. Implémenter la Titrilologie
8. Implémenter les paramètres globaux
9. Ajouter la pagination sur tous les endpoints
10. Ajouter la recherche et les filtres avancés

---

## 🔧 Migration Prisma nécessaire

Ajouter le champ `status` au modèle Comment:

```prisma
model Comment {
  id        Int      @id @default(autoincrement())
  content   String   @db.Text
  status    String   @default("pending") @db.VarChar(20) // NOUVEAU
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  userId Int
  user   User @relation(fields: [userId], references: [id], onDelete: Cascade)

  articleId Int
  article   Article @relation(fields: [articleId], references: [id], onDelete: Cascade)

  @@index([articleId])
  @@index([userId])
  @@index([createdAt])
  @@index([status]) // NOUVEAU
}
```

Puis exécuter:

```bash
npx prisma migrate dev --name add_comment_status
```

---

## 📦 Dépendances nécessaires

Toutes les dépendances sont déjà installées:

- ✅ express
- ✅ multer (pour upload de fichiers)
- ✅ bcrypt
- ✅ jsonwebtoken
- ✅ @prisma/client
- ✅ express-validator

---

## 🎨 Frontend déjà créé

Les pages React suivantes sont déjà créées et prêtes:

- ✅ Comments.js
- ✅ Media.js
- ✅ Events.js
- ✅ Polls.js
- ✅ Promotions.js
- ✅ Titrilologie.js
- ✅ Settings.js

Il ne reste plus qu'à implémenter les routes backend correspondantes !
