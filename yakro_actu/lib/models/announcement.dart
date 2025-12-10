class Announcement {
  final int id;
  final String title;
  final String slug;
  final String content;
  final String type;
  final String priority;
  final String? attachmentUrl;
  final String? contactEmail;
  final String? contactPhone;
  final DateTime? expiresAt;
  final bool isActive;
  final int viewCount;
  final int? authorId;
  final String? authorName;
  final DateTime createdAt;
  final DateTime updatedAt;

  Announcement({
    required this.id,
    required this.title,
    required this.slug,
    required this.content,
    required this.type,
    required this.priority,
    this.attachmentUrl,
    this.contactEmail,
    this.contactPhone,
    this.expiresAt,
    this.isActive = true,
    this.viewCount = 0,
    this.authorId,
    this.authorName,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Announcement.fromJson(Map<String, dynamic> json) {
    return Announcement(
      id: json['id'],
      title: json['title'],
      slug: json['slug'],
      content: json['content'],
      type: json['type'],
      priority: json['priority'],
      attachmentUrl: json['attachmentUrl'],
      contactEmail: json['contactEmail'],
      contactPhone: json['contactPhone'],
      expiresAt: json['expiresAt'] != null
          ? DateTime.parse(json['expiresAt'])
          : null,
      isActive: json['isActive'] ?? true,
      viewCount: json['viewCount'] ?? 0,
      authorId: json['authorId'],
      authorName: json['author']?['name'],
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'slug': slug,
      'content': content,
      'type': type,
      'priority': priority,
      'attachmentUrl': attachmentUrl,
      'contactEmail': contactEmail,
      'contactPhone': contactPhone,
      'expiresAt': expiresAt?.toIso8601String(),
      'isActive': isActive,
      'viewCount': viewCount,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  bool get isExpired {
    if (expiresAt == null) return false;
    return DateTime.now().isAfter(expiresAt!);
  }

  bool get isUrgent => priority == 'urgent';
  bool get isHighPriority => priority == 'high' || priority == 'urgent';
}
