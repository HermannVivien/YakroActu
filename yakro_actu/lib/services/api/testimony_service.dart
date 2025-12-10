import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../models/testimony.dart';

class TestimonyService {
  static const String baseUrl = 'http://localhost:5000/api';

  Future<List<Testimony>> getTestimonies({
    int page = 1,
    int limit = 10,
    bool? isApproved,
  }) async {
    final queryParams = {
      'page': page.toString(),
      'limit': limit.toString(),
      if (isApproved != null) 'isApproved': isApproved.toString(),
    };

    final uri = Uri.parse('$baseUrl/testimonies')
        .replace(queryParameters: queryParams);
    final response = await http.get(uri);

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      return (data['data'] as List)
          .map((json) => Testimony.fromJson(json))
          .toList();
    } else {
      throw Exception('Échec du chargement des témoignages');
    }
  }

  Future<List<Testimony>> getApprovedTestimonies({
    int page = 1,
    int limit = 10,
  }) async {
    return getTestimonies(page: page, limit: limit, isApproved: true);
  }

  Future<Testimony> getTestimonyById(int id) async {
    final response = await http.get(Uri.parse('$baseUrl/testimonies/$id'));

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      return Testimony.fromJson(data['data']);
    } else {
      throw Exception('Échec du chargement du témoignage');
    }
  }

  Future<Testimony> createTestimony({
    required String name,
    String? email,
    String? organization,
    String? position,
    required String content,
    String? photo,
    required int rating,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/testimonies'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({
        'name': name,
        'email': email,
        'organization': organization,
        'position': position,
        'content': content,
        'photo': photo,
        'rating': rating,
      }),
    );

    if (response.statusCode == 201) {
      final data = json.decode(response.body);
      return Testimony.fromJson(data['data']);
    } else {
      throw Exception('Échec de la création du témoignage');
    }
  }
}
