import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../widgets/custom_scaffold.dart';

import '../services/notification_service.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({Key? key}) : super(key: key);

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  final _refreshKey = GlobalKey<RefreshIndicatorState>();
  bool _isLoading = false;
  List<Map<String, dynamic>> _notifications = [];

  @override
  void initState() {
    super.initState();
    _loadNotifications();
  }

  Future<void> _loadNotifications() async {
    setState(() {
      _isLoading = true;
    });

    try {
      // TODO: Implémenter l'appel API pour charger les notifications
      // Pour l'instant, on utilise des données mock
      final mockNotifications = [
        {
          'id': '1',
          'title': 'Nouvel article',
          'message': 'Un nouvel article sur les actualités locales est disponible',
          'imageUrl': 'https://picsum.photos/300/200?random=1',
          'timestamp': DateTime.now().subtract(const Duration(hours: 1)),
          'isRead': false,
          'type': 'article',
        },
        {
          'id': '2',
          'title': 'Pharmacie proche',
          'message': 'Une pharmacie proche de vous a des médicaments disponibles',
          'imageUrl': 'https://picsum.photos/300/200?random=2',
          'timestamp': DateTime.now().subtract(const Duration(hours: 3)),
          'isRead': true,
          'type': 'pharmacy',
        },
        // Ajouter plus de notifications mock
      ];

      setState(() {
        _notifications = mockNotifications;
      });
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Erreur: ${e.toString()}')),
      );
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _markAsRead(String notificationId) async {
    try {
      // TODO: Implémenter l'appel API pour marquer comme lu
      setState(() {
        _notifications = _notifications.map((notification) {
          if (notification['id'] == notificationId) {
            return {...notification, 'isRead': true};
          }
          return notification;
        }).toList();
      });
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Erreur: ${e.toString()}')),
      );
    }
  }

  Future<void> _deleteNotification(String notificationId) async {
    try {
      // TODO: Implémenter l'appel API pour supprimer la notification
      setState(() {
        _notifications = _notifications.where((notification) =>
            notification['id'] != notificationId).toList();
      });
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Erreur: ${e.toString()}')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final notificationService = Provider.of<NotificationService>(context);

    return CustomScaffold(
      appBar: CustomAppBar(
        title: 'Notifications',
        actions: [
          IconButton(
            icon: const Icon(Icons.settings),
            onPressed: () {
              // TODO: Implémenter les paramètres des notifications
            },
          ),
        ],
      ),
      body: RefreshIndicator(
        key: _refreshKey,
        onRefresh: _loadNotifications,
        child: _isLoading
            ? const Center(child: CircularProgressIndicator())
            : ListView.builder(
                padding: const EdgeInsets.all(8),
                itemCount: _notifications.length,
                itemBuilder: (context, index) {
                  final notification = _notifications[index];
                  return Dismissible(
                    key: Key(notification['id']),
                    direction: DismissDirection.endToStart,
                    onDismissed: (direction) {
                      _deleteNotification(notification['id']);
                    },
                    background: Container(
                      color: Colors.red,
                      alignment: Alignment.centerRight,
                      padding: const EdgeInsets.only(right: 20),
                      child: const Icon(Icons.delete, color: Colors.white),
                    ),
                    child: NotificationCard(
                      title: notification['title'],
                      message: notification['message'],
                      imageUrl: notification['imageUrl'],
                      timestamp: notification['timestamp'],
                      isRead: notification['isRead'],
                      onTap: () {
                        _markAsRead(notification['id']);
                        // TODO: Naviguer vers le contenu approprié
                      },
                    ),
                  );
                },
              ),
      ),
    );
  }
}
