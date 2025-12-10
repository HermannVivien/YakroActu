class LocalPoint {
  final String id;
  final String name;
  final String description;
  final String category;
  final double latitude;
  final double longitude;
  final String? address;
  final String? phone;
  final String? website;
  final String? imageUrl;
  final double? rating;
  final List<String>? openingHours;
  final Map<String, dynamic>? metadata;

  LocalPoint({
    required this.id,
    required this.name,
    required this.description,
    required this.category,
    required this.latitude,
    required this.longitude,
    this.address,
    this.phone,
    this.website,
    this.imageUrl,
    this.rating,
    this.openingHours,
    this.metadata,
  });

  factory LocalPoint.fromJson(Map<String, dynamic> json) {
    return LocalPoint(
      id: json['id']?.toString() ?? '',
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      category: json['category'] ?? '',
      latitude: (json['latitude'] ?? 0.0).toDouble(),
      longitude: (json['longitude'] ?? 0.0).toDouble(),
      address: json['address'],
      phone: json['phone'],
      website: json['website'],
      imageUrl: json['imageUrl'],
      rating: json['rating']?.toDouble(),
      openingHours: json['openingHours'] != null
          ? List<String>.from(json['openingHours'])
          : null,
      metadata: json['metadata'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'category': category,
      'latitude': latitude,
      'longitude': longitude,
      'address': address,
      'phone': phone,
      'website': website,
      'imageUrl': imageUrl,
      'rating': rating,
      'openingHours': openingHours,
      'metadata': metadata,
    };
  }
}
