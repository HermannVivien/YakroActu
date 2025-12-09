import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'package:shared_preferences/shared_preferences.dart';

class ChatSocketService {
  static const String _baseUrl = 'http://your-backend-url';
  static const String _chatNamespace = '/chat';
  
  IO.Socket? _socket;
  String? _userId;
  String? _chatId;
  bool _isConnected = false;

  // États de connexion
  bool get isConnected => _isConnected;
  bool get isConnecting => _socket?.connected ?? false;

  // Événements
  final StreamController<Map<String, dynamic>> _messageController =
      StreamController<Map<String, dynamic>>.broadcast();
  final StreamController<Map<String, dynamic>> _statusController =
      StreamController<Map<String, dynamic>>.broadcast();

  Stream<Map<String, dynamic>> get onMessage => _messageController.stream;
  Stream<Map<String, dynamic>> get onStatus => _statusController.stream;

  // Initialisation
  Future<void> init(String userId) async {
    _userId = userId;
    _connect();
  }

  void _connect() {
    if (_socket != null) {
      _socket!.disconnect();
    }

    _socket = IO.io('$_baseUrl$_chatNamespace', {
      'transports': ['websocket'],
      'autoConnect': false,
      'query': {
        'userId': _userId,
      }
    });

    _socket!.connect();

    _socket!.on('connect', (_) {
      _isConnected = true;
      _statusController.add({'type': 'connected'});
    });

    _socket!.on('disconnect', (_) {
      _isConnected = false;
      _statusController.add({'type': 'disconnected'});
    });

    _socket!.on('message', (data) {
      _messageController.add(data);
    });

    _socket!.on('typing', (data) {
      _statusController.add({'type': 'typing', 'data': data});
    });

    _socket!.on('user_status', (data) {
      _statusController.add({'type': 'user_status', 'data': data});
    });

    _socket!.on('error', (error) {
      _statusController.add({'type': 'error', 'data': error});
    });
  }

  // Gestion des messages
  void sendMessage(String message, String chatId) {
    if (_socket == null || !_socket!.connected) return;
    
    _socket!.emit('message', {
      'chatId': chatId,
      'message': message,
      'senderId': _userId,
      'timestamp': DateTime.now().toIso8601String(),
    });
  }

  void startTyping(String chatId) {
    if (_socket == null || !_socket!.connected) return;
    
    _socket!.emit('typing', {
      'chatId': chatId,
      'userId': _userId,
      'isTyping': true,
    });
  }

  void stopTyping(String chatId) {
    if (_socket == null || !_socket!.connected) return;
    
    _socket!.emit('typing', {
      'chatId': chatId,
      'userId': _userId,
      'isTyping': false,
    });
  }

  // Gestion des appels
  void startCall(String chatId, String callType) {
    if (_socket == null || !_socket!.connected) return;
    
    _socket!.emit('call', {
      'chatId': chatId,
      'callerId': _userId,
      'type': callType,
      'timestamp': DateTime.now().toIso8601String(),
    });
  }

  void acceptCall(String callId) {
    if (_socket == null || !_socket!.connected) return;
    
    _socket!.emit('accept_call', {
      'callId': callId,
      'userId': _userId,
    });
  }

  void rejectCall(String callId) {
    if (_socket == null || !_socket!.connected) return;
    
    _socket!.emit('reject_call', {
      'callId': callId,
      'userId': _userId,
    });
  }

  // Gestion des fichiers
  void sendFile(String chatId, Map<String, dynamic> fileData) {
    if (_socket == null || !_socket!.connected) return;
    
    _socket!.emit('file', {
      'chatId': chatId,
      'file': fileData,
      'senderId': _userId,
      'timestamp': DateTime.now().toIso8601String(),
    });
  }

  // Déconnexion
  void disconnect() {
    _socket?.disconnect();
    _isConnected = false;
    _statusController.add({'type': 'disconnected'});
  }

  // Nettoyage
  void dispose() {
    _messageController.close();
    _statusController.close();
    disconnect();
  }
}
