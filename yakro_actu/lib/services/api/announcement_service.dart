import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../models/announcement.dart';

class AnnouncementService {
  static const String baseUrl = 'http://localhost:5000/api';

  Future<List<Announcement>> getAnnouncements({
    int page = 1,
    int limit = 10,
    String? type,
    String? priority,
    bool? isActive,
  }) async {
    final queryParams = {
      'page': page.toString(),
      'limit': limit.toString(),
      if (type != null) 'type': type,
      if (priority != null) 'priority': priority,
      if (isActive != null) 'isActive': isActive.toString(),
    };

    final uri = Uri.parse('$baseUrl/announcements')
        .replace(queryParameters: queryParams);
    final response = await http.get(uri);

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      return (data['data'] as List)
          .map((json) => Announcement.fromJson(json))
          .toList();
    } else {
      throw Exception('Échec du chargement des annonces');
    }
  }

  Future<Announcement> getAnnouncementById(int id) async {
    final response = await http.get(Uri.parse('$baseUrl/announcements/$id'));

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      return Announcement.fromJson(data['data']);
    } else {
      throw Exception('Échec du chargement de l\'annonce');
    }
  }

  Future<Announcement> getAnnouncementBySlug(String slug) async {
    final response =
        await http.get(Uri.parse('$baseUrl/announcements/slug/$slug'));

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      return Announcement.fromJson(data['data']);
    } else {
      throw Exception('Échec du chargement de l\'annonce');
    }
  }

  Future<List<Announcement>> getActiveAnnouncements() async {
    final response =
        await http.get(Uri.parse('$baseUrl/announcements?isActive=true'));

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      return (data['data'] as List)
          .map((json) => Announcement.fromJson(json))
          .toList();
    } else {
      throw Exception('Échec du chargement des annonces actives');
    }
  }

  Future<void> incrementViewCount(int id) async {
    await http.post(Uri.parse('$baseUrl/announcements/$id/view'));
  }
}
