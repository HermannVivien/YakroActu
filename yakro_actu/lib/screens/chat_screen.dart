import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;

import '../widgets/custom_scaffold.dart';
import '../widgets/custom_app_bar.dart';
import '../widgets/chat_message.dart';

import '../services/theme_service.dart';

class ChatScreen extends StatefulWidget {
  final String chatId;
  final String otherUserId;
  final String otherUserName;
  final String? otherUserImage;

  const ChatScreen({
    Key? key,
    required this.chatId,
    required this.otherUserId,
    required this.otherUserName,
    this.otherUserImage,
  }) : super(key: key);

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final _messageController = TextEditingController();
  final _scrollController = ScrollController();
  IO.Socket? _socket;
  List<Map<String, dynamic>> _messages = [];
  bool _isTyping = false;
  bool _isSending = false;

  @override
  void initState() {
    super.initState();
    _connectToSocket();
    _loadMessages();
  }

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    _disconnectSocket();
    super.dispose();
  }

  Future<void> _connectToSocket() async {
    try {
      _socket = IO.io('http://your-server-url', {
        'transports': ['websocket'],
        'autoConnect': false,
      });

      _socket!.connect();
      
      _socket!.on('connect', (_) {
        print('Connected to chat server');
        _socket!.emit('join_chat', {
          'chatId': widget.chatId,
          'userId': 'current_user_id',
        });
      });

      _socket!.on('message', (data) {
        setState(() {
          _messages.add(data);
        });
        _scrollToBottom();
      });

      _socket!.on('typing', (data) {
        setState(() {
          _isTyping = data['isTyping'];
        });
      });
    } catch (e) {
      print('Socket connection error: $e');
    }
  }

  Future<void> _disconnectSocket() async {
    if (_socket != null) {
      _socket!.disconnect();
      _socket!.dispose();
    }
  }

  Future<void> _loadMessages() async {
    // Charger les messages depuis le backend
    // TODO: Implémenter l'appel API
  }

  void _sendMessage() async {
    if (_messageController.text.trim().isEmpty) return;

    setState(() {
      _isSending = true;
    });

    try {
      // Envoyer le message au backend
      // TODO: Implémenter l'appel API

      // Émettre l'événement au socket
      if (_socket != null && _socket!.connected) {
        _socket!.emit('send_message', {
          'chatId': widget.chatId,
          'message': _messageController.text,
          'senderId': 'current_user_id',
          'timestamp': DateTime.now().toIso8601String(),
        });
      }

      // Ajouter le message à la liste locale
      setState(() {
        _messages.add({
          'message': _messageController.text,
          'isMe': true,
          'timestamp': DateTime.now(),
        });
        _messageController.clear();
      });

      _scrollToBottom();
    } catch (e) {
      print('Error sending message: $e');
    } finally {
      setState(() {
        _isSending = false;
      });
    }
  }

  void _scrollToBottom() {
    if (_scrollController.hasClients) {
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Provider.of<ThemeService>(context);

    return CustomScaffold(
      appBar: CustomAppBar(
        title: widget.otherUserName,
        actions: [
          IconButton(
            icon: const Icon(Icons.video_call),
            onPressed: () {
              // TODO: Implémenter l'appel vidéo
            },
          ),
          IconButton(
            icon: const Icon(Icons.call),
            onPressed: () {
              // TODO: Implémenter l'appel audio
            },
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.all(8),
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final message = _messages[index];
                return ChatMessage(
                  message: message['message'],
                  isMe: message['isMe'] ?? false,
                  imageUrl: message['imageUrl'],
                  timestamp: DateTime.parse(message['timestamp']),
                );
              },
            ),
          ),
          if (_isTyping)
            Padding(
              padding: const EdgeInsets.all(8),
              child: Row(
                children: const [
                  Expanded(
                    child: Text(
                      'En train de taper...',
                      style: TextStyle(color: Colors.grey),
                    ),
                  ),
                ],
              ),
            ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: theme.getTheme().cardColor,
              border: Border(
                top: BorderSide(
                  color: theme.getTheme().dividerColor,
                  width: 0.5,
                ),
              ),
            ),
            child: Row(
              children: [
                IconButton(
                  icon: const Icon(Icons.emoji_emotions_outlined),
                  onPressed: () {
                    // TODO: Implémenter les émojis
                  },
                ),
                IconButton(
                  icon: const Icon(Icons.attach_file),
                  onPressed: () {
                    // TODO: Implémenter l'envoi de fichiers
                  },
                ),
                Expanded(
                  child: TextField(
                    controller: _messageController,
                    decoration: InputDecoration(
                      hintText: 'Message',
                      border: InputBorder.none,
                      suffixIcon: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          IconButton(
                            icon: const Icon(Icons.camera_alt),
                            onPressed: () {
                              // TODO: Implémenter la prise de photo
                            },
                          ),
                          IconButton(
                            icon: const Icon(Icons.mic),
                            onPressed: () {
                              // TODO: Implémenter l'enregistrement vocal
                            },
                          ),
                        ],
                      ),
                    ),
                    onSubmitted: (value) => _sendMessage(),
                    onChanged: (value) {
                      if (_socket != null && _socket!.connected) {
                        _socket!.emit('typing', {
                          'chatId': widget.chatId,
                          'userId': 'current_user_id',
                          'isTyping': value.isNotEmpty,
                        });
                      }
                    },
                  ),
                ),
                IconButton(
                  icon: _isSending
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                          ),
                        )
                      : const Icon(Icons.send),
                  onPressed: _sendMessage,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
