import 'dart:convert';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:shared_preferences/shared_preferences.dart';

class SearchService {
  static const String _searchHistoryKey = 'search_history';
  static const String _searchPreferencesKey = 'search_preferences';

  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final FirebaseAuth _auth = FirebaseAuth.instance;

  // Rechercher des articles
  Future<List<Map<String, dynamic>>> searchArticles(String query) async {
    final userId = _auth.currentUser?.uid;
    if (userId == null) return [];

    final articles = await _firestore
        .collection('articles')
        .where('title', isGreaterThanOrEqualTo: query.toLowerCase())
        .where('title', isLessThan: query.toLowerCase() + 'z')
        .limit(10)
        .get();

    return articles.docs.map((doc) => doc.data() as Map<String, dynamic>).toList();
  }

  // Rechercher des flash info
  Future<List<Map<String, dynamic>>> searchFlashInfo(String query) async {
    final userId = _auth.currentUser?.uid;
    if (userId == null) return [];

    final flashInfo = await _firestore
        .collection('flash_info')
        .where('content', isGreaterThanOrEqualTo: query.toLowerCase())
        .where('content', isLessThan: query.toLowerCase() + 'z')
        .limit(10)
        .get();

    return flashInfo.docs.map((doc) => doc.data() as Map<String, dynamic>).toList();
  }

  // Rechercher des pharmacies
  Future<List<Map<String, dynamic>>> searchPharmacies(String query) async {
    final userId = _auth.currentUser?.uid;
    if (userId == null) return [];

    final pharmacies = await _firestore
        .collection('pharmacies')
        .where('name', isGreaterThanOrEqualTo: query.toLowerCase())
        .where('name', isLessThan: query.toLowerCase() + 'z')
        .limit(10)
        .get();

    return pharmacies.docs.map((doc) => doc.data() as Map<String, dynamic>).toList();
  }

  // Sauvegarder l'historique de recherche
  Future<void> saveSearchHistory(String query) async {
    final prefs = await SharedPreferences.getInstance();
    final history = prefs.getStringList(_searchHistoryKey) ?? [];
    
    if (!history.contains(query)) {
      history.insert(0, query);
      if (history.length > 10) {
        history.removeLast();
      }
      await prefs.setStringList(_searchHistoryKey, history);
    }
  }

  // Obtenir l'historique de recherche
  Future<List<String>> getSearchHistory() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getStringList(_searchHistoryKey) ?? [];
  }

  // Sauvegarder les préférences de recherche
  Future<void> saveSearchPreferences(Map<String, dynamic> preferences) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_searchPreferencesKey, jsonEncode(preferences));
  }

  // Obtenir les préférences de recherche
  Future<Map<String, dynamic>> getSearchPreferences() async {
    final prefs = await SharedPreferences.getInstance();
    final prefsStr = prefs.getString(_searchPreferencesKey);
    return prefsStr != null ? jsonDecode(prefsStr) : {};
  }

  // Recherche globale
  Future<List<Map<String, dynamic>>> searchAll(String query) async {
    final articles = await searchArticles(query);
    final flashInfo = await searchFlashInfo(query);
    final pharmacies = await searchPharmacies(query);

    return [...articles, ...flashInfo, ...pharmacies];
  }

  // Suggestions de recherche
  Future<List<String>> getSearchSuggestions(String query) async {
    final history = await getSearchHistory();
    final suggestions = history
        .where((item) => item.toLowerCase().contains(query.toLowerCase()))
        .toList();

    return suggestions.take(5).toList();
  }
}
