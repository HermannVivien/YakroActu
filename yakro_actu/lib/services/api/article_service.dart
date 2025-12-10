import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../models/article.dart';

class ArticleService {
  final String baseUrl = 'http://localhost:5000/api';

  Future<List<Article>> getArticles({
    int page = 1,
    int limit = 20,
    String? category,
    String? subcategory,
    bool? isFeatured,
    bool? isBreaking,
  }) async {
    var queryParams = {
      'page': page.toString(),
      'limit': limit.toString(),
      if (category != null) 'category': category,
      if (subcategory != null) 'subcategory': subcategory,
      if (isFeatured != null) 'isFeatured': isFeatured.toString(),
      if (isBreaking != null) 'isBreaking': isBreaking.toString(),
    };

    final uri = Uri.parse('$baseUrl/articles')
        .replace(queryParameters: queryParams);
    final response = await http.get(uri);

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      return (data['data'] as List)
          .map((json) => Article.fromJson(json))
          .toList();
    } else {
      throw Exception('Erreur de chargement des articles');
    }
  }

  Future<Article> getArticleById(int id) async {
    final response = await http.get(Uri.parse('$baseUrl/articles/$id'));

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      return Article.fromJson(data['data']);
    } else {
      throw Exception('Article non trouvé');
    }
  }

  Future<Article> getArticleBySlug(String slug) async {
    final response = await http.get(Uri.parse('$baseUrl/articles/slug/$slug'));

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      return Article.fromJson(data['data']);
    } else {
      throw Exception('Article non trouvé');
    }
  }

  Future<void> incrementViewCount(int id) async {
    await http.post(Uri.parse('$baseUrl/articles/$id/view'));
  }
}
