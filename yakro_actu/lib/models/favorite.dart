class Favorite {
  final int id;
  final DateTime createdAt;
  final int userId;
  final int articleId;

  Favorite({
    required this.id,
    required this.createdAt,
    required this.userId,
    required this.articleId,
  });

  factory Favorite.fromJson(Map<String, dynamic> json) {
    return Favorite(
      id: json['id'],
      createdAt: DateTime.parse(json['createdAt']),
      userId: json['userId'],
      articleId: json['articleId'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'createdAt': createdAt.toIso8601String(),
      'userId': userId,
      'articleId': articleId,
    };
  }
}
