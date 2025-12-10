import '../../models/favorite.dart';
import 'api_service.dart';

class FavoriteApi {
  final ApiService _apiService = ApiService();

  /// Obtenir mes favoris
  Future<List<Favorite>> getMyFavorites() async {
    try {
      final response = await _apiService.get('/api/favorites');

      if (response.statusCode == 200 && response.data['success']) {
        return (response.data['data'] as List)
            .map((json) => Favorite.fromJson(json))
            .toList();
      }

      return [];
    } catch (e) {
      return [];
    }
  }

  /// Ajouter un favori
  Future<bool> addFavorite(int articleId) async {
    try {
      final response = await _apiService.post('/api/favorites', data: {
        'articleId': articleId,
      });

      return response.statusCode == 201 && response.data['success'];
    } catch (e) {
      return false;
    }
  }

  /// Retirer un favori
  Future<bool> removeFavorite(int articleId) async {
    try {
      final response = await _apiService.delete('/api/favorites/$articleId');
      return response.statusCode == 200 && response.data['success'];
    } catch (e) {
      return false;
    }
  }

  /// Vérifier si un article est en favori
  Future<bool> isFavorite(int articleId) async {
    try {
      final favorites = await getMyFavorites();
      return favorites.any((fav) => fav.articleId == articleId);
    } catch (e) {
      return false;
    }
  }

  /// Toggle favori (ajouter/retirer)
  Future<bool> toggleFavorite(int articleId) async {
    final isFav = await isFavorite(articleId);
    
    if (isFav) {
      return await removeFavorite(articleId);
    } else {
      return await addFavorite(articleId);
    }
  }
}
