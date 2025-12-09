import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:provider/provider.dart';
import '../models/article.dart';
import '../services/geolocation_service.dart';

class GeolocatedArticlesMap extends StatefulWidget {
  final List<Article> articles;

  const GeolocatedArticlesMap({super.key, required this.articles});

  @override
  State<GeolocatedArticlesMap> createState() => _GeolocatedArticlesMapState();
}

class _GeolocatedArticlesMapState extends State<GeolocatedArticlesMap> {
  late GoogleMapController mapController;
  final Set<Marker> _markers = {};
  final Set<Polyline> _polylines = {};
  late LatLng _currentLocation;

  @override
  void initState() {
    super.initState();
    _initializeMarkers();
  }

  void _initializeMarkers() {
    _markers.clear();
    _polylines.clear();

    for (var article in widget.articles) {
      if (article.location != null) {
        final marker = Marker(
          markerId: MarkerId(article.id.toString()),
          position: LatLng(
            article.location!.coordinates[1],
            article.location!.coordinates[0],
          ),
          infoWindow: InfoWindow(
            title: article.title,
            snippet: article.excerpt,
          ),
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => ArticleDetailScreen(article: article),
              ),
            );
          },
        );
        _markers.add(marker);
      }
    }
  }

  void _onMapCreated(GoogleMapController controller) {
    mapController = controller;
    final geolocationService = Provider.of<GeolocationService>(context, listen: false);
    geolocationService.getCurrentPosition().then((position) {
      if (position != null) {
        setState(() {
          _currentLocation = LatLng(position.latitude, position.longitude);
          _polylines.add(
            Polyline(
              polylineId: const PolylineId('current_location'),
              points: [LatLng(position.latitude, position.longitude)],
              color: Colors.blue,
              width: 2,
            ),
          );
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Articles à proximité'),
      ),
      body: GoogleMap(
        onMapCreated: _onMapCreated,
        initialCameraPosition: const CameraPosition(
          target: LatLng(0, 0),
          zoom: 12,
        ),
        markers: _markers,
        polylines: _polylines,
        myLocationEnabled: true,
        myLocationButtonEnabled: true,
      ),
    );
  }
}
