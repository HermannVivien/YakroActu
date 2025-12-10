import 'user.dart';

class ChatMessage {
  final int id;
  final String content;
  final String type; // text, image, video, audio
  final DateTime createdAt;
  final int chatId;
  final int senderId;
  final User? sender;

  ChatMessage({
    required this.id,
    required this.content,
    required this.type,
    required this.createdAt,
    required this.chatId,
    required this.senderId,
    this.sender,
  });

  factory ChatMessage.fromJson(Map<String, dynamic> json) {
    return ChatMessage(
      id: json['id'],
      content: json['content'],
      type: json['type'] ?? 'text',
      createdAt: DateTime.parse(json['createdAt']),
      chatId: json['chatId'],
      senderId: json['senderId'],
      sender: json['sender'] != null ? User.fromJson(json['sender']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'content': content,
      'type': type,
      'createdAt': createdAt.toIso8601String(),
      'chatId': chatId,
      'senderId': senderId,
      'sender': sender?.toJson(),
    };
  }

  bool get isText => type == 'text';
  bool get isImage => type == 'image';
  bool get isVideo => type == 'video';
  bool get isAudio => type == 'audio';
}
