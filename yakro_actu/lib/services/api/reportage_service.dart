import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../models/reportage.dart';

class ReportageService {
  static const String baseUrl = 'http://localhost:5000/api';

  Future<List<Reportage>> getReportages({
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
        Uri.parse('$baseUrl/reportages').replace(queryParameters: queryParams);
    final response = await http.get(uri);

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      return (data['data'] as List)
          .map((json) => Reportage.fromJson(json))
          .toList();
    } else {
      throw Exception('Échec du chargement des reportages');
    }
  }

  Future<Reportage> getReportageById(int id) async {
    final response = await http.get(Uri.parse('$baseUrl/reportages/$id'));

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      return Reportage.fromJson(data['data']);
    } else {
      throw Exception('Échec du chargement du reportage');
    }
  }

  Future<Reportage> getReportageBySlug(String slug) async {
    final response =
        await http.get(Uri.parse('$baseUrl/reportages/slug/$slug'));

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      return Reportage.fromJson(data['data']);
    } else {
      throw Exception('Échec du chargement du reportage');
    }
  }

  Future<void> incrementViewCount(int id) async {
    await http.post(Uri.parse('$baseUrl/reportages/$id/view'));
  }
}
