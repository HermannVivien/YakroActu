import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../models/chat_message.dart';

class SocketService {
  static final SocketService _instance = SocketService._internal();
  factory SocketService() => _instance;
  SocketService._internal();

  IO.Socket? _socket;
  final _storage = const FlutterSecureStorage();
  
  // Callbacks
  Function(ChatMessage)? onMessageReceived;
  Function(int chatId, Map<String, dynamic> user)? onUserTyping;
  Function(int chatId, int userId)? onUserStopTyping;
  Function(int chatId, int userId)? onMessagesRead;
  Function(Map<String, dynamic>)? onNotification;
  Function(String)? onError;

  bool get isConnected => _socket?.connected ?? false;

  /// Connexion au serveur WebSocket
  Future<void> connect(String serverUrl) async {
    if (_socket != null && _socket!.connected) {
      print('Socket already connected');
      return;
    }

    try {
      // Récupérer le token
      final token = await _storage.read(key: 'access_token');
      if (token == null) {
        throw Exception('No authentication token found');
      }

      // Configuration Socket.IO
      _socket = IO.io(
        serverUrl,
        IO.OptionBuilder()
            .setTransports(['websocket'])
            .enableAutoConnect()
            .enableReconnection()
            .setAuth({'token': token})
            .build(),
      );

      // Événements de connexion
      _socket!.onConnect((_) {
        print('Socket connected');
        _joinUserChats();
      });

      _socket!.onDisconnect((_) {
        print('Socket disconnected');
      });

      _socket!.onConnectError((error) {
        print('Socket connection error: $error');
        onError?.call('Connection error: $error');
      });

      _socket!.on('error', (data) {
        print('Socket error: $data');
        onError?.call(data['message'] ?? 'Unknown error');
      });

      // Événements du chat
      _socket!.on('new_message', (data) {
        final message = ChatMessage.fromJson(data);
        onMessageReceived?.call(message);
      });

      _socket!.on('user_typing', (data) {
        onUserTyping?.call(data['chatId'], data['user']);
      });

      _socket!.on('user_stop_typing', (data) {
        onUserStopTyping?.call(data['chatId'], data['userId']);
      });

      _socket!.on('messages_read', (data) {
        onMessagesRead?.call(data['chatId'], data['userId']);
      });

      _socket!.on('notification', (data) {
        onNotification?.call(data);
      });

      // Connexion automatique
      _socket!.connect();
    } catch (e) {
      print('Error connecting socket: $e');
      rethrow;
    }
  }

  /// Rejoindre toutes les conversations de l'utilisateur
  void _joinUserChats() {
    _socket?.emit('join_chats');
  }

  /// Rejoindre une conversation spécifique
  void joinChat(int chatId) {
    if (_socket == null || !_socket!.connected) {
      print('Socket not connected');
      return;
    }
    _socket!.emit('join_chat', chatId);
  }

  /// Envoyer un message
  void sendMessage({
    required int chatId,
    required String content,
    String type = 'text',
  }) {
    if (_socket == null || !_socket!.connected) {
      print('Socket not connected');
      onError?.call('Not connected to chat server');
      return;
    }

    _socket!.emit('send_message', {
      'chatId': chatId,
      'content': content,
      'type': type,
    });
  }

  /// Notifier que l'utilisateur est en train d'écrire
  void startTyping(int chatId) {
    if (_socket == null || !_socket!.connected) return;
    _socket!.emit('typing', chatId);
  }

  /// Notifier que l'utilisateur a arrêté d'écrire
  void stopTyping(int chatId) {
    if (_socket == null || !_socket!.connected) return;
    _socket!.emit('stop_typing', chatId);
  }

  /// Marquer les messages comme lus
  void markMessagesAsRead(int chatId) {
    if (_socket == null || !_socket!.connected) return;
    _socket!.emit('mark_read', chatId);
  }

  /// Déconnexion
  void disconnect() {
    if (_socket != null) {
      _socket!.disconnect();
      _socket!.dispose();
      _socket = null;
      print('Socket disconnected and disposed');
    }
  }

  /// Reconnecter avec un nouveau token
  Future<void> reconnect(String serverUrl) async {
    disconnect();
    await connect(serverUrl);
  }
}
