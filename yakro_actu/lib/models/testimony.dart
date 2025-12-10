class Testimony {
  final int id;
  final String name;
  final String? email;
  final String? organization;
  final String? position;
  final String content;
  final String? photo;
  final int rating;
  final bool isApproved;
  final DateTime? approvedAt;
  final int? approvedById;
  final String? approvedByName;
  final DateTime createdAt;
  final DateTime updatedAt;

  Testimony({
    required this.id,
    required this.name,
    this.email,
    this.organization,
    this.position,
    required this.content,
    this.photo,
    required this.rating,
    this.isApproved = false,
    this.approvedAt,
    this.approvedById,
    this.approvedByName,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Testimony.fromJson(Map<String, dynamic> json) {
    return Testimony(
      id: json['id'],
      name: json['name'],
      email: json['email'],
      organization: json['organization'],
      position: json['position'],
      content: json['content'],
      photo: json['photo'],
      rating: json['rating'],
      isApproved: json['isApproved'] ?? false,
      approvedAt: json['approvedAt'] != null
          ? DateTime.parse(json['approvedAt'])
          : null,
      approvedById: json['approvedById'],
      approvedByName: json['approvedBy']?['name'],
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'organization': organization,
      'position': position,
      'content': content,
      'photo': photo,
      'rating': rating,
      'isApproved': isApproved,
      'approvedAt': approvedAt?.toIso8601String(),
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  String get displayRole {
    if (position != null && organization != null) {
      return '$position chez $organization';
    } else if (position != null) {
      return position!;
    } else if (organization != null) {
      return organization!;
    }
    return '';
  }
}
