import 'user.dart';

class Comment {
  final int id;
  final String content;
  final DateTime createdAt;
  final DateTime updatedAt;
  final int userId;
  final User? user;
  final int articleId;

  Comment({
    required this.id,
    required this.content,
    required this.createdAt,
    required this.updatedAt,
    required this.userId,
    this.user,
    required this.articleId,
  });

  factory Comment.fromJson(Map<String, dynamic> json) {
    return Comment(
      id: json['id'],
      content: json['content'],
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
      userId: json['userId'],
      user: json['user'] != null ? User.fromJson(json['user']) : null,
      articleId: json['articleId'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'content': content,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
      'userId': userId,
      'user': user?.toJson(),
      'articleId': articleId,
    };
  }
}
