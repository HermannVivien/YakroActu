# 📘 Guide de Développement - YakroActu

## 🎯 Vue d'ensemble du projet

**Repository GitHub** : https://github.com/HermannVivien/YakroActu  
**Branche principale** : `main`  
**Localisation locale** : `C:\Dev\YakroActu`

---

## 📂 Structure du projet

```
YakroActu/
├── admin/              # 🖥️ Backend API (Node.js/Express)
│   ├── config/         # Configuration (database, swagger)
│   ├── controllers/    # Logique métier (11 contrôleurs)
│   ├── models/         # Modèles MongoDB (25 entités)
│   ├── routes/         # Routes API REST
│   ├── middleware/     # Auth JWT, Redis, Swagger
│   ├── tests/          # Tests unitaires
│   ├── .env            # Variables d'environnement (ne pas commiter!)
│   └── server.js       # Point d'entrée serveur
│
└── yakro_actu/         # 📱 Frontend Mobile (Flutter)
    ├── lib/
    │   ├── main.dart   # Point d'entrée application
    │   ├── models/     # Modèles de données
    │   ├── screens/    # Écrans UI
    │   ├── services/   # Services API, Auth, Notifications
    │   ├── widgets/    # Composants réutilisables
    │   └── routes/     # Navigation
    ├── assets/         # Images, icons, videos
    └── android/ios/    # Configuration plateformes
```

---

## 🚀 Installation & Configuration

### 1️⃣ Prérequis

#### Backend

```powershell
# Node.js v18+ requis
node --version  # Vérifier version

# MongoDB local ou distant
# Télécharger: https://www.mongodb.com/try/download/community
```

#### Frontend

```powershell
# Flutter SDK 3.0+ requis
flutter doctor  # Vérifier installation

# Android Studio (pour développement Android)
# Xcode (pour développement iOS - Mac uniquement)
```

---

### 2️⃣ Installation Backend

```powershell
# 1. Aller dans le dossier backend
cd C:\Dev\YakroActu\admin

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
# Copier .env.example vers .env
copy .env.example .env

# 4. Éditer le fichier .env avec vos configurations
notepad .env
```

#### Configuration minimale `.env`

```env
# Base de données
MONGODB_URI=mongodb://localhost:27017/yakroactu

# JWT
JWT_SECRET=votre_cle_secrete_tres_longue_et_aleatoire
JWT_EXPIRE=7d

# Serveur
PORT=3000
NODE_ENV=development

# CORS (autoriser le frontend Flutter)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8080
```

#### Démarrer le serveur

```powershell
# Mode développement (avec hot-reload)
npm run dev

# Mode production
npm start
```

**API accessible sur** : http://localhost:3000  
**Documentation Swagger** : http://localhost:3000/api-docs

---

### 3️⃣ Installation Frontend Flutter

```powershell
# 1. Aller dans le dossier Flutter
cd C:\Dev\YakroActu\yakro_actu

# 2. Installer les dépendances
flutter pub get

# 3. Vérifier la configuration
flutter doctor

# 4. Lister les devices disponibles
flutter devices

# 5. Lancer l'application
# Sur émulateur Android/iOS
flutter run

# Sur navigateur Web (pour test rapide)
flutter run -d chrome

# Sur device physique connecté
flutter run -d <device_id>
```

#### Configuration Firebase (si nécessaire)

```powershell
# Installer FlutterFire CLI
dart pub global activate flutterfire_cli

# Configurer Firebase pour le projet
flutterfire configure
```

---

## 🔧 Workflows de développement

### 📝 Workflow quotidien

#### 1. Récupérer les dernières modifications

```powershell
cd C:\Dev\YakroActu
git pull origin main
```

#### 2. Créer une branche pour une nouvelle fonctionnalité

```powershell
# Créer et basculer sur nouvelle branche
git checkout -b feature/nom-fonctionnalite

# Exemples:
git checkout -b feature/ajout-commentaires
git checkout -b fix/correction-bug-login
git checkout -b refactor/optimisation-api
```

#### 3. Développer et tester

```powershell
# Backend: Lancer en mode dev
cd admin
npm run dev

# Frontend: Lancer en hot-reload
cd yakro_actu
flutter run
```

#### 4. Commiter vos modifications

```powershell
# Vérifier les fichiers modifiés
git status

# Ajouter les fichiers
git add .
# OU sélectivement
git add admin/controllers/nouveauController.js
git add yakro_actu/lib/screens/nouveau_screen.dart

# Commiter avec message descriptif
git commit -m "feat: ajout fonctionnalité commentaires sur articles

- Création CommentController backend
- Création écran commentaires Flutter
- Tests unitaires ajoutés
- Documentation API mise à jour"
```

