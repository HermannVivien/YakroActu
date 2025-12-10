import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'dart:developer' as developer;

class ApiService {
  static const String baseUrl = 'https://api.yakroactu.com'; // À configurer
  
  late final Dio _dio;
  final FlutterSecureStorage _secureStorage = const FlutterSecureStorage();
  
  String? _accessToken;
  String? _refreshToken;
  
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  
  ApiService._internal() {
    _dio = Dio(BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: const Duration(seconds: 30),
      receiveTimeout: const Duration(seconds: 30),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ));
    
    _setupInterceptors();
  }

  /// Configuration des intercepteurs
  void _setupInterceptors() {
    // Intercepteur de requête - Ajouter JWT automatiquement
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        // Charger le token si pas encore chargé
        if (_accessToken == null) {
          _accessToken = await _secureStorage.read(key: 'accessToken');
        }
        
        // Ajouter le token aux headers
        if (_accessToken != null) {
          options.headers['Authorization'] = 'Bearer $_accessToken';
        }
        
        developer.log(
          '🌐 ${options.method} ${options.path}',
          name: 'API Request',
        );
        
        return handler.next(options);
      },
      
      onResponse: (response, handler) {
        developer.log(
          '✅ ${response.statusCode} ${response.requestOptions.path}',
          name: 'API Response',
        );
        return handler.next(response);
      },
      
      onError: (error, handler) async {
        developer.log(
          '❌ ${error.response?.statusCode} ${error.requestOptions.path}',
          name: 'API Error',
          error: error.message,
        );
        
        // Si erreur 401 (Unauthorized), tenter de refresh le token
        if (error.response?.statusCode == 401) {
          final refreshed = await _refreshAccessToken();
          
          if (refreshed) {
            // Retry la requête originale
            final options = error.requestOptions;
            options.headers['Authorization'] = 'Bearer $_accessToken';
            
            try {
              final response = await _dio.fetch(options);
              return handler.resolve(response);
            } catch (e) {
              return handler.next(error);
            }
          }
        }
        
        return handler.next(error);
      },
    ));
  }

  /// Rafraîchir l'access token
  Future<bool> _refreshAccessToken() async {
    try {
      _refreshToken = await _secureStorage.read(key: 'refreshToken');
      
      if (_refreshToken == null) {
        await clearTokens();
        return false;
      }
      
      final response = await _dio.post('/api/auth/refresh', data: {
        'refreshToken': _refreshToken,
      });
      
      if (response.statusCode == 200) {
        _accessToken = response.data['data']['accessToken'];
        _refreshToken = response.data['data']['refreshToken'];
        
        await saveTokens(_accessToken!, _refreshToken!);
        return true;
      }
      
      return false;
    } catch (e) {
      developer.log('Erreur refresh token', name: 'API', error: e);
      await clearTokens();
      return false;
    }
  }

  /// Sauvegarder les tokens de manière sécurisée
  Future<void> saveTokens(String accessToken, String refreshToken) async {
    _accessToken = accessToken;
    _refreshToken = refreshToken;
    
    await _secureStorage.write(key: 'accessToken', value: accessToken);
    await _secureStorage.write(key: 'refreshToken', value: refreshToken);
  }

  /// Récupérer les tokens
  Future<void> loadTokens() async {
    _accessToken = await _secureStorage.read(key: 'accessToken');
    _refreshToken = await _secureStorage.read(key: 'refreshToken');
  }

  /// Supprimer les tokens (déconnexion)
  Future<void> clearTokens() async {
    _accessToken = null;
    _refreshToken = null;
    
    await _secureStorage.delete(key: 'accessToken');
    await _secureStorage.delete(key: 'refreshToken');
  }

  /// Vérifier si l'utilisateur est authentifié
  Future<bool> isAuthenticated() async {
    await loadTokens();
    return _accessToken != null;
  }

  // ==================== MÉTHODES HTTP ====================

  /// GET Request
  Future<Response> get(
    String path, {
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      return await _dio.get(
        path,
        queryParameters: queryParameters,
        options: options,
      );
    } catch (e) {
      rethrow;
    }
  }

  /// POST Request
  Future<Response> post(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      return await _dio.post(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
      );
    } catch (e) {
      rethrow;
    }
  }

  /// PUT Request
  Future<Response> put(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      return await _dio.put(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
      );
    } catch (e) {
      rethrow;
    }
  }

  /// PATCH Request
  Future<Response> patch(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      return await _dio.patch(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
      );
    } catch (e) {
      rethrow;
    }
  }

  /// DELETE Request
  Future<Response> delete(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      return await _dio.delete(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
      );
    } catch (e) {
      rethrow;
    }
  }

  /// Upload File
  Future<Response> uploadFile(
    String path,
    String filePath, {
    String fieldName = 'file',
    Map<String, dynamic>? data,
    ProgressCallback? onSendProgress,
  }) async {
    try {
      final formData = FormData.fromMap({
        fieldName: await MultipartFile.fromFile(filePath),
        ...?data,
      });

      return await _dio.post(
        path,
        data: formData,
        onSendProgress: onSendProgress,
      );
    } catch (e) {
      rethrow;
    }
  }
}
