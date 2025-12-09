import 'package:geolocator/geolocator.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:shared_preferences/shared_preferences.dart';

class LocationService {
  static const String _lastLocationKey = 'last_location';
  static const String _permissionStatusKey = 'location_permission_status';

  Future<LocationPermission> checkPermission() async {
    return await Geolocator.checkPermission();
  }

  Future<LocationPermission> requestPermission() async {
    return await Geolocator.requestPermission();
  }

  Future<bool> isLocationServiceEnabled() async {
    return await Geolocator.isLocationServiceEnabled();
  }

  Future<Position> getCurrentPosition() async {
    final permission = await checkPermission();
    
    if (permission == LocationPermission.denied) {
      final newPermission = await requestPermission();
      if (newPermission == LocationPermission.denied) {
        throw Exception('Permission denied');
      }
    }

    if (permission == LocationPermission.deniedForever) {
      throw Exception('Permission denied forever');
    }

    if (!await isLocationServiceEnabled()) {
      throw Exception('Location services are disabled');
    }

    return await Geolocator.getCurrentPosition(
      desiredAccuracy: LocationAccuracy.high,
    );
  }

  Future<void> saveLastLocation(Position position) async {
    final prefs = await SharedPreferences.getInstance();
    final locationData = '${position.latitude},${position.longitude}';
    await prefs.setString(_lastLocationKey, locationData);
  }

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

  Future<void> savePermissionStatus(LocationPermission status) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_permissionStatusKey, status.toString());
  }

  Future<LocationPermission?> getLastPermissionStatus() async {
    final prefs = await SharedPreferences.getInstance();
    final statusStr = prefs.getString(_permissionStatusKey);
    
    if (statusStr != null) {
      return LocationPermission.values.firstWhere(
        (status) => status.toString() == statusStr,
        orElse: () => LocationPermission.denied,
      );
    }
    return null;
  }

  Future<List<Placemark>> getPlaceMarkFromCoordinates(
      double latitude, double longitude) async {
    return await placemarkFromCoordinates(latitude, longitude);
  }

  Future<List<Placemark>> getCurrentPlaceMark() async {
    final position = await getCurrentPosition();
    return await getPlaceMarkFromCoordinates(
      position.latitude,
      position.longitude,
    );
  }

  Future<LatLngBounds> getBounds(List<LatLng> points) {
    double? minLat, maxLat, minLng, maxLng;

    for (final point in points) {
      minLat = minLat == null ? point.latitude : min(minLat, point.latitude);
      maxLat = maxLat == null ? point.latitude : max(maxLat, point.latitude);
      minLng = minLng == null ? point.longitude : min(minLng, point.longitude);
      maxLng = maxLng == null ? point.longitude : max(maxLng, point.longitude);
    }

    return Future.value(LatLngBounds(
      southwest: LatLng(minLat!, minLng!),
      northeast: LatLng(maxLat!, maxLng!),
    ));
  }
}
