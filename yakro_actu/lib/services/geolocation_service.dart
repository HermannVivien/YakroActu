import 'package:geolocator/geolocator.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:provider/provider.dart';

class GeolocationService {
  Position? _currentPosition;
  bool _isServiceEnabled = false;
  LocationPermission? _permission;

  Future<bool> checkPermission() async {
    _permission = await Geolocator.checkPermission();
    if (_permission == LocationPermission.denied) {
      _permission = await Geolocator.requestPermission();
      if (_permission == LocationPermission.denied) {
        return false;
      }
    }
    return true;
  }

  Future<Position?> getCurrentPosition() async {
    if (await checkPermission()) {
      _isServiceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!_isServiceEnabled) {
        return null;
      }
      _currentPosition = await Geolocator.getCurrentPosition();
      return _currentPosition;
    }
    return null;
  }

  Future<List<Placemark>> getPlaceMarkFromCoordinates(
      double latitude, double longitude) async {
    return await Geolocator.placemarkFromCoordinates(latitude, longitude);
  }

  Future<double> calculateDistance(
      double startLatitude, double startLongitude,
      double endLatitude, double endLongitude) async {
    return Geolocator.distanceBetween(
      startLatitude,
      startLongitude,
      endLatitude,
      endLongitude,
    );
  }
}

class GeolocationProvider extends ChangeNotifier {
  final GeolocationService _service = GeolocationService();
  Position? _currentPosition;
  bool _isLoading = false;

  Position? get currentPosition => _currentPosition;
  bool get isLoading => _isLoading;

  Future<void> getCurrentLocation() async {
    _isLoading = true;
    notifyListeners();
    
    try {
      _currentPosition = await _service.getCurrentPosition();
      notifyListeners();
    } catch (e) {
      print('Error getting location: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
