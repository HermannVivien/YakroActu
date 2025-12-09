import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:geolocator/geolocator.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../models/local_point.dart';
import '../../services/geolocation_service.dart';
import '../../widgets/rating_widget.dart';

class LocalPointDetailScreen extends StatefulWidget {
  final LocalPoint localPoint;

  const LocalPointDetailScreen({
    super.key,
    required this.localPoint,
  });

  @override
  State<LocalPointDetailScreen> createState() => _LocalPointDetailScreenState();
}

class _LocalPointDetailScreenState extends State<LocalPointDetailScreen> {
  late GoogleMapController _mapController;
  final Set<Marker> _markers = {};
  bool _isLoading = true;
  double? _distance;

  @override
  void initState() {
    super.initState();
    _initializeMap();
  }

  Future<void> _initializeMap() async {
    final geolocationService = Provider.of<GeolocationService>(context, listen: false);
    final currentPosition = await geolocationService.getCurrentPosition();

    if (currentPosition != null) {
      final distance = await geolocationService.calculateDistance(
        currentPosition.latitude,
        currentPosition.longitude,
        widget.localPoint.location.coordinates[1],
        widget.localPoint.location.coordinates[0],
      );
      setState(() {
        _distance = distance / 1000; // Convert to kilometers
        _isLoading = false;
      });
    }
  }

  void _onMapCreated(GoogleMapController controller) {
    _mapController = controller;
    _markers.add(
      Marker(
        markerId: MarkerId(widget.localPoint.id.toString()),
        position: LatLng(
          widget.localPoint.location.coordinates[1],
          widget.localPoint.location.coordinates[0],
        ),
        infoWindow: InfoWindow(
          title: widget.localPoint.name,
          snippet: widget.localPoint.address.street,
        ),
      ),
    );
  }

  Future<void> _launchUrl(String url) async {
    if (!await launchUrl(Uri.parse(url))) {
      throw Exception('Could not launch $url');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.localPoint.name),
        actions: [
          IconButton(
            icon: const Icon(Icons.favorite_border),
            onPressed: () {
              // TODO: Implement favorite functionality
            },
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Header with image
                  Container(
                    height: 200,
                    decoration: BoxDecoration(
                      image: DecorationImage(
                        image: NetworkImage(widget.localPoint.media.first.url),
                        fit: BoxFit.cover,
                      ),
                    ),
                  ),

                  // Details section
                  Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Rating and distance
                        Row(
                          children: [
                            RatingWidget(rating: widget.localPoint.analytics.averageRating),
                            const SizedBox(width: 8),
                            Text('${widget.localPoint.analytics.averageRating}'),
                            const Spacer(),
                            if (_distance != null)
                              Text('${_distance!.toStringAsFixed(1)} km'),
                          ],
                        ),

                        // Address
                        Card(
                          margin: const EdgeInsets.symmetric(vertical: 8),
                          child: ListTile(
                            leading: const Icon(Icons.location_on),
                            title: Text(widget.localPoint.address.street),
                            subtitle: Text('${widget.localPoint.address.city}, ${widget.localPoint.address.country}'),
                          ),
                        ),

                        // Contact info
                        Card(
                          margin: const EdgeInsets.symmetric(vertical: 8),
                          child: Column(
                            children: [
                              ListTile(
                                leading: const Icon(Icons.phone),
                                title: Text(widget.localPoint.contact.phone),
                                onTap: () => _launchUrl('tel:${widget.localPoint.contact.phone}'),
                              ),
                              ListTile(
                                leading: const Icon(Icons.email),
                                title: Text(widget.localPoint.contact.email),
                                onTap: () => _launchUrl('mailto:${widget.localPoint.contact.email}'),
                              ),
                              if (widget.localPoint.contact.website != null)
                                ListTile(
                                  leading: const Icon(Icons.web),
                                  title: Text(widget.localPoint.contact.website!),
                                  onTap: () => _launchUrl(widget.localPoint.contact.website!),
                                ),
                            ],
                          ),
                        ),

                        // Operating hours
                        Card(
                          margin: const EdgeInsets.symmetric(vertical: 8),
                          child: Column(
                            children: [
                              ListTile(
                                title: const Text('Horaires'),
                                subtitle: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text('Ouvert: ${widget.localPoint.operatingHours.regular.open}'),
                                    Text('Fermé: ${widget.localPoint.operatingHours.regular.close}'),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),

                        // Map
                        Container(
                          height: 300,
                          margin: const EdgeInsets.symmetric(vertical: 8),
                          child: GoogleMap(
                            onMapCreated: _onMapCreated,
                            initialCameraPosition: CameraPosition(
                              target: LatLng(
                                widget.localPoint.location.coordinates[1],
                                widget.localPoint.location.coordinates[0],
                              ),
                              zoom: 15,
                            ),
                            markers: _markers,
                            myLocationEnabled: true,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
    );
  }
}
