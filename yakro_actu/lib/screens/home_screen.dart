import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

import '../widgets/custom_scaffold.dart';
import '../widgets/chat_message.dart';

import '../services/theme_service.dart';
import '../services/notification_service.dart';
import '../services/location_service.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final _scrollController = ScrollController();
  final _searchController = TextEditingController();
  bool _isSearching = false;
  bool _isScrolled = false;

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
    _loadInitialData();
  }

  Future<void> _loadInitialData() async {
    // Charger les données initiales
    final locationService = LocationService();
    final notificationService = NotificationService();

    try {
      // Vérifier et demander la permission de localisation
      final permission = await locationService.checkPermission();
      if (permission == LocationPermission.denied) {
        await locationService.requestPermission();
      }

      // Obtenir la position actuelle
      final position = await locationService.getCurrentPosition();
      
      // Mettre à jour la position dans le state
      setState(() {
        _currentPosition = position;
      });

      // Initialiser les notifications
      await notificationService.init();
      await notificationService.saveToken();
    } catch (e) {
      // Gérer les erreurs
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Erreur lors de l\'initialisation: ${e.toString()}')),
      );
    }
  }

  @override
  void dispose() {
    _scrollController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  void _onScroll() {
    setState(() {
      _isScrolled = _scrollController.offset > 0;
    });
  }

  void _toggleSearch() {
    setState(() {
      _isSearching = !_isSearching;
      if (!_isSearching) {
        _searchController.clear();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Provider.of<ThemeService>(context);
    final notifications = Provider.of<NotificationService>(context);

    return CustomScaffold(
      body: Stack(
        children: [
          // Fond dégradé
          Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  theme.getTheme().primaryColor.withOpacity(0.1),
                  Colors.transparent,
                ],
              ),
            ),
          ),

          // Barre de recherche
          Positioned(
            top: 16,
            left: 16,
            right: 16,
            child: SearchBar(
              controller: _searchController,
              onSubmitted: (value) {
                // Gérer la recherche
              },
              onClear: _toggleSearch,
              suggestions: const ['Articles', 'Pharmacies', 'Flash Info'],
            ),
          ),

          // Contenu principal
          CustomScrollView(
            controller: _scrollController,
            slivers: [
              // Section des notifications
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Notifications',
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                      const SizedBox(height: 8),
                      SizedBox(
                        height: 150,
                        child: ListView.builder(
                          scrollDirection: Axis.horizontal,
                          itemCount: notifications.recentNotifications.length,
                          itemBuilder: (context, index) {
                            final notification = notifications.recentNotifications[index];
                            return Padding(
                              padding: const EdgeInsets.only(right: 8),
                              child: NotificationCard(
                                title: notification.title,
                                message: notification.message,
                                imageUrl: notification.imageUrl,
                                timestamp: notification.timestamp,
                                onTap: () {
                                  // Gérer le clic sur la notification
                                },
                                isRead: notification.isRead,
                              ),
                            );
                          },
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              // Section des articles recommandés
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Articles recommandés',
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                      const SizedBox(height: 8),
                      SizedBox(
                        height: 250,
                        child: ListView.builder(
                          scrollDirection: Axis.horizontal,
                          itemCount: 5,
                          itemBuilder: (context, index) {
                            return ContentCard(
                              title: 'Article ${index + 1}',
                              subtitle: 'Sous-titre de l\'article',
                              imageUrl: 'https://picsum.photos/300/200?random=$index',
                              onTap: () {
                                // Gérer le clic sur l\'article
                              },
                              tags: ['Actualité', 'Local'],
                            );
                          },
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              // Section des pharmacies proches
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Pharmacies proches',
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                      const SizedBox(height: 8),
                      SizedBox(
                        height: 250,
                        child: ListView.builder(
                          scrollDirection: Axis.horizontal,
                          itemCount: 3,
                          itemBuilder: (context, index) {
                            return ContentCard(
                              title: 'Pharmacie ${index + 1}',
                              subtitle: 'Adresse de la pharmacie',
                              imageUrl: 'https://picsum.photos/300/200?random=${index + 5}',
                              onTap: () {
                                // Gérer le clic sur la pharmacie
                              },
                              tags: ['24h', 'Livraison'],
                            );
                          },
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
      appBar: _isSearching
          ? null
          : CustomAppBar(
              title: 'Yakro Actu',
              showBackButton: false,
              actions: [
                IconButton(
                  icon: Icon(
                    Icons.search,
                    color: theme.getTheme().textTheme.bodyLarge?.color,
                  ),
                  onPressed: _toggleSearch,
                ),
                IconButton(
                  icon: Icon(
                    Icons.notifications,
                    color: theme.getTheme().textTheme.bodyLarge?.color,
                  ),
                  onPressed: () {
                    // Ouvrir l\'écran des notifications
                  },
                ),
              ],
            ),
      bottomNavigationBar: const CustomBottomNav(
        currentIndex: 0,
        onTap: (index) {
          // Gérer la navigation
        },
      ),
    );
  }
}
