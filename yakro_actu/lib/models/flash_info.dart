class FlashInfo {
  final int id;
  final String title;
  final String content;
  final String priority; // LOW, NORMAL, HIGH, URGENT
  final bool isActive;
  final DateTime? expiresAt;
  final DateTime createdAt;

  FlashInfo({
    required this.id,
    required this.title,
    required this.content,
    required this.priority,
    required this.isActive,
    this.expiresAt,
    required this.createdAt,
  });

  factory FlashInfo.fromJson(Map<String, dynamic> json) {
    return FlashInfo(
      id: json['id'],
      title: json['title'],
      content: json['content'],
      priority: json['priority'] ?? 'NORMAL',
      isActive: json['isActive'] ?? true,
      expiresAt: json['expiresAt'] != null ? DateTime.parse(json['expiresAt']) : null,
      createdAt: DateTime.parse(json['createdAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'content': content,
      'priority': priority,
      'isActive': isActive,
      'expiresAt': expiresAt?.toIso8601String(),
      'createdAt': createdAt.toIso8601String(),
    };
  }

  bool get isUrgent => priority == 'URGENT' || priority == 'HIGH';
  bool get isExpired => expiresAt != null && DateTime.now().isAfter(expiresAt!);
}
