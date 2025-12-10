import 'package:dio/dio.dart';
import '../models/user.dart';
import 'api/api_service.dart';

class AuthApi {
  final ApiService _apiService = ApiService();

  /// Connexion utilisateur
  Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      final response = await _apiService.post('/api/auth/login', data: {
        'email': email,
        'password': password,
      });

      if (response.statusCode == 200 && response.data['success']) {
        final data = response.data['data'];
        
        // Sauvegarder les tokens
        await _apiService.saveTokens(
          data['accessToken'],
          data['refreshToken'],
        );

        return {
          'success': true,
          'user': User.fromJson(data['user']),
          'accessToken': data['accessToken'],
          'refreshToken': data['refreshToken'],
        };
      }

      return {
        'success': false,
        'message': response.data['message'] ?? 'Erreur de connexion',
      };
    } on DioException catch (e) {
      return {
        'success': false,
        'message': e.response?.data['message'] ?? 'Erreur de connexion',
      };
    }
  }

  /// Inscription utilisateur
  Future<Map<String, dynamic>> register({
    required String email,
    required String password,
    required String firstName,
    required String lastName,
    String? phone,
  }) async {
    try {
      final response = await _apiService.post('/api/auth/register', data: {
        'email': email,
        'password': password,
        'firstName': firstName,
        'lastName': lastName,
        'phone': phone,
      });

      if (response.statusCode == 201 && response.data['success']) {
        final data = response.data['data'];
        
        // Sauvegarder les tokens
        await _apiService.saveTokens(
          data['accessToken'],
          data['refreshToken'],
        );

        return {
          'success': true,
          'user': User.fromJson(data['user']),
        };
      }

      return {
        'success': false,
        'message': response.data['message'] ?? 'Erreur d\'inscription',
      };
    } on DioException catch (e) {
      return {
        'success': false,
        'message': e.response?.data['message'] ?? 'Erreur d\'inscription',
      };
    }
  }

  /// Déconnexion
  Future<bool> logout() async {
    try {
      await _apiService.post('/api/auth/logout');
      await _apiService.clearTokens();
      return true;
    } catch (e) {
      await _apiService.clearTokens();
      return false;
    }
  }

  /// Obtenir l'utilisateur connecté
  Future<User?> getCurrentUser() async {
    try {
      final response = await _apiService.get('/api/users/me');

      if (response.statusCode == 200 && response.data['success']) {
        return User.fromJson(response.data['data']);
      }

      return null;
    } catch (e) {
      return null;
    }
  }

  /// Mot de passe oublié
  Future<bool> forgotPassword(String email) async {
    try {
      final response = await _apiService.post('/api/auth/forgot-password', data: {
        'email': email,
      });

      return response.statusCode == 200 && response.data['success'];
    } catch (e) {
      return false;
    }
  }

  /// Réinitialiser mot de passe
  Future<bool> resetPassword(String token, String newPassword) async {
    try {
      final response = await _apiService.post('/api/auth/reset-password', data: {
        'token': token,
        'password': newPassword,
      });

      return response.statusCode == 200 && response.data['success'];
    } catch (e) {
      return false;
    }
  }

  /// Changer mot de passe
  Future<bool> changePassword(String oldPassword, String newPassword) async {
    try {
      final response = await _apiService.post('/api/auth/change-password', data: {
        'oldPassword': oldPassword,
        'newPassword': newPassword,
      });

      return response.statusCode == 200 && response.data['success'];
    } catch (e) {
      return false;
    }
  }

  /// Mettre à jour profil
  Future<User?> updateProfile({
    String? firstName,
    String? lastName,
    String? phone,
    String? avatar,
  }) async {
    try {
      final response = await _apiService.put('/api/users/me', data: {
        if (firstName != null) 'firstName': firstName,
        if (lastName != null) 'lastName': lastName,
        if (phone != null) 'phone': phone,
        if (avatar != null) 'avatar': avatar,
      });

      if (response.statusCode == 200 && response.data['success']) {
        return User.fromJson(response.data['data']);
      }

      return null;
    } catch (e) {
      return null;
    }
  }

  /// Vérifier si authentifié
  Future<bool> isAuthenticated() async {
    return await _apiService.isAuthenticated();
  }
}
