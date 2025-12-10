import 'package:flutter/material.dart';
import 'package:page_transition/page_transition.dart';

import '../screens/splash_screen.dart';
import '../screens/home/home_screen.dart';
import '../screens/chat_screen.dart';
import '../screens/notifications_screen.dart';
import '../screens/auth/login_screen.dart';
import '../screens/settings_screen.dart';
import '../screens/article/article_detail_screen.dart';
import '../screens/local_points/local_points_list.dart';
import '../screens/local_points/local_point_detail_screen.dart';
import '../widgets/geolocated_articles_map.dart';
import '../models/article.dart';
import '../models/reportage.dart';

// Routes principales
enum AppRoutes {
  splash,
  home,
  chat,
  notifications,
  login,
  settings,
  articles,
  articleDetail,
  localPoints,
  localPointDetail,
  geolocatedArticles
}

// Générer une route avec animation
Route<dynamic> generateRoute(RouteSettings settings) {
  final args = settings.arguments;

  switch (settings.name) {
    case '/':
      return _buildRoute(const SplashScreen(), settings);
    case '/home':
      return _buildRoute(const HomeScreen(), settings);
    case '/chat':
      if (args is Map<String, dynamic>) {
        return _buildRoute(
          ChatScreen(
            chatId: args['chatId'],
            otherUserId: args['otherUserId'],
            otherUserName: args['otherUserName'],
            otherUserImage: args['otherUserImage'],
          ),
          settings,
        );
      }
      return _buildRoute(const HomeScreen(), settings);
    case '/notifications':
      return _buildRoute(const NotificationsScreen(), settings);
    case '/login':
      return _buildRoute(const LoginScreen(), settings);
    case '/settings':
      return _buildRoute(const SettingsScreen(), settings);
    case '/article-detail':
      if (args is Article) {
        return _buildRoute(ArticleDetailScreen(article: args), settings);
      }
      return _buildRoute(const HomeScreen(), settings);
    case '/local-points':
      return _buildRoute(const LocalPointsList(), settings);
    case '/local-point-detail':
      // LocalPoint model needs to be imported if used
      return _buildRoute(const LocalPointsList(), settings);
    case '/geolocated-articles':
      // GeolocatedArticlesMap needs to handle arguments properly
      return _buildRoute(const HomeScreen(), settings);
    default:
      return _buildRoute(const HomeScreen(), settings);
  }
}

// Construire une route avec animation
Route<dynamic> _buildRoute(Widget widget, RouteSettings settings) {
  return PageTransition(
    type: PageTransitionType.fade,
    child: widget,
    settings: settings,
    duration: const Duration(milliseconds: 300),
    reverseDuration: const Duration(milliseconds: 300),
  );
}

// Générer une route pour le chat avec animation spécifique
Route<dynamic> generateChatRoute(String chatId, String otherUserId, String otherUserName, {String? otherUserImage}) {
  return PageTransition(
    type: PageTransitionType.rightToLeft,
    child: ChatScreen(
      chatId: chatId,
      otherUserId: otherUserId,
      otherUserName: otherUserName,
      otherUserImage: otherUserImage,
    ),
    duration: const Duration(milliseconds: 300),
    reverseDuration: const Duration(milliseconds: 300),
  );
}

// Générer une route pour les détails avec animation spécifique
Route<dynamic> generateDetailsRoute(Widget detailsScreen) {
  return PageTransition(
    type: PageTransitionType.fade,
    child: detailsScreen,
    duration: const Duration(milliseconds: 300),
    reverseDuration: const Duration(milliseconds: 300),
  );
}

// Générer une route pour les notifications avec animation spécifique
Route<dynamic> generateNotificationsRoute() {
  return PageTransition(
    type: PageTransitionType.bottomToTop,
    child: const NotificationsScreen(),
    duration: const Duration(milliseconds: 300),
    reverseDuration: const Duration(milliseconds: 300),
  );
}

// Générer une route pour les paramètres avec animation spécifique
Route<dynamic> generateSettingsRoute() {
  return PageTransition(
    type: PageTransitionType.leftToRight,
    child: const SettingsScreen(),
    duration: const Duration(milliseconds: 300),
    reverseDuration: const Duration(milliseconds: 300),
  );
}
