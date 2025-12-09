import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:math';

class RecommendationService {
  static const String _userPreferencesKey = 'user_preferences';
  static const String _viewHistoryKey = 'view_history';
  static const String _interactionHistoryKey = 'interaction_history';

  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final Random _random = Random();

  // Obtenir les recommandations personnalisées
  Future<List<Map<String, dynamic>>> getPersonalizedRecommendations() async {
    final userId = _auth.currentUser?.uid;
    if (userId == null) return [];

    final preferences = await getUserPreferences();
    final history = await getViewHistory();

    // Obtenir les articles populaires
    final popularArticles = await _getPopularArticles();
    
    // Obtenir les articles similaires
    final similarArticles = await _getSimilarArticles(history);

    // Obtenir les articles basés sur les préférences
    final preferenceBasedArticles = await _getPreferenceBasedArticles(preferences);

    // Fusionner et trier les recommandations
    final recommendations = [...popularArticles, ...similarArticles, ...preferenceBasedArticles]
      ..sort((a, b) => b['score']?.compareTo(a['score'] ?? 0) ?? 0);

    // Filtrer les doublons et limiter le nombre
    return recommendations
        .toSet()
        .toList()
        .take(10)
        .toList();
  }

  // Obtenir les articles populaires
  Future<List<Map<String, dynamic>>> _getPopularArticles() async {
    final snapshot = await _firestore
        .collection('articles')
        .orderBy('views', descending: true)
        .limit(5)
        .get();

    return snapshot.docs.map((doc) => doc.data() as Map<String, dynamic>).toList();
  }

  // Obtenir les articles similaires
  Future<List<Map<String, dynamic>>> _getSimilarArticles(
      List<Map<String, dynamic>> history) async {
    if (history.isEmpty) return [];

    final categories = history
        .map((item) => item['category'])
        .toSet()
        .toList();

    final snapshot = await _firestore
        .collection('articles')
        .where('category', whereIn: categories)
        .limit(5)
        .get();

    return snapshot.docs.map((doc) => doc.data() as Map<String, dynamic>).toList();
  }

  // Obtenir les articles basés sur les préférences
  Future<List<Map<String, dynamic>>> _getPreferenceBasedArticles(
      Map<String, dynamic> preferences) async {
    if (preferences.isEmpty) return [];

    final categories = preferences['categories'] as List<dynamic>? ?? [];
    final tags = preferences['tags'] as List<dynamic>? ?? [];

    final snapshot = await _firestore
        .collection('articles')
        .where('category', whereIn: categories)
        .where('tags', arrayContainsAny: tags)
        .limit(5)
        .get();

    return snapshot.docs.map((doc) => doc.data() as Map<String, dynamic>).toList();
  }

  // Sauvegarder les préférences utilisateur
  Future<void> saveUserPreferences(Map<String, dynamic> preferences) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_userPreferencesKey, jsonEncode(preferences));
  }

  // Obtenir les préférences utilisateur
  Future<Map<String, dynamic>> getUserPreferences() async {
    final prefs = await SharedPreferences.getInstance();
    final prefsStr = prefs.getString(_userPreferencesKey);
    return prefsStr != null ? jsonDecode(prefsStr) : {};
  }

  // Sauvegarder l'historique de vue
  Future<void> saveViewHistory(Map<String, dynamic> item) async {
    final prefs = await SharedPreferences.getInstance();
    final history = prefs.getStringList(_viewHistoryKey) ?? [];
    
    final itemStr = jsonEncode(item);
    if (!history.contains(itemStr)) {
      history.insert(0, itemStr);
      if (history.length > 50) {
        history.removeLast();
      }
      await prefs.setStringList(_viewHistoryKey, history);
    }
  }

  // Obtenir l'historique de vue
  Future<List<Map<String, dynamic>>> getViewHistory() async {
    final prefs = await SharedPreferences.getInstance();
    final history = prefs.getStringList(_viewHistoryKey) ?? [];
    return history.map((item) => jsonDecode(item)).toList();
  }

  // Sauvegarder l'historique d'interaction
  Future<void> saveInteractionHistory(
      Map<String, dynamic> item, String type) async {
    final prefs = await SharedPreferences.getInstance();
    final history = prefs.getStringList(_interactionHistoryKey) ?? [];
    
    final interaction = {
      'item': item,
      'type': type,
      'timestamp': DateTime.now().toIso8601String(),
    };
    
    final interactionStr = jsonEncode(interaction);
    if (!history.contains(interactionStr)) {
      history.insert(0, interactionStr);
      if (history.length > 100) {
        history.removeLast();
      }
      await prefs.setStringList(_interactionHistoryKey, history);
    }
  }

  // Obtenir les tendances
  Future<List<Map<String, dynamic>>> getTrendingItems() async {
    final snapshot = await _firestore
        .collection('articles')
        .orderBy('trend_score', descending: true)
        .limit(10)
        .get();

    return snapshot.docs.map((doc) => doc.data() as Map<String, dynamic>).toList();
  }
}
