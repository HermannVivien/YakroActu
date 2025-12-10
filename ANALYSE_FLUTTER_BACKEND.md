# 📱 ANALYSE COMPLÈTE FLUTTER → BACKEND ## Projet YakroActu - Architecture Mobile & API --- ## 🔍 1. ANALYSE STRUCTURE FLUTTER ### 📂 Architecture Détectée ``` lib/ ├── main.dart ✅ Point d'entrée avec MultiProvider

├── models/ │ └── article.dart ⚠️ INCOMPLET - Manque User,
Category,
Comment,
etc. ├── routes/ │ └── app_routes.dart ✅ Navigation configurée ├── screens/ │ ├── splash_screen.dart │ ├── home_screen.dart ✅ Écran principal │ ├── chat_screen.dart ✅ Chat temps réel │ ├── notifications_screen.dart ✅ Notifications │ ├── articles/ │ │ ├── article_list_screen.dart ⚠️ TODO: Backend non implémenté │ │ └── article_detail_screen.dart ⚠️ TODO: Backend non implémenté │ └── local_points/ ✅ Points locaux (pharmacies) ├── services/ │ ├── auth/ │ │ └── auth_service.dart 🔴 FIREBASE - À migrer vers backend Node.js │ ├── chat/ │ │ ├── chat_service.dart 🔴 FIREBASE+Socket.IO │ │ └── socket_service.dart ⚠️ URL hardcodée placeholder │ ├── notifications/ │ │ └── notification_service.dart 🔴 FIREBASE MESSAGING │ ├── search/ │ │ └── search_service.dart 🔴 FIRESTORE - À migrer │ ├── recommendation_service.dart ✅ HTTP REST (partiel) │ ├── location_service.dart ✅ Géolocalisation │ └── theme_service.dart ✅ Thème └── widgets/ ✅ Composants réutilisables ```--- ## 🔴 PROBLÈMES CRITIQUES DÉTECTÉS ### 1. **DÉPENDANCE FIREBASE AU LIEU DE BACKEND NODE.JS** - ❌`auth_service.dart`utilise Firebase Auth au lieu de JWT backend - ❌`chat_service.dart`utilise Firestore au lieu de MySQL/Prisma - ❌`search_service.dart` utilise Firestore au lieu d'API REST

- ❌ Pas de gestion centralisée des appels API ### 2. **MODÈLES INCOMPLETS** - ❌ Seul `article.dart` existe - ❌ Manque : User,
  Category,
  Tag,
  Comment,
  Pharmacy,
  FlashInfo,
  Media,
  Notification ### 3. **PAS DE COUCHE API SERVICE** - ❌ Pas de `api_service.dart` centralisé - ❌ Pas de gestion d'intercepteurs HTTP
- ❌ Pas de gestion des tokens JWT - ❌ URL hardcodées (`http: //your-backend-url`)

      ### 4. **STATE MANAGEMENT BASIQUE** - ⚠️ Provider utilisé mais pas de pattern MVVM/Repository - ⚠️ Pas de séparation entre UI et logique métier - ⚠️ Pas de gestion d'état pour les articles, catégories, etc.

      ### 5. **SÉCURITÉ** - ❌ Pas de stockage sécurisé des tokens (flutter_secure_storage) - ❌ Pas de refresh token - ❌ Pas de gestion d'expiration


      --- ## 📊 2. MAPPING FLUTTER ↔️ BACKEND ### 🗂️ Modèles Flutter → Prisma | **Flutter Model** | **Champs Détectés** | **Prisma Model** | **Champs Manquants** | | -------------------------- | ---------------------------------------------------------------------------------------------- | ---------------- | ----------------------------------------------------------------------------------------- | | `Article` | id, title, description, imageUrl, category, publishedAt, views, tags, isFeatured, isBookmarked | `Article` | ❌ content (texte complet), authorId, categoryId (INT), status, slug, excerpt, coverImage | | ❌ **Manque User** | - | `User` | id, email, password, firstName, lastName, phone, avatar, role, status | | ❌ **Manque Category** | - | `Category` | id, name, slug, description, icon, color | | ❌ **Manque Comment** | - | `Comment` | id, content, userId, articleId, createdAt | | ❌ **Manque Favorite** | - | `Favorite` | id, userId, articleId, createdAt | | ❌ **Manque Pharmacy** | - | `Pharmacy` | id, name, address, phone, latitude, longitude, isOnDuty | | ❌ **Manque FlashInfo** | - | `FlashInfo` | id, title, content, priority, expiresAt | | ❌ **Manque Notification** | - | `Notification` | id, userId, title, body, type, isRead | --- ### 🔌 Services Flutter → Endpoints Backend | **Flutter Service** | **Méthode** | **Backend Endpoint** | **Statut** | | ----------------------------- | ------------------------------ | ------------------------------------ | --------------------- | | `auth_service.dart` | `signInWithEmailAndPassword()` | `POST /api/auth/login` | 🔴 Firebase → Migrer | | `auth_service.dart` | `signUpWithEmailAndPassword()` | `POST /api/auth/register` | 🔴 Firebase → Migrer | | `auth_service.dart` | `signOut()` | `POST /api/auth/logout` | 🔴 Firebase → Migrer | | `auth_service.dart` | `resetPassword()` | `POST /api/auth/forgot-password` | 🔴 Firebase → Migrer | | `auth_service.dart` | `getCurrentUser()` | `GET /api/users/me` | ❌ À créer | | `search_service.dart` | `searchArticles()` | `GET /api/articles?search= {
          query
      }

      ` | 🔴 Firestore → Migrer | | `search_service.dart` | `searchPharmacies()` | `GET /api/pharmacies?search= {
          query
      }

      ` | 🔴 Firestore → Migrer | | `chat_service.dart` | `getMessages()` | `GET /api/chats/:chatId/messages` | 🔴 Firestore → Migrer | | `chat_service.dart` | `sendMessage()` | `POST /api/chats/:chatId/messages` | 🔴 Firestore → Migrer | | `recommendation_service.dart` | `getRecommendedArticles()` | `GET /api/recommendations/articles` | ✅ Existe (partiel) | | ❌ **Manque ArticleService** | `getArticles()` | `GET /api/articles` | ❌ À créer | | ❌ **Manque ArticleService** | `getArticleById()` | `GET /api/articles/:id` | ❌ À créer | | ❌ **Manque CategoryService** | `getCategories()` | `GET /api/categories` | ❌ À créer | | ❌ **Manque PharmacyService** | `getPharmacies()` | `GET /api/pharmacies` | ❌ À créer | | ❌ **Manque CommentService** | `getComments()` | `GET /api/articles/:id/comments` | ❌ À créer | | ❌ **Manque CommentService** | `addComment()` | `POST /api/articles/:id/comments` | ❌ À créer | | ❌ **Manque FavoriteService** | `toggleFavorite()` | `POST /api/favorites` | ❌ À créer | --- ### 📱 Screens → API Calls | **Screen** | **API Calls Nécessaires** | **Statut** | | ---------------------------- | ----------------------------------------------------------------------------------------------------------- | --------------------- | | `home_screen.dart` | `GET /api/articles?featured=true`<br>`GET /api/flash-info?active=true`<br>`GET /api/pharmacies?onDuty=true` | ❌ Hardcodé | | `article_list_screen.dart` | `GET /api/articles?category= {
          id
      }

      &page= {
          n
      }

      &limit=10` | ❌ TODO commenté | | `article_detail_screen.dart` | `GET /api/articles/:id`<br>`GET /api/articles/:id/comments`<br>`POST /api/favorites` | ❌ TODO commenté | | `chat_screen.dart` | `GET /api/chats/:chatId/messages`<br>`POST /api/chats/:chatId/messages`<br>`WebSocket: /socket/chat` | 🔴 Firebase | | `notifications_screen.dart` | `GET /api/notifications`<br>`PATCH /api/notifications/:id/read` | 🔴 Firebase Messaging | | `login_screen.dart` | `POST /api/auth/login`<br>`POST /api/auth/register` | 🔴 Firebase Auth | --- ## 🏗️ 3. ARCHITECTURE BACKEND CORRESPONDANTE ### 📋 Schéma Prisma Complet Aligné ```prisma // ==================== USER MODEL ====================

      model User {
          id Int @id @default(autoincrement()) email String @unique password String firstName String lastName String phone String? avatar String? role UserRole @default(USER) // USER, JOURNALIST, ADMIN
          status UserStatus @default(ACTIVE) createdAt DateTime @default(now()) updatedAt DateTime @updatedAt articles Article[] comments Comment[] favorites Favorite[] notifications Notification[] chatMessages ChatMessage[]
      }

      // ==================== ARTICLE MODEL ====================
      model Article {
          id Int @id @default(autoincrement()) title String @db.VarChar(500) slug String @unique content String @db.LongText // ⚠️ Manque dans Flutter
          excerpt String? @db.Text coverImage String? // ≈ imageUrl dans Flutter
          status ArticleStatus @default(DRAFT) viewCount Int @default(0) // ≈ views dans Flutter
          isPinned Boolean @default(false) // ≈ isFeatured dans Flutter
          isBreaking Boolean @default(false) publishedAt DateTime? createdAt DateTime @default(now()) updatedAt DateTime @updatedAt categoryId Int category Category @relation(fields: [categoryId], references: [id]) authorId Int author User @relation(fields: [authorId], references: [id]) tags ArticleTag[] comments Comment[] favorites Favorite[]
      }

      // ==================== CATEGORY MODEL ====================
      model Category {
          id Int @id @default(autoincrement()) name String slug String @unique description String? icon String? color String? createdAt DateTime @default(now()) articles Article[]
      }

      // ==================== TAG MODEL ====================
      model Tag {
          id Int @id @default(autoincrement()) name String slug String @unique articles ArticleTag[]
      }

      // ==================== COMMENT MODEL ====================
      model Comment {
          id Int @id @default(autoincrement()) content String @db.Text createdAt DateTime @default(now()) userId Int user User @relation(fields: [userId], references: [id]) articleId Int article Article @relation(fields: [articleId], references: [id])
      }

      // ==================== FAVORITE MODEL ====================
      model Favorite {
          id Int @id @default(autoincrement()) createdAt DateTime @default(now()) userId Int user User @relation(fields: [userId], references: [id]) articleId Int article Article @relation(fields: [articleId], references: [id]) @@unique([userId, articleId])
      }

      // ==================== PHARMACY MODEL ====================
      model Pharmacy {
          id Int @id @default(autoincrement()) name String address String commune String? phone String latitude Float? longitude Float? openingHours String? isOnDuty Boolean @default(false) createdAt DateTime @default(now())
      }

      // ==================== FLASH INFO MODEL ====================
      model FlashInfo {
          id Int @id @default(autoincrement()) title String content String @db.Text priority Priority @default(NORMAL) isActive Boolean @default(true) expiresAt DateTime? createdAt DateTime @default(now())
      }

      // ==================== NOTIFICATION MODEL ====================
      model Notification {
          id Int @id @default(autoincrement()) title String body String @db.Text type NotificationType isRead Boolean @default(false) data Json? createdAt DateTime @default(now()) userId Int user User @relation(fields: [userId], references: [id])
      }

      // ==================== CHAT MODELS ====================
      model Chat {
          id Int @id @default(autoincrement()) participants String // JSON array of user IDs
          lastMessage String? createdAt DateTime @default(now()) updatedAt DateTime @updatedAt messages ChatMessage[]
      }

      model ChatMessage {
          id Int @id @default(autoincrement()) content String @db.Text type String @default("text") createdAt DateTime @default(now()) chatId Int chat Chat @relation(fields: [chatId], references: [id]) senderId Int sender User @relation(fields: [senderId], references: [id])
      }

      // ==================== ENUMS ====================
      enum UserRole {
          USER JOURNALIST ADMIN
      }

      enum UserStatus {
          ACTIVE SUSPENDED PENDING
      }

      enum ArticleStatus {
          DRAFT PUBLISHED ARCHIVED
      }

      enum Priority {
          LOW NORMAL HIGH URGENT
      }

      enum NotificationType {
          INFO WARNING SUCCESS ERROR ARTICLE COMMENT CHAT
      }

      ``` --- ### 🔌 Endpoints REST Complets #### **🔐 Authentication** ``` POST /api/auth/register # Inscription POST /api/auth/login # Connexion (retourne JWT) POST /api/auth/refresh # Rafraîchir token POST /api/auth/logout # Déconnexion POST /api/auth/forgot-password # Mot de passe oublié POST /api/auth/reset-password # Réinitialiser mot de passe ``` #### **👤 Users** ``` GET /api/users/me # Profil utilisateur connecté PUT /api/users/me # Mettre à jour profil GET /api/users/:id # Profil public GET /api/users # Liste (admin) DELETE /api/users/:id # Supprimer (admin) ``` #### **📰 Articles** ``` GET /api/articles # Liste paginée GET /api/articles/:id # Détail article POST /api/articles # Créer (journalist+) PUT /api/articles/:id # Modifier (journalist+) DELETE /api/articles/:id # Supprimer (admin) GET /api/articles/trending # Articles populaires GET /api/articles/breaking # Breaking news GET /api/articles/:id/comments # Commentaires d'un article

  POST /api/articles/:id/comments # Ajouter commentaire GET /api/articles?category=:id # Par catégorie GET /api/articles?search=:query # Recherche `#### **📁 Categories**` GET /api/categories # Liste complète GET /api/categories/:id # Détail POST /api/categories # Créer (admin) PUT /api/categories/:id # Modifier (admin) DELETE /api/categories/:id # Supprimer (admin) `#### **⭐ Favorites**` GET /api/favorites # Mes favoris POST /api/favorites # Ajouter favori DELETE /api/favorites/:articleId # Retirer favori `#### **💊 Pharmacies**` GET /api/pharmacies # Liste pharmacies GET /api/pharmacies/on-duty # Pharmacies de garde GET /api/pharmacies/:id # Détail POST /api/pharmacies # Créer (admin) PUT /api/pharmacies/:id # Modifier (admin) `#### **⚡ Flash Info**` GET /api/flash-info # Flash info actifs GET /api/flash-info/:id # Détail POST /api/flash-info # Créer (admin) PUT /api/flash-info/:id # Modifier (admin) DELETE /api/flash-info/:id # Supprimer (admin) `#### **🔔 Notifications**` GET /api/notifications # Mes notifications PATCH /api/notifications/:id/read # Marquer comme lu DELETE /api/notifications/:id # Supprimer POST /api/notifications/register-device # Enregistrer token FCM `#### **💬 Chat**` GET /api/chats # Mes conversations GET /api/chats/:id # Détail conversation POST /api/chats # Créer conversation GET /api/chats/:id/messages # Messages POST /api/chats/:id/messages # Envoyer message WebSocket /socket/chat # Temps réel `#### **🔍 Search**` GET /api/search?q=:query # Recherche globale GET /api/search/articles?q=:query # Recherche articles GET /api/search/pharmacies?q=:query # Recherche pharmacies `#### **🎯 Recommendations**` GET /api/recommendations/articles # Articles recommandés GET /api/recommendations/local-points # Points locaux POST /api/recommendations/track # Tracker interaction POST /api/recommendations/preferences # Préférences `#### **📊 Analytics**` GET /api/analytics/dashboard # Dashboard (admin) GET /api/analytics/articles/:id # Stats article POST /api/analytics/track # Tracker vue `--- ## 🔒 4. STRATÉGIE AUTHENTIFICATION JWT ### Backend (Node.js)`javascript // POST /api/auth/login

          {
          email: "user@example.com",
          password: "password123"
      }

      // Response
          {

          success: true,
          data: {
              user: {
                  id: 1,
                  email: "user@example.com",
                  firstName: "John",
                  lastName: "Doe",
                  role: "USER",
                  avatar: "https://..."
              }

              ,
              accessToken: "eyJhbGciOiJIUzI1NiIs...", // 15min
              refreshToken: "eyJhbGciOiJIUzI1NiIs..." // 7 jours
          }
      }

      ``` ### Flutter (À créer) ```dart // lib/services/api/api_service.dart

      class ApiService {
          static const String baseUrl='https://api.yakroactu.com';

          final Dio _dio=Dio();
          String? _accessToken;
          String? _refreshToken;

          // Intercepteur pour ajouter JWT automatiquement
          void _setupInterceptors() {
              _dio.interceptors.add(InterceptorsWrapper(onRequest: (options, handler) {
                          if (_accessToken !=null) {
                              options.headers['Authorization']='Bearer $_accessToken';
                          }

                          return handler.next(options);
                      }

                      ,
                      onError: (error, handler) async {
                          if (error.response?.statusCode==401) {
                              // Token expiré, refresh
                              await _refreshAccessToken();
                              return handler.resolve(await _retry(error.requestOptions));
                          }

                          return handler.next(error);
                      }

                      ,
                  ));
          }

          Future<void> login(String email, String password) async {
              final response=await _dio.post('$baseUrl/api/auth/login', data: {
                      'email': email,
                      'password': password,
                  }

              );

              _accessToken=response.data['data']['accessToken'];
              _refreshToken=response.data['data']['refreshToken'];

              // Stocker tokens de manière sécurisée
              await _secureStorage.write(key: 'accessToken', value: _accessToken);
              await _secureStorage.write(key: 'refreshToken', value: _refreshToken);
          }
      }

      ``` --- ## ✅ 5. AUDIT COMPLET ### 🔴 **CRITIQUE** 1. **Dépendance Firebase** - Firebase Auth au lieu de JWT backend - Firestore au lieu de MySQL/Prisma - Migration urgente nécessaire 2. **Pas de couche API** - Aucun service HTTP centralisé - Pas de gestion des tokens - URLs hardcodées 3. **Modèles incomplets** - Seul Article existe - Manque 8+ modèles critiques ### ⚠️ **IMPORTANT** 1. **State Management** - Provider OK mais architecture à améliorer - Pattern Repository recommandé - BLoC ou Riverpod pour scaling 2. **Sécurité** - Pas de flutter_secure_storage - Pas de refresh token - Pas de validation côté client 3. **Performance** - Pas de pagination - Pas de cache local (hive/sqflite) - Images non optimisées ### ✅ **BON** 1. Navigation bien structurée 2. UI/UX cohérente 3. Thème dynamique 4. Géolocalisation fonctionnelle 5. Notifications locales --- ## 🚀 6. PLAN D'ACTION PRIORITAIRE

      ### **PHASE 1 : BACKEND (1-2 semaines)** #### ✅ Déjà fait - [x] Schéma Prisma complet - [x] Structure backend Express - [x] Middleware auth JWT - [x] Controllers articles/users #### 🔲 À compléter - [] Implémenter tous les endpoints REST - [] WebSocket pour chat temps réel - [] Notifications push (FCM) - [] Upload médias (Cloudinary) - [] Tests unitaires - [] Documentation Swagger complète ### **PHASE 2 : FLUTTER - MIGRATION FIREBASE → API REST (2-3 semaines)** #### 🔥 **URGENT : Créer couche API** ``` lib/services/api/ ├── api_service.dart # ⭐ Service HTTP centralisé (Dio) ├── auth_api.dart # Appels auth ├── article_api.dart # Appels articles ├── category_api.dart # Appels catégories ├── pharmacy_api.dart # Appels pharmacies ├── chat_api.dart # Appels chat ├── notification_api.dart # Appels notifications └── interceptors/ ├── auth_interceptor.dart # JWT auto ├── error_interceptor.dart # Gestion erreurs └── logger_interceptor.dart # Logs ``` #### 🔄 **Migrer services Firebase** 1. **auth_service.dart** ```dart // AVANT (Firebase)
      await _auth.signInWithEmailAndPassword(email, password);

      // APRÈS (API REST)
      await _apiService.post('/api/auth/login', {
              'email': email,
              'password': password
          }

      );
      ``` 2. **search_service.dart** ```dart // AVANT (Firestore)
      await _firestore.collection('articles').where('title', isGreaterThanOrEqualTo: query).get();

      // APRÈS (API REST)
      await _apiService.get('/api/articles', queryParams: {
              'search': query
          }

      );
      ``` 3. **chat_service.dart** ```dart // AVANT (Firestore)
      _firestore.collection('chats').doc(chatId).collection('messages').snapshots();

      // APRÈS (WebSocket + API)
      _socketService.connect();
      _socketService.joinRoom(chatId);
      await _apiService.get('/api/chats/$chatId/messages');
      ``` #### 📦 **Créer modèles manquants** ``` lib/models/ ├── article.dart # ✅ Existe ├── user.dart # ❌ À créer ├── category.dart # ❌ À créer ├── tag.dart # ❌ À créer ├── comment.dart # ❌ À créer ├── favorite.dart # ❌ À créer ├── pharmacy.dart # ❌ À créer ├── flash_info.dart # ❌ À créer ├── notification.dart # ❌ À créer ├── chat.dart # ❌ À créer └── chat_message.dart # ❌ À créer ``` #### 🏗️ **Architecture Repository Pattern** ``` lib/ ├── data/ │ ├── repositories/ │ │ ├── article_repository.dart │ │ ├── auth_repository.dart │ │ └── ... │ └── providers/ │ ├── article_provider.dart │ └── ... ├── domain/ │ ├── entities/ │ └── use_cases/ └── presentation/ ├── screens/ └── widgets/ ``` ### **PHASE 3 : OPTIMISATIONS (1 semaine)** 1. **Cache local** - Hive pour cache offline - Stratégie cache-first 2. **Performance** - Lazy loading - Pagination infinie - Image optimization 3. **Sécurité** - flutter_secure_storage - Certificate pinning - Validation inputs ### **PHASE 4 : TESTS & DÉPLOIEMENT (1 semaine)** 1. Tests unitaires 2. Tests d'intégration

