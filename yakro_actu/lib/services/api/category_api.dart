import '../../models/category.dart';
import 'api_service.dart';

class CategoryApi {
  final ApiService _apiService = ApiService();

  /// Obtenir toutes les catégories
  Future<List<Category>> getCategories() async {
    try {
      final response = await _apiService.get('/api/categories');

      if (response.statusCode == 200 && response.data['success']) {
        return (response.data['data'] as List)
            .map((json) => Category.fromJson(json))
            .toList();
      }

      return [];
    } catch (e) {
      return [];
    }
  }

  /// Obtenir une catégorie par ID
  Future<Category?> getCategoryById(int id) async {
    try {
      final response = await _apiService.get('/api/categories/$id');

      if (response.statusCode == 200 && response.data['success']) {
        return Category.fromJson(response.data['data']);
      }

      return null;
    } catch (e) {
      return null;
    }
  }

  /// Créer une catégorie (admin)
  Future<Category?> createCategory({
    required String name,
    String? description,
    String? icon,
    String? color,
  }) async {
    try {
      final response = await _apiService.post('/api/categories', data: {
        'name': name,
        'description': description,
        'icon': icon,
        'color': color,
      });

      if (response.statusCode == 201 && response.data['success']) {
        return Category.fromJson(response.data['data']);
      }

      return null;
    } catch (e) {
      return null;
    }
  }

  /// Mettre à jour une catégorie (admin)
  Future<Category?> updateCategory(
    int id, {
    String? name,
    String? description,
    String? icon,
    String? color,
  }) async {
    try {
      final response = await _apiService.put('/api/categories/$id', data: {
        if (name != null) 'name': name,
        if (description != null) 'description': description,
        if (icon != null) 'icon': icon,
        if (color != null) 'color': color,
      });

      if (response.statusCode == 200 && response.data['success']) {
        return Category.fromJson(response.data['data']);
      }

      return null;
    } catch (e) {
      return null;
    }
  }

  /// Supprimer une catégorie (admin)
  Future<bool> deleteCategory(int id) async {
    try {
      final response = await _apiService.delete('/api/categories/$id');
      return response.statusCode == 200 && response.data['success'];
    } catch (e) {
      return false;
    }
  }
}
