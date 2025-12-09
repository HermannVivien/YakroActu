import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:shared_preferences/shared_preferences.dart';

class NotificationService {
  static const String _notificationsKey = 'notifications';
  static const String _fcmTokenKey = 'fcm_token';
  static const String _notificationPermissionKey = 'notification_permission';

  final FlutterLocalNotificationsPlugin _notifications =
      FlutterLocalNotificationsPlugin();
  final FirebaseMessaging _firebaseMessaging = FirebaseMessaging.instance;

  bool _initialized = false;
  bool _notificationsEnabled = true;

  // Initialisation
  Future<void> init() async {
    if (_initialized) return;

    // Initialiser les notifications locales
    const AndroidInitializationSettings initializationSettingsAndroid =
        AndroidInitializationSettings('@mipmap/ic_launcher');

    const InitializationSettings initializationSettings = InitializationSettings(
      android: initializationSettingsAndroid,
    );

    await _notifications.initialize(
      initializationSettings,
      onDidReceiveNotificationResponse: _onDidReceiveNotificationResponse,
    );

    // Vérifier les permissions
    final permissionStatus = await _firebaseMessaging.requestPermission();
    _notificationsEnabled = permissionStatus.authorizationStatus ==
        AuthorizationStatus.authorized;

    // Sauvegarder l'état des permissions
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_notificationPermissionKey, _notificationsEnabled);

    // Gérer les tokens FCM
    final token = await _firebaseMessaging.getToken();
    if (token != null) {
      await prefs.setString(_fcmTokenKey, token);
    }

    // Écouter les notifications
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      _showNotification(message);
    });

    FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
      // Gérer l'ouverture de l'application via notification
    });

    _initialized = true;
  }

  // Afficher une notification locale
  Future<void> _showNotification(RemoteMessage message) async {
    const AndroidNotificationDetails androidPlatformChannelSpecifics =
        AndroidNotificationDetails(
      'high_importance_channel',
      'High Importance Notifications',
      importance: Importance.max,
      priority: Priority.high,
      showWhen: true,
    );

    const NotificationDetails platformChannelSpecifics =
        NotificationDetails(android: androidPlatformChannelSpecifics);

    await _notifications.show(
      0,
      message.notification?.title ?? 'Nouvelle notification',
      message.notification?.body ?? 'Vous avez reçu une nouvelle notification',
      platformChannelSpecifics,
      payload: message.data.toString(),
    );
  }

  // Gérer la réaction à une notification
  void _onDidReceiveNotificationResponse(NotificationResponse response) {
    // Gérer la réaction de l'utilisateur
  }

  // Gérer les permissions
  Future<bool> requestPermission() async {
    final permissionStatus = await _firebaseMessaging.requestPermission();
    _notificationsEnabled = permissionStatus.authorizationStatus ==
        AuthorizationStatus.authorized;
    return _notificationsEnabled;
  }

  // Gérer les tokens FCM
  Future<String?> getFCMToken() async {
    if (!_notificationsEnabled) return null;
    return await _firebaseMessaging.getToken();
  }

  // Gérer les notifications
  Future<void> showNotification(
      String title, String body, String payload) async {
    if (!_notificationsEnabled) return;

    const AndroidNotificationDetails androidPlatformChannelSpecifics =
        AndroidNotificationDetails(
      'high_importance_channel',
      'High Importance Notifications',
      importance: Importance.max,
      priority: Priority.high,
      showWhen: true,
    );

    const NotificationDetails platformChannelSpecifics =
        NotificationDetails(android: androidPlatformChannelSpecifics);

    await _notifications.show(
      0,
      title,
      body,
      platformChannelSpecifics,
      payload: payload,
    );
  }

  // Gérer l'état des notifications
  Future<bool> areNotificationsEnabled() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool(_notificationPermissionKey) ?? true;
  }

  // Mettre à jour l'état des notifications
  Future<void> updateNotificationStatus(bool enabled) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_notificationPermissionKey, enabled);
    _notificationsEnabled = enabled;
  }
}
