import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../models/forum.dart';

class ForumService {
  static const String baseUrl = 'http://localhost:5000/api/forum';

  // ========== Categories ==========

  Future<List<ForumCategory>> getCategories() async {
    final response = await http.get(Uri.parse('$baseUrl/categories'));

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      return (data['data'] as List)
          .map((json) => ForumCategory.fromJson(json))
          .toList();
    } else {
      throw Exception('Échec du chargement des catégories');
    }
  }

  Future<ForumCategory> getCategoryById(int id) async {
    final response = await http.get(Uri.parse('$baseUrl/categories/$id'));

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      return ForumCategory.fromJson(data['data']);
    } else {
      throw Exception('Échec du chargement de la catégorie');
    }
  }

  // ========== Topics ==========

  Future<List<ForumTopic>> getTopics({
    int page = 1,
    int limit = 20,
    int? categoryId,
    bool? isPinned,
  }) async {
    final queryParams = {
      'page': page.toString(),
      'limit': limit.toString(),
      if (categoryId != null) 'categoryId': categoryId.toString(),
      if (isPinned != null) 'isPinned': isPinned.toString(),
    };

    final uri =
        Uri.parse('$baseUrl/topics').replace(queryParameters: queryParams);
    final response = await http.get(uri);

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      return (data['data'] as List)
          .map((json) => ForumTopic.fromJson(json))
          .toList();
    } else {
      throw Exception('Échec du chargement des topics');
    }
  }

  Future<ForumTopic> getTopicById(int id) async {
    final response = await http.get(Uri.parse('$baseUrl/topics/$id'));

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      return ForumTopic.fromJson(data['data']);
    } else {
      throw Exception('Échec du chargement du topic');
    }
  }

  Future<ForumTopic> createTopic({
    required String title,
    required String content,
    required int categoryId,
    required String token,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/topics'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: json.encode({
        'title': title,
        'content': content,
        'categoryId': categoryId,
      }),
    );

    if (response.statusCode == 201) {
      final data = json.decode(response.body);
      return ForumTopic.fromJson(data['data']);
    } else {
      throw Exception('Échec de la création du topic');
    }
  }

  Future<void> incrementTopicViews(int id) async {
    await http.post(Uri.parse('$baseUrl/topics/$id/view'));
  }

  // ========== Posts ==========

  Future<List<ForumPost>> getPosts({
    required int topicId,
    int page = 1,
    int limit = 20,
  }) async {
    final queryParams = {
      'topicId': topicId.toString(),
      'page': page.toString(),
      'limit': limit.toString(),
    };

    final uri =
        Uri.parse('$baseUrl/posts').replace(queryParameters: queryParams);
    final response = await http.get(uri);

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      return (data['data'] as List)
          .map((json) => ForumPost.fromJson(json))
          .toList();
    } else {
      throw Exception('Échec du chargement des posts');
    }
  }

  Future<ForumPost> createPost({
    required String content,
    required int topicId,
    int? parentId,
    required String token,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/posts'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: json.encode({
        'content': content,
        'topicId': topicId,
        if (parentId != null) 'parentId': parentId,
      }),
    );

    if (response.statusCode == 201) {
      final data = json.decode(response.body);
      return ForumPost.fromJson(data['data']);
    } else {
      throw Exception('Échec de la création du post');
    }
  }

  Future<void> votePost(int id, String voteType, String token) async {
    await http.post(
      Uri.parse('$baseUrl/posts/$id/vote'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: json.encode({'voteType': voteType}),
    );
  }

  Future<void> deletePost(int id, String token) async {
    await http.delete(
      Uri.parse('$baseUrl/posts/$id'),
      headers: {'Authorization': 'Bearer $token'},
    );
  }
}
