# YakroActu - Plateforme d'actualités et services

Application mobile d'actualités avec backend Node.js/Express et frontend Flutter.

## 📁 Structure du projet

```
YakroActu/
├── admin/          # Backend API (Node.js + Express + MongoDB)
│   ├── config/     # Configuration (database, swagger)
│   ├── controllers/# Logique métier
│   ├── models/     # Modèles de données (Mongoose)
│   ├── routes/     # Routes API
│   ├── middleware/ # Auth, Redis, Swagger
│   └── tests/      # Tests unitaires
│
└── yakro_actu/     # Frontend Mobile (Flutter)
    ├── lib/        # Code source Dart
    │   ├── models/
    │   ├── screens/
    │   ├── services/
    │   ├── widgets/
    │   └── routes/
    └── assets/     # Images, icons, videos
```

## 🚀 Installation

### Backend (admin/)

```bash
cd admin
npm install
cp .env.example .env  # Configurer les variables d'environnement
npm start
```

### Frontend (yakro_actu/)

```bash
cd yakro_actu
flutter pub get
flutter run
```

## 🔧 Configuration

### Backend (.env)

```
MONGODB_URI=mongodb://localhost:27017/yakroactu
JWT_SECRET=your_secret_key
PORT=3000
REDIS_URL=redis://localhost:6379
```

### Firebase (Flutter)

Configurer `google-services.json` (Android) et `GoogleService-Info.plist` (iOS)

## 📚 Documentation API

Une fois le serveur lancé, accédez à la documentation Swagger :

```
http://localhost:3000/api-docs
```

## 🧪 Tests

```bash
# Backend
cd admin
npm test

# Flutter
cd yakro_actu
flutter test
```

## 📱 Fonctionnalités

- ✅ Articles d'actualités
- ✅ Flash infos
- ✅ Pharmacies de garde
- ✅ Points d'intérêt locaux
- ✅ Notifications push
- ✅ Authentification utilisateurs
- ✅ Recherche avancée
- ✅ Géolocalisation
- ✅ Thème clair/sombre

## 🛠️ Technologies

**Backend:** Node.js, Express, MongoDB, Redis, Socket.io  
**Frontend:** Flutter, Provider, Firebase, Google Maps  
**Documentation:** Swagger/OpenAPI

## 📄 Licence

Propriétaire - Tous droits réservés
