import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../models/article.dart';
import '../models/local_point.dart';

class RecommendationService {
  final String _baseUrl = 'https://api.yakroactu.com';
  final SharedPreferences _prefs;

  RecommendationService(this._prefs);

  Future<List<Article>> getRecommendedArticles() async {
    try {
      final response = await http.get(Uri.parse('$_baseUrl/api/recommendations/articles'));
      if (response.statusCode == 200) {
        return (json.decode(response.body) as List)
            .map((data) => Article.fromJson(data))
            .toList();
      }
      return [];
    } catch (e) {
      print('Error fetching recommendations: $e');
      return [];
    }
  }

  Future<List<LocalPoint>> getRecommendedLocalPoints() async {
    try {
      final response = await http.get(Uri.parse('$_baseUrl/api/recommendations/local-points'));
      if (response.statusCode == 200) {
        return (json.decode(response.body) as List)
            .map((data) => LocalPoint.fromJson(data))
            .toList();
      }
      return [];
    } catch (e) {
      print('Error fetching local points: $e');
      return [];
    }
  }

  Future<void> trackArticleInteraction(String articleId, String action) async {
    try {
      await http.post(
        Uri.parse('$_baseUrl/api/recommendations/track'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'articleId': articleId, 'action': action}),
      );
    } catch (e) {
      print('Error tracking interaction: $e');
    }
  }

  Future<void> updatePreferences(List<String> categories) async {
    try {
      await _prefs.setStringList('preferences', categories);
      await http.post(
        Uri.parse('$_baseUrl/api/recommendations/preferences'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'categories': categories}),
      );
    } catch (e) {
      print('Error updating preferences: $e');
    }
  }
}
