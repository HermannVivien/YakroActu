import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:provider/provider.dart';

import '../../services/location/location_service.dart';

class LocationMap extends StatefulWidget {
  final double? latitude;
  final double? longitude;
  final bool showCurrentLocation;
  final Function(LatLng)? onLocationSelected;

  const LocationMap({
    super.key,
    this.latitude,
    this.longitude,
    this.showCurrentLocation = true,
    this.onLocationSelected,
  });

  @override
  State<LocationMap> createState() => _LocationMapState();
}

class _LocationMapState extends State<LocationMap> {
  late GoogleMapController _mapController;
  final Set<Marker> _markers = {};
  final Set<Circle> _circles = {};
  final Set<Polyline> _polylines = {};

  @override
  Widget build(BuildContext context) {
    return GoogleMap(
      initialCameraPosition: CameraPosition(
        target: widget.latitude != null && widget.longitude != null
            ? LatLng(widget.latitude!, widget.longitude!)
            : const LatLng(5.3333, -4.0000), // Coordonnées de Abidjan
        zoom: 15,
      ),
      markers: _markers,
      circles: _circles,
      polylines: _polylines,
      myLocationEnabled: widget.showCurrentLocation,
      myLocationButtonEnabled: widget.showCurrentLocation,
      onMapCreated: (controller) {
        _mapController = controller;
        _updateMarkers();
      },
      onCameraMove: (position) {
        setState(() {
          _markers.clear();
          _markers.add(
            Marker(
              markerId: const MarkerId('current'),
              position: position.target,
              icon: BitmapDescriptor.defaultMarker,
            ),
          );
        });
      },
      onCameraIdle: () {
        if (widget.onLocationSelected != null) {
          widget.onLocationSelected!(
            _mapController.cameraPosition.target,
          );
        }
      },
    );
  }

  void _updateMarkers() {
    setState(() {
      _markers.clear();
      if (widget.latitude != null && widget.longitude != null) {
        _markers.add(
          Marker(
            markerId: const MarkerId('selected'),
            position: LatLng(widget.latitude!, widget.longitude!),
            icon: BitmapDescriptor.defaultMarkerWithHue(
              BitmapDescriptor.hueBlue,
            ),
          ),
        );
      }
    });
  }

  Future<void> _showPharmacies() async {
    final locationService = Provider.of<LocationService>(context, listen: false);
    final position = _mapController.cameraPosition.target;
    
    final pharmacies = await locationService.getNearbyPharmacies(
      position.latitude,
      position.longitude,
      1000, // Rayon de 1km
    );

    setState(() {
      _markers.clear();
      _markers.addAll(
        pharmacies.map(
          (pharmacy) => Marker(
            markerId: MarkerId('pharmacy_${pharmacy['id']}'),
            position: LatLng(
              pharmacy['latitude'],
              pharmacy['longitude'],
            ),
            icon: BitmapDescriptor.defaultMarkerWithHue(
              BitmapDescriptor.hueGreen,
            ),
            infoWindow: InfoWindow(
              title: pharmacy['name'],
              snippet: pharmacy['address'],
            ),
          ),
        ),
      );
    });
  }

  Future<void> _showFlashInfo() async {
    final locationService = Provider.of<LocationService>(context, listen: false);
    final position = _mapController.cameraPosition.target;
    
    final flashInfo = await locationService.getNearbyFlashInfo(
      position.latitude,
      position.longitude,
      1000, // Rayon de 1km
    );

    setState(() {
      _markers.clear();
      _markers.addAll(
        flashInfo.map(
          (info) => Marker(
            markerId: MarkerId('info_${info['id']}'),
            position: LatLng(
              info['latitude'],
              info['longitude'],
            ),
            icon: BitmapDescriptor.defaultMarkerWithHue(
              BitmapDescriptor.hueRed,
            ),
            infoWindow: InfoWindow(
              title: info['title'],
              snippet: info['description'],
            ),
          ),
        ),
      );
    });
  }
}
