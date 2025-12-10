import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../models/sport.dart';

class SportService {
  static const String baseUrl = 'http://localhost:5000/api';

  // ========== Configuration ==========

  Future<SportConfig?> getActiveConfig() async {
    final response = await http.get(Uri.parse('$baseUrl/sport-config/active'));

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      if (data['data'] != null) {
        return SportConfig.fromJson(data['data']);
      }
      return null;
    } else {
      throw Exception('Échec du chargement de la configuration sport');
    }
  }

  // ========== Matches (API externe) ==========

  Future<List<SportMatch>> getLiveMatches() async {
    try {
      final config = await getActiveConfig();
      if (config == null) {
        throw Exception('Aucune configuration sport active');
      }

      // Appel à l'API externe (exemple : API-Football)
      final response = await http.get(
        Uri.parse('${config.apiUrl}/fixtures?live=all'),
        headers: {
          'x-rapidapi-key': config.apiKey,
          'x-rapidapi-host': 'api-football-v1.p.rapidapi.com',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return (data['response'] as List)
            .map((json) => SportMatch.fromJson(json))
            .toList();
      } else {
        throw Exception('Échec du chargement des matchs en direct');
      }
    } catch (e) {
      throw Exception('Erreur lors du chargement des matchs: $e');
    }
  }

  Future<List<SportMatch>> getTodayMatches() async {
    try {
      final config = await getActiveConfig();
      if (config == null) {
        throw Exception('Aucune configuration sport active');
      }

      final today = DateTime.now();
      final dateStr =
          '${today.year}-${today.month.toString().padLeft(2, '0')}-${today.day.toString().padLeft(2, '0')}';

      final response = await http.get(
        Uri.parse('${config.apiUrl}/fixtures?date=$dateStr'),
        headers: {
          'x-rapidapi-key': config.apiKey,
          'x-rapidapi-host': 'api-football-v1.p.rapidapi.com',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return (data['response'] as List)
            .map((json) => SportMatch.fromJson(json))
            .toList();
      } else {
        throw Exception('Échec du chargement des matchs du jour');
      }
    } catch (e) {
      throw Exception('Erreur lors du chargement des matchs: $e');
    }
  }

  Future<List<SportMatch>> getMatchesByLeague(int leagueId,
      {String? season}) async {
    try {
      final config = await getActiveConfig();
      if (config == null) {
        throw Exception('Aucune configuration sport active');
      }

      final queryParams = {
        'league': leagueId.toString(),
        if (season != null) 'season': season,
      };

      final uri = Uri.parse('${config.apiUrl}/fixtures')
          .replace(queryParameters: queryParams);

      final response = await http.get(
        uri,
        headers: {
          'x-rapidapi-key': config.apiKey,
          'x-rapidapi-host': 'api-football-v1.p.rapidapi.com',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return (data['response'] as List)
            .map((json) => SportMatch.fromJson(json))
            .toList();
      } else {
        throw Exception('Échec du chargement des matchs de la ligue');
      }
    } catch (e) {
      throw Exception('Erreur lors du chargement des matchs: $e');
    }
  }
}
