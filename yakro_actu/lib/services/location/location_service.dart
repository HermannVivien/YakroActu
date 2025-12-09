import 'package:geolocator/geolocator.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';

class LocationService {
  static const String _lastLocationKey = 'last_location';
  static const String _permissionStatusKey = 'location_permission';

  bool _initialized = false;
  bool _locationPermissionGranted = false;
  Position? _lastPosition;

  // Initialisation
  Future<void> init() async {
    if (_initialized) return;

    // Vérifier les permissions
    final permissionStatus = await Permission.location.request();
    _locationPermissionGranted = permissionStatus.isGranted;

    // Sauvegarder l'état des permissions
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_permissionStatusKey, _locationPermissionGranted);

    // Charger la dernière position
    final lastLocation = await getLastLocation();
    if (lastLocation != null) {
      _lastPosition = Position(
        latitude: lastLocation.latitude,
        longitude: lastLocation.longitude,
        timestamp: DateTime.now(),
        accuracy: 0,
        altitude: 0,
        heading: 0,
        speed: 0,
        speedAccuracy: 0,
      );
    }

    _initialized = true;
  }

  // Vérifier les permissions
  Future<bool> checkPermission() async {
    final status = await Permission.location.status;
    return status.isGranted;
  }

  // Demander les permissions
  Future<bool> requestPermission() async {
    final status = await Permission.location.request();
    _locationPermissionGranted = status.isGranted;
    return _locationPermissionGranted;
  }

  // Obtenir la position actuelle
  Future<Position> getCurrentPosition() async {
    if (!_locationPermissionGranted) {
      throw Exception('Permission non accordée');
    }

    return await Geolocator.getCurrentPosition(
      desiredAccuracy: LocationAccuracy.high,
    );
  }

  // Obtenir les coordonnées de l'adresse
  Future<List<Placemark>> getPlaceMarkFromCoordinates(
      double latitude, double longitude) async {
    if (!_locationPermissionGranted) {
      throw Exception('Permission non accordée');
    }

    return await placemarkFromCoordinates(latitude, longitude);
  }

  // Obtenir les coordonnées d'une adresse
  Future<List<Location>> getLocationFromAddress(String address) async {
    if (!_locationPermissionGranted) {
      throw Exception('Permission non accordée');
    }

    return await locationFromAddress(address);
  }

  // Sauvegarder la dernière position
  Future<void> saveLastLocation(Position position) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(
      _lastLocationKey,
      '${position.latitude},${position.longitude}',
    );
    _lastPosition = position;
  }

  // Obtenir la dernière position
  Future<LatLng?> getLastLocation() async {
    final prefs = await SharedPreferences.getInstance();
    final locationData = prefs.getString(_lastLocationKey);
    
    if (locationData != null) {
      final parts = locationData.split(',');
      return LatLng(
        double.parse(parts[0]),
        double.parse(parts[1]),
      );
    }
    return null;
  }

  // Obtenir les pharmacies proches
  Future<List<Map<String, dynamic>>> getNearbyPharmacies(
      double latitude, double longitude, double radius) async {
    // TODO: Implémenter l'appel API pour obtenir les pharmacies proches
    return [];
  }

  // Obtenir les flash info proches
  Future<List<Map<String, dynamic>>> getNearbyFlashInfo(
      double latitude, double longitude, double radius) async {
    // TODO: Implémenter l'appel API pour obtenir les flash info proches
    return [];
  }
}
