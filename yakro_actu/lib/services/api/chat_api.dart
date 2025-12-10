import '../../models/chat.dart';
import '../../models/chat_message.dart';
import 'api_service.dart';

class ChatApi {
  final ApiService _apiService = ApiService();

  /// Obtenir mes conversations
  Future<List<Chat>> getMyChats() async {
    try {
      final response = await _apiService.get('/api/chats');

      if (response.statusCode == 200 && response.data['success']) {
        return (response.data['data'] as List)
            .map((json) => Chat.fromJson(json))
            .toList();
      }

      return [];
    } catch (e) {
      return [];
    }
  }

  /// Obtenir une conversation par ID
  Future<Chat?> getChatById(int chatId) async {
    try {
      final response = await _apiService.get('/api/chats/$chatId');

      if (response.statusCode == 200 && response.data['success']) {
        return Chat.fromJson(response.data['data']);
      }

      return null;
    } catch (e) {
      return null;
    }
  }

  /// Créer une conversation
  Future<Chat?> createChat(List<int> participants) async {
    try {
      final response = await _apiService.post('/api/chats', data: {
        'participants': participants,
      });

      if (response.statusCode == 201 && response.data['success']) {
        return Chat.fromJson(response.data['data']);
      }

      return null;
    } catch (e) {
      return null;
    }
  }

  /// Obtenir les messages d'une conversation
  Future<List<ChatMessage>> getChatMessages(int chatId, {int page = 1, int limit = 50}) async {
    try {
      final response = await _apiService.get(
        '/api/chats/$chatId/messages',
        queryParameters: {
          'page': page,
          'limit': limit,
        },
      );

      if (response.statusCode == 200 && response.data['success']) {
        final data = response.data['data'];
        return (data['messages'] as List)
            .map((json) => ChatMessage.fromJson(json))
            .toList();
      }

      return [];
    } catch (e) {
      return [];
    }
  }

  /// Envoyer un message
  Future<ChatMessage?> sendMessage(int chatId, String content, {String type = 'text'}) async {
    try {
      final response = await _apiService.post(
        '/api/chats/$chatId/messages',
        data: {
          'content': content,
          'type': type,
        },
      );

      if (response.statusCode == 201 && response.data['success']) {
        return ChatMessage.fromJson(response.data['data']);
      }

      return null;
    } catch (e) {
      return null;
    }
  }

  /// Marquer les messages comme lus
  Future<bool> markMessagesAsRead(int chatId) async {
    try {
      final response = await _apiService.patch('/api/chats/$chatId/read');
      return response.statusCode == 200 && response.data['success'];
    } catch (e) {
      return false;
    }
  }
}
