import '../../models/pharmacy.dart';
import 'api_service.dart';

class PharmacyApi {
  final ApiService _apiService = ApiService();

  /// Obtenir toutes les pharmacies
  Future<List<Pharmacy>> getPharmacies({
    String? commune,
    bool? isOnDuty,
  }) async {
    try {
      final response = await _apiService.get('/api/pharmacies', queryParameters: {
        if (commune != null) 'commune': commune,
        if (isOnDuty != null) 'isOnDuty': isOnDuty,
      });

      if (response.statusCode == 200 && response.data['success']) {
        return (response.data['data'] as List)
            .map((json) => Pharmacy.fromJson(json))
            .toList();
      }

      return [];
    } catch (e) {
      return [];
    }
  }

  /// Obtenir les pharmacies de garde
  Future<List<Pharmacy>> getOnDutyPharmacies() async {
    try {
      final response = await _apiService.get('/api/pharmacies/on-duty');

      if (response.statusCode == 200 && response.data['success']) {
        return (response.data['data'] as List)
            .map((json) => Pharmacy.fromJson(json))
            .toList();
      }

      return [];
    } catch (e) {
      return [];
    }
  }

  /// Obtenir une pharmacie par ID
  Future<Pharmacy?> getPharmacyById(int id) async {
    try {
      final response = await _apiService.get('/api/pharmacies/$id');

      if (response.statusCode == 200 && response.data['success']) {
        return Pharmacy.fromJson(response.data['data']);
      }

      return null;
    } catch (e) {
      return null;
    }
  }

  /// Rechercher des pharmacies
  Future<List<Pharmacy>> searchPharmacies(String query) async {
    try {
      final response = await _apiService.get(
        '/api/pharmacies',
        queryParameters: {'search': query},
      );

      if (response.statusCode == 200 && response.data['success']) {
        return (response.data['data'] as List)
            .map((json) => Pharmacy.fromJson(json))
            .toList();
      }

      return [];
    } catch (e) {
      return [];
    }
  }

  /// Créer une pharmacie (admin)
  Future<Pharmacy?> createPharmacy({
    required String name,
    required String address,
    String? commune,
    required String phone,
    double? latitude,
    double? longitude,
    String? openingHours,
    bool isOnDuty = false,
  }) async {
    try {
      final response = await _apiService.post('/api/pharmacies', data: {
        'name': name,
        'address': address,
        'commune': commune,
        'phone': phone,
        'latitude': latitude,
        'longitude': longitude,
        'openingHours': openingHours,
        'isOnDuty': isOnDuty,
      });

      if (response.statusCode == 201 && response.data['success']) {
        return Pharmacy.fromJson(response.data['data']);
      }

      return null;
    } catch (e) {
      return null;
    }
  }

  /// Mettre à jour une pharmacie (admin)
  Future<Pharmacy?> updatePharmacy(
    int id, {
    String? name,
    String? address,
    String? commune,
    String? phone,
    double? latitude,
    double? longitude,
    String? openingHours,
    bool? isOnDuty,
  }) async {
    try {
      final response = await _apiService.put('/api/pharmacies/$id', data: {
        if (name != null) 'name': name,
        if (address != null) 'address': address,
        if (commune != null) 'commune': commune,
        if (phone != null) 'phone': phone,
        if (latitude != null) 'latitude': latitude,
        if (longitude != null) 'longitude': longitude,
        if (openingHours != null) 'openingHours': openingHours,
        if (isOnDuty != null) 'isOnDuty': isOnDuty,
      });

      if (response.statusCode == 200 && response.data['success']) {
        return Pharmacy.fromJson(response.data['data']);
      }

      return null;
    } catch (e) {
      return null;
    }
  }
}
