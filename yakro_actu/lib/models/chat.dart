import 'chat_message.dart';

class Chat {
  final int id;
  final List<int> participants;
  final String? lastMessage;
  final DateTime createdAt;
  final DateTime updatedAt;
  final List<ChatMessage>? messages;

  Chat({
    required this.id,
    required this.participants,
    this.lastMessage,
    required this.createdAt,
    required this.updatedAt,
    this.messages,
  });

  factory Chat.fromJson(Map<String, dynamic> json) {
    return Chat(
      id: json['id'],
      participants: List<int>.from(json['participants'] ?? []),
      lastMessage: json['lastMessage'],
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
      messages: json['messages'] != null
          ? (json['messages'] as List).map((m) => ChatMessage.fromJson(m)).toList()
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'participants': participants,
      'lastMessage': lastMessage,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
      'messages': messages?.map((m) => m.toJson()).toList(),
    };
  }
}