#### 5. Pusher vers GitHub

```powershell
# Première fois sur nouvelle branche
git push -u origin feature/nom-fonctionnalite

# Ensuite
git push
```

#### 6. Créer une Pull Request sur GitHub

1. Aller sur https://github.com/HermannVivien/YakroActu
2. Cliquer "Compare & pull request"
3. Remplir description, ajouter reviewers
4. Soumettre la PR

---

### 🔄 Workflow de synchronisation

#### Mettre à jour votre branche avec main

```powershell
# Récupérer les dernières modifications de main
git checkout main
git pull origin main

# Retourner sur votre branche
git checkout feature/nom-fonctionnalite

# Fusionner main dans votre branche
git merge main

# Résoudre conflits si nécessaire
# Éditer fichiers en conflit
git add .
git commit -m "merge: résolution conflits avec main"
git push
```

---

## 🧪 Tests

### Backend (Node.js)

```powershell
cd admin

# Lancer tous les tests
npm test

# Tests avec coverage
npm test -- --coverage

# Tests en mode watch
npm test -- --watch
```

### Frontend (Flutter)

```powershell
cd yakro_actu

# Tests unitaires
flutter test

# Tests avec coverage
flutter test --coverage

# Tests d'intégration
flutter drive --driver=test_driver/integration_test.dart
```

---

## 📊 Branches et Stratégie Git

### Structure des branches

```
main                    # Branche stable production
├── develop            # Branche de développement (optionnelle)
├── feature/xxx        # Nouvelles fonctionnalités
├── fix/xxx            # Corrections de bugs
├── refactor/xxx       # Refactoring code
└── hotfix/xxx         # Corrections urgentes
```

### Conventions de nommage

**Branches** :

- `feature/ajout-pharmacies-garde`
- `fix/erreur-login-jwt`
- `refactor/optimisation-queries-db`
- `hotfix/crash-app-startup`

**Commits** :

```
feat: nouvelle fonctionnalité
fix: correction bug
refactor: refactoring code (sans changer comportement)
docs: mise à jour documentation
test: ajout/modification tests
style: formatage code
perf: amélioration performance
chore: tâches maintenance (dépendances, config)
```

**Exemples de bons messages de commit** :

```bash
feat(backend): ajout endpoint recherche avancée articles
fix(flutter): correction crash au démarrage sur Android 13
refactor(api): optimisation requêtes MongoDB avec indexes
docs(readme): ajout guide installation Firebase
test(auth): ajout tests unitaires AuthController
perf(flutter): lazy loading images pour améliorer performance
```

---

## 🐛 Debugging

### Backend Node.js

#### Avec VS Code

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Backend",
      "skipFiles": ["<node_internals>/**"],
      "program": "${workspaceFolder}/admin/server.js",
      "envFile": "${workspaceFolder}/admin/.env"
    }
  ]
}
```

#### Logs

```javascript
// Utiliser console.log avec contexte
console.log("[ArticleController] Fetching articles:", { limit, offset });

// Utiliser morgan pour logs HTTP
// Déjà configuré dans server.js
```

### Frontend Flutter

#### Logs

```dart
import 'package:flutter/foundation.dart';

// Debug print
debugPrint('User logged in: ${user.email}');

// Conditional logging
if (kDebugMode) {
  print('Debug info: $data');
}
```

#### Flutter DevTools

```powershell
# Lancer DevTools
flutter pub global activate devtools
flutter pub global run devtools

# Ensuite lancer app et ouvrir URL affichée
```

---

## 📦 Déploiement

### Backend (Production)

#### Option 1: Heroku

```powershell
# Installer Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

heroku login
heroku create yakroactu-api
git subtree push --prefix admin heroku main

# Configurer variables d'environnement
heroku config:set MONGODB_URI=mongodb+srv://...
heroku config:set JWT_SECRET=...
```

#### Option 2: DigitalOcean / AWS / Azure

- Créer VM Ubuntu
- Installer Node.js, MongoDB
- Cloner repo, `npm install`
- Configurer Nginx reverse proxy
- Setup PM2 pour process management

### Frontend (Production)

#### Android

```powershell
cd yakro_actu

# Build APK
flutter build apk --release

# Build App Bundle (pour Play Store)
flutter build appbundle --release

# Fichiers générés dans:
# build/app/outputs/flutter-apk/app-release.apk
# build/app/outputs/bundle/release/app-release.aab
```

#### iOS (Mac uniquement)

```bash
cd yakro_actu
flutter build ios --release

