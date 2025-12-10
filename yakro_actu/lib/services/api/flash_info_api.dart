import '../../models/flash_info.dart';
import 'api_service.dart';

class FlashInfoApi {
  final ApiService _apiService = ApiService();

  /// Obtenir les flash info actifs
  Future<List<FlashInfo>> getActiveFlashInfo() async {
    try {
      final response = await _apiService.get('/api/flash-info');

      if (response.statusCode == 200 && response.data['success']) {
        return (response.data['data'] as List)
            .map((json) => FlashInfo.fromJson(json))
            .toList();
      }

      return [];
    } catch (e) {
      return [];
    }
  }

  /// Obtenir un flash info par ID
  Future<FlashInfo?> getFlashInfoById(int id) async {
    try {
      final response = await _apiService.get('/api/flash-info/$id');

      if (response.statusCode == 200 && response.data['success']) {
        return FlashInfo.fromJson(response.data['data']);
      }

      return null;
    } catch (e) {
      return null;
    }
  }

  /// Créer un flash info (admin)
  Future<FlashInfo?> createFlashInfo({
    required String title,
    required String content,
    String priority = 'NORMAL',
    DateTime? expiresAt,
  }) async {
    try {
      final response = await _apiService.post('/api/flash-info', data: {
        'title': title,
        'content': content,
        'priority': priority,
        'expiresAt': expiresAt?.toIso8601String(),
      });

      if (response.statusCode == 201 && response.data['success']) {
        return FlashInfo.fromJson(response.data['data']);
      }

      return null;
    } catch (e) {
      return null;
    }
  }

  /// Mettre à jour un flash info (admin)
  Future<FlashInfo?> updateFlashInfo(
    int id, {
    String? title,
    String? content,
    String? priority,
    bool? isActive,
    DateTime? expiresAt,
  }) async {
    try {
      final response = await _apiService.put('/api/flash-info/$id', data: {
        if (title != null) 'title': title,
        if (content != null) 'content': content,
        if (priority != null) 'priority': priority,
        if (isActive != null) 'isActive': isActive,
        if (expiresAt != null) 'expiresAt': expiresAt.toIso8601String(),
      });

      if (response.statusCode == 200 && response.data['success']) {
        return FlashInfo.fromJson(response.data['data']);
      }

      return null;
    } catch (e) {
      return null;
    }
  }

  /// Supprimer un flash info (admin)
  Future<bool> deleteFlashInfo(int id) async {
    try {
      final response = await _apiService.delete('/api/flash-info/$id');
      return response.statusCode == 200 && response.data['success'];
    } catch (e) {
      return false;
    }
  }
}
