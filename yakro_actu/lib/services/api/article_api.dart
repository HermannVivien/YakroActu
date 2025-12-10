import 'package:dio/dio.dart';
import '../../models/article.dart';
import '../../models/comment.dart';
import 'api_service.dart';

class ArticleApi {
  final ApiService _apiService = ApiService();

  /// Obtenir tous les articles
  Future<Map<String, dynamic>> getArticles({
    int page = 1,
    int limit = 10,
    String? categoryId,
    String? search,
    String sortBy = 'createdAt',
    String order = 'desc',
  }) async {
    try {
      final response = await _apiService.get('/api/articles', queryParameters: {
        'page': page,
        'limit': limit,
        if (categoryId != null) 'categoryId': categoryId,
        if (search != null) 'search': search,
        'sortBy': sortBy,
        'order': order,
      });

      if (response.statusCode == 200 && response.data['success']) {
        final data = response.data['data'];
        return {
          'success': true,
          'articles': (data['articles'] as List)
              .map((json) => Article.fromJson(json))
              .toList(),
          'pagination': data['pagination'],
        };
      }

      return {'success': false, 'articles': [], 'pagination': {}};
    } catch (e) {
      return {'success': false, 'articles': [], 'pagination': {}};
    }
  }

  /// Obtenir un article par ID
  Future<Article?> getArticleById(int id) async {
    try {
      final response = await _apiService.get('/api/articles/$id');

      if (response.statusCode == 200 && response.data['success']) {
        return Article.fromJson(response.data['data']);
      }

      return null;
    } catch (e) {
      return null;
    }
  }

  /// Articles tendances
  Future<List<Article>> getTrendingArticles({int limit = 10}) async {
    try {
      final response = await _apiService.get(
        '/api/articles/trending',
        queryParameters: {'limit': limit},
      );

      if (response.statusCode == 200 && response.data['success']) {
        return (response.data['data'] as List)
            .map((json) => Article.fromJson(json))
            .toList();
      }

      return [];
    } catch (e) {
      return [];
    }
  }

  /// Articles à la une (breaking news)
  Future<List<Article>> getBreakingNews() async {
    try {
      final response = await _apiService.get('/api/articles/breaking');

      if (response.statusCode == 200 && response.data['success']) {
        return (response.data['data'] as List)
            .map((json) => Article.fromJson(json))
            .toList();
      }

      return [];
    } catch (e) {
      return [];
    }
  }

  /// Créer un article (journaliste+)
  Future<Article?> createArticle({
    required String title,
    required String content,
    String? excerpt,
    String? coverImage,
    required int categoryId,
    List<int>? tags,
    String status = 'DRAFT',
  }) async {
    try {
      final response = await _apiService.post('/api/articles', data: {
        'title': title,
        'content': content,
        'excerpt': excerpt,
        'coverImage': coverImage,
        'categoryId': categoryId,
        'tags': tags,
        'status': status,
      });

      if (response.statusCode == 201 && response.data['success']) {
        return Article.fromJson(response.data['data']);
      }

      return null;
    } catch (e) {
      return null;
    }
  }

  /// Mettre à jour un article
  Future<Article?> updateArticle(
    int id, {
    String? title,
    String? content,
    String? excerpt,
    String? coverImage,
    int? categoryId,
    List<int>? tags,
    String? status,
  }) async {
    try {
      final response = await _apiService.put('/api/articles/$id', data: {
        if (title != null) 'title': title,
        if (content != null) 'content': content,
        if (excerpt != null) 'excerpt': excerpt,
        if (coverImage != null) 'coverImage': coverImage,
        if (categoryId != null) 'categoryId': categoryId,
        if (tags != null) 'tags': tags,
        if (status != null) 'status': status,
      });

      if (response.statusCode == 200 && response.data['success']) {
        return Article.fromJson(response.data['data']);
      }

      return null;
    } catch (e) {
      return null;
    }
  }

  /// Supprimer un article (admin)
  Future<bool> deleteArticle(int id) async {
    try {
      final response = await _apiService.delete('/api/articles/$id');
      return response.statusCode == 200 && response.data['success'];
    } catch (e) {
      return false;
    }
  }

  /// Obtenir les commentaires d'un article
  Future<List<Comment>> getArticleComments(int articleId) async {
    try {
      final response =
          await _apiService.get('/api/articles/$articleId/comments');

      if (response.statusCode == 200 && response.data['success']) {
        return (response.data['data'] as List)
            .map((json) => Comment.fromJson(json))
            .toList();
      }

      return [];
    } catch (e) {
      return [];
    }
  }

  /// Ajouter un commentaire
  Future<Comment?> addComment(int articleId, String content) async {
    try {
      final response = await _apiService.post(
        '/api/articles/$articleId/comments',
        data: {'content': content},
      );

      if (response.statusCode == 201 && response.data['success']) {
        return Comment.fromJson(response.data['data']);
      }

      return null;
    } catch (e) {
      return null;
    }
  }

  /// Rechercher des articles
  Future<List<Article>> searchArticles(String query) async {
    try {
      final response = await _apiService.get(
        '/api/articles',
        queryParameters: {'search': query},
      );

      if (response.statusCode == 200 && response.data['success']) {
        final data = response.data['data'];
        return (data['articles'] as List)
            .map((json) => Article.fromJson(json))
            .toList();
      }

      return [];
    } catch (e) {
      return [];
    }
  }
}
