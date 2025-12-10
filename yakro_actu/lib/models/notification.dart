class AppNotification {
  final int id;
  final String title;
  final String body;
  final String type; // INFO, WARNING, SUCCESS, ERROR, ARTICLE, COMMENT, CHAT
  final bool isRead;
  final Map<String, dynamic>? data;
  final DateTime createdAt;
  final int userId;

  AppNotification({
    required this.id,
    required this.title,
    required this.body,
    required this.type,
    required this.isRead,
    this.data,
    required this.createdAt,
    required this.userId,
  });

  factory AppNotification.fromJson(Map<String, dynamic> json) {
    return AppNotification(
      id: json['id'],
      title: json['title'],
      body: json['body'],
      type: json['type'] ?? 'INFO',
      isRead: json['isRead'] ?? false,
      data: json['data'] as Map<String, dynamic>?,
      createdAt: DateTime.parse(json['createdAt']),
      userId: json['userId'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'body': body,
      'type': type,
      'isRead': isRead,
      'data': data,
      'createdAt': createdAt.toIso8601String(),
      'userId': userId,
    };
  }
}
