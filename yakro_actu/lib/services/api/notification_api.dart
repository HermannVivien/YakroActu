import '../../models/notification.dart';
import 'api_service.dart';

class NotificationApi {
  final ApiService _apiService = ApiService();

  /// Obtenir mes notifications
  Future<List<AppNotification>> getMyNotifications() async {
    try {
      final response = await _apiService.get('/api/notifications');

      if (response.statusCode == 200 && response.data['success']) {
        return (response.data['data'] as List)
            .map((json) => AppNotification.fromJson(json))
            .toList();
      }

      return [];
    } catch (e) {
      return [];
    }
  }

  /// Marquer une notification comme lue
  Future<bool> markAsRead(int notificationId) async {
    try {
      final response =
          await _apiService.patch('/api/notifications/$notificationId/read');
      return response.statusCode == 200 && response.data['success'];
    } catch (e) {
      return false;
    }
  }

  /// Marquer toutes les notifications comme lues
  Future<bool> markAllAsRead() async {
    try {
      final response = await _apiService.patch('/api/notifications/read-all');
      return response.statusCode == 200 && response.data['success'];
    } catch (e) {
      return false;
    }
  }

  /// Supprimer une notification
  Future<bool> deleteNotification(int notificationId) async {
    try {
      final response =
          await _apiService.delete('/api/notifications/$notificationId');
      return response.statusCode == 200 && response.data['success'];
    } catch (e) {
      return false;
    }
  }

  /// Enregistrer le token FCM (pour notifications push)
  Future<bool> registerDeviceToken(String token) async {
    try {
      final response = await _apiService.post(
        '/api/notifications/register-device',
        data: {'token': token},
      );
      return response.statusCode == 200 && response.data['success'];
    } catch (e) {
      return false;
    }
  }

  /// Obtenir le nombre de notifications non lues
  Future<int> getUnreadCount() async {
    try {
      final notifications = await getMyNotifications();
      return notifications.where((n) => !n.isRead).length;
    } catch (e) {
      return 0;
    }
  }
}
