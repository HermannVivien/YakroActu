import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../chat/socket_service.dart';

class ChatService {
  static const String _chatsCollection = 'chats';
  static const String _messagesCollection = 'messages';
  static const String _usersCollection = 'users';

  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final ChatSocketService _socketService = ChatSocketService();
  final FirebaseAuth _auth = FirebaseAuth.instance;

  // Stream des messages d'un chat
  Stream<List<Map<String, dynamic>>> getMessages(String chatId) {
    return _firestore
        .collection(_chatsCollection)
        .doc(chatId)
        .collection(_messagesCollection)
        .orderBy('timestamp', descending: true)
        .snapshots()
        .map((snapshot) =>
            snapshot.docs.map((doc) => doc.data() as Map<String, dynamic>).toList());
  }

  // Stream des chats d'un utilisateur
  Stream<List<Map<String, dynamic>>> getUserChats() {
    final userId = _auth.currentUser?.uid;
    if (userId == null) return Stream.value([]);

    return _firestore
        .collection(_chatsCollection)
        .where('participants', arrayContains: userId)
        .orderBy('lastMessage.timestamp', descending: true)
        .snapshots()
        .map((snapshot) =>
            snapshot.docs.map((doc) => doc.data() as Map<String, dynamic>).toList());
  }

  // Créer un nouveau chat
  Future<String> createChat(List<String> participants) async {
    final userId = _auth.currentUser?.uid;
    if (userId == null) throw Exception('User not authenticated');

    final chatData = {
      'participants': participants,
      'createdAt': FieldValue.serverTimestamp(),
      'lastMessage': null,
      'unreadCount': {
        userId: 0,
        for (final participant in participants) if (participant != userId) participant: 0,
      }
    };

    final chatRef = await _firestore.collection(_chatsCollection).add(chatData);
    return chatRef.id;
  }

  // Envoyer un message
  Future<void> sendMessage(String chatId, String message) async {
    final userId = _auth.currentUser?.uid;
    if (userId == null) throw Exception('User not authenticated');

    final messageData = {
      'senderId': userId,
      'content': message,
      'type': 'text',
      'timestamp': FieldValue.serverTimestamp(),
    };

    // Sauvegarder dans Firestore
    await _firestore
        .collection(_chatsCollection)
        .doc(chatId)
        .collection(_messagesCollection)
        .add(messageData);

    // Mettre à jour le chat
    await _firestore.collection(_chatsCollection).doc(chatId).update({
      'lastMessage': messageData,
      'updatedAt': FieldValue.serverTimestamp(),
    });

    // Envoyer via Socket.IO
    _socketService.sendMessage(message, chatId);
  }

  // Marquer les messages comme lus
  Future<void> markMessagesAsRead(String chatId) async {
    final userId = _auth.currentUser?.uid;
    if (userId == null) throw Exception('User not authenticated');

    await _firestore.collection(_chatsCollection).doc(chatId).update({
      'unreadCount.$userId': 0,
    });
  }

  // Obtenir les détails d'un utilisateur
  Future<Map<String, dynamic>?> getUserDetails(String userId) async {
    final snapshot = await _firestore.collection(_usersCollection).doc(userId).get();
    return snapshot.data();
  }

  // Obtenir les détails d'un chat
  Future<Map<String, dynamic>?> getChatDetails(String chatId) async {
    final snapshot = await _firestore.collection(_chatsCollection).doc(chatId).get();
    return snapshot.data();
  }

  // Initialiser le service
  Future<void> init() async {
    final userId = _auth.currentUser?.uid;
    if (userId == null) return;

    await _socketService.init(userId);
  }

  // Nettoyage
  void dispose() {
    _socketService.dispose();
  }
}
