import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/user.dart';

class AuthService {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  Stream<User?> get authStateChanges => _auth.authStateChanges();

  Future<User?> getCurrentUser() async {
    final user = _auth.currentUser;
    if (user == null) return null;

    final doc = await _firestore.collection('users').doc(user.uid).get();
    if (!doc.exists) return null;

    return User.fromJson(doc.data()!);
  }

  Future<User?> signInWithEmailAndPassword(String email, String password) async {
    try {
      final userCredential = await _auth.signInWithEmailAndPassword(
        email: email,
        password: password,
      );

      final doc = await _firestore
          .collection('users')
          .doc(userCredential.user!.uid)
          .get();

      if (!doc.exists) return null;
      return User.fromJson(doc.data()!);
    } catch (e) {
      print('Erreur de connexion: $e');
      return null;
    }
  }

  Future<User?> signUpWithEmailAndPassword(
    String email,
    String password,
    String name,
    UserRole role,
    String? bio,
    List<String> categories,
  ) async {
    try {
      final userCredential = await _auth.createUserWithEmailAndPassword(
        email: email,
        password: password,
      );

      final user = User(
        id: userCredential.user!.uid,
        email: email,
        name: name,
        avatar: '',
        role: role,
        bio: bio,
        categories: categories,
        articlesCount: 0,
        createdAt: DateTime.now(),
        isVerified: false,
      );

      await _firestore.collection('users').doc(user.id).set(user.toJson());

      return user;
    } catch (e) {
      print('Erreur d\'inscription: $e');
      return null;
    }
  }

  Future<void> signOut() async {
    await _auth.signOut();
  }

  Future<bool> verifyEmail() async {
    try {
      final user = _auth.currentUser;
      if (user != null) {
        await user.sendEmailVerification();
        return true;
      }
      return false;
    } catch (e) {
      print('Erreur de vérification: $e');
      return false;
    }
  }

  Future<bool> resetPassword(String email) async {
    try {
      await _auth.sendPasswordResetEmail(email: email);
      return true;
    } catch (e) {
      print('Erreur de réinitialisation: $e');
      return false;
    }
  }

  Future<bool> updateProfile({
    String? name,
    String? avatar,
    String? bio,
    List<String>? categories,
  }) async {
    try {
      final user = _auth.currentUser;
      if (user == null) return false;

      final userData = await _firestore.collection('users').doc(user.uid).get();
      if (!userData.exists) return false;

      final updatedData = <String, dynamic>{};
      if (name != null) updatedData['name'] = name;
      if (avatar != null) updatedData['avatar'] = avatar;
      if (bio != null) updatedData['bio'] = bio;
      if (categories != null) updatedData['categories'] = categories;

      await _firestore.collection('users').doc(user.uid).update(updatedData);
      return true;
    } catch (e) {
      print('Erreur de mise à jour: $e');
      return false;
    }
  }
}
