import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../models/interview.dart';

class InterviewService {
  static const String baseUrl = 'http://localhost:5000/api';

  Future<List<Interview>> getInterviews({
    int page = 1,
    int limit = 10,
    String? category,
    bool? isFeatured,
  }) async {
    final queryParams = {
      'page': page.toString(),
      'limit': limit.toString(),
      if (category != null) 'category': category,
      if (isFeatured != null) 'isFeatured': isFeatured.toString(),
    };

    final uri =
        Uri.parse('$baseUrl/interviews').replace(queryParameters: queryParams);
    final response = await http.get(uri);

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      return (data['data'] as List)
          .map((json) => Interview.fromJson(json))
          .toList();
    } else {
      throw Exception('Échec du chargement des interviews');
    }
  }

  Future<Interview> getInterviewById(int id) async {
    final response = await http.get(Uri.parse('$baseUrl/interviews/$id'));

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      return Interview.fromJson(data['data']);
    } else {
      throw Exception('Échec du chargement de l\'interview');
    }
  }

  Future<Interview> getInterviewBySlug(String slug) async {
    final response =
        await http.get(Uri.parse('$baseUrl/interviews/slug/$slug'));

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      return Interview.fromJson(data['data']);
    } else {
      throw Exception('Échec du chargement de l\'interview');
    }
  }

  Future<void> incrementViewCount(int id) async {
    await http.post(Uri.parse('$baseUrl/interviews/$id/view'));
  }
}
