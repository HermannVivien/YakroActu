class Pharmacy {
  final int id;
  final String name;
  final String address;
  final String? commune;
  final String phone;
  final double? latitude;
  final double? longitude;
  final String? openingHours;
  final bool isOnDuty;
  final DateTime createdAt;
  final DateTime updatedAt;

  Pharmacy({
    required this.id,
    required this.name,
    required this.address,
    this.commune,
    required this.phone,
    this.latitude,
    this.longitude,
    this.openingHours,
    required this.isOnDuty,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Pharmacy.fromJson(Map<String, dynamic> json) {
    return Pharmacy(
      id: json['id'],
      name: json['name'],
      address: json['address'],
      commune: json['commune'],
      phone: json['phone'],
      latitude: json['latitude']?.toDouble(),
      longitude: json['longitude']?.toDouble(),
      openingHours: json['openingHours'],
      isOnDuty: json['isOnDuty'] ?? false,
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'address': address,
      'commune': commune,
      'phone': phone,
      'latitude': latitude,
      'longitude': longitude,
      'openingHours': openingHours,
      'isOnDuty': isOnDuty,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }
}