3. CI/CD pipeline 4. Déploiement backend cPanel 5. Release Flutter (Android/iOS) --- ## 📝 CHECKLIST IMMÉDIATE ### Backend - [] Compléter tous les controllers manquants - [] Implémenter WebSocket chat - [] Configurer FCM notifications - [] Tester tous les endpoints - [] Déployer sur cPanel ### Flutter - [] Créer `api_service.dart` avec Dio - [] Migrer `auth_service.dart` de Firebase → API - [] Créer tous les modèles manquants - [] Créer repositories - [] Implémenter gestion tokens JWT - [] Remplacer Firestore par API REST - [] Tester intégration complète --- ## 🎯 RÉSULTAT ATTENDU Après implémentation : ✅ Backend Node.js + Express + Prisma + MySQL complet ✅ Flutter avec architecture clean (Repository Pattern) ✅ Communication 100% API REST + WebSocket ✅ Authentification JWT sécurisée ✅ Cache local + performance optimisée ✅ Code maintenable et scalable ✅ Documentation complète **Temps estimé total : 5-7 semaines** --- ## 💡 RECOMMANDATIONS FINALES 1. **Abandonnez Firebase** pour ce projet (sauf FCM pour push) 2. **Créez la couche API en priorité** avant tout 3. **Adoptez Repository Pattern** pour découpler la logique 4. **Utilisez Dio** au lieu de http package (intercepteurs, timeout, etc.) 5. **Implémentez le cache** dès le début 6. **Tests automatisés** dès maintenant Voulez-vous que je génère les fichiers Flutter manquants maintenant ?