# Ouvrir Xcode pour soumettre à App Store
open ios/Runner.xcworkspace
```

#### Web

```powershell
flutter build web --release

# Déployer le dossier build/web sur:
# - Firebase Hosting
# - Netlify
# - Vercel
# - GitHub Pages
```

---

## 🔐 Sécurité

### Ne JAMAIS commiter :

- ❌ `.env` (fichiers d'environnement)
- ❌ Clés API privées
- ❌ Secrets JWT
- ❌ Mots de passe
- ❌ `node_modules/`
- ❌ Fichiers de build

### Vérifier avant commit :

```powershell
# Voir ce qui sera commité
git diff --cached

# Si vous avez commité des secrets par erreur:
git rm --cached admin/.env
git commit --amend
```

---

## 📚 Ressources

### Documentation officielle

- **Node.js** : https://nodejs.org/docs
- **Express** : https://expressjs.com
- **MongoDB** : https://docs.mongodb.com
- **Mongoose** : https://mongoosejs.com/docs
- **Flutter** : https://docs.flutter.dev
- **Firebase** : https://firebase.google.com/docs

### Outils utiles

- **Postman** : Tester API → https://www.postman.com
- **MongoDB Compass** : GUI MongoDB → https://www.mongodb.com/products/compass
- **Flutter DevTools** : Debugging Flutter
- **VS Code Extensions** :
  - Flutter
  - Dart
  - ESLint
  - Prettier
  - Thunder Client (alternative Postman)
  - GitLens

---

## 💡 Bonnes pratiques

### Code Quality

#### Backend

```javascript
// ✅ BON
const getArticles = async (req, res) => {
  try {
    const { limit = 10, offset = 0 } = req.query;
    const articles = await Article.find()
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .sort({ createdAt: -1 });

    res.json({ success: true, data: articles });
  } catch (error) {
    console.error("[ArticleController] Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ❌ MAUVAIS
const getArticles = (req, res) => {
  Article.find().then((articles) => {
    res.json(articles);
  });
};
```

#### Frontend Flutter

```dart
// ✅ BON
class ArticleListScreen extends StatefulWidget {
  @override
  _ArticleListScreenState createState() => _ArticleListScreenState();
}

class _ArticleListScreenState extends State<ArticleListScreen> {
  List<Article> _articles = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadArticles();
  }

  Future<void> _loadArticles() async {
    try {
      final articles = await ApiService.getArticles();
      setState(() {
        _articles = articles;
        _isLoading = false;
      });
    } catch (e) {
      debugPrint('Error loading articles: $e');
      // Afficher message d'erreur à l'utilisateur
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) return CircularProgressIndicator();
    return ListView.builder(...);
  }
}

// ❌ MAUVAIS
class ArticleListScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return FutureBuilder(
      future: http.get('http://localhost:3000/api/articles'),
      // Mauvais: appel API dans build, pas de gestion erreur
      builder: (context, snapshot) => ...
    );
  }
}
```

---

## 🆘 Troubleshooting

### Problème : `npm install` échoue

```powershell
# Nettoyer cache npm
npm cache clean --force

# Supprimer node_modules et réinstaller
rm -rf node_modules package-lock.json
npm install
```

### Problème : `flutter pub get` échoue

```powershell
# Nettoyer projet Flutter
flutter clean
flutter pub get

# Mettre à jour Flutter
flutter upgrade
```

### Problème : Git push refusé

```powershell
# Récupérer modifications distantes
git pull origin main --rebase

# Résoudre conflits si nécessaire
git add .
git rebase --continue

# Pusher
git push
```

### Problème : MongoDB ne démarre pas

```powershell
# Windows: Démarrer service MongoDB
net start MongoDB

# Vérifier connexion
mongo --eval "db.version()"
```

---

## 👥 Contact & Support

**Repository** : https://github.com/HermannVivien/YakroActu  
**Issues** : https://github.com/HermannVivien/YakroActu/issues

Pour toute question :

1. Vérifier ce guide
2. Consulter documentation officielle
3. Créer une issue sur GitHub

---

## 📝 Checklist avant de commiter

- [ ] Code testé localement
- [ ] Tests unitaires passent (`npm test` / `flutter test`)
- [ ] Pas de `console.log()` / `debugPrint()` inutiles
- [ ] Code formaté (`npm run format` / `flutter format .`)
- [ ] Pas de fichiers sensibles (`.env`, clés API)
- [ ] Message de commit descriptif
- [ ] README/Documentation mis à jour si nécessaire

---

**Bonne chance avec le développement de YakroActu ! 🚀**
