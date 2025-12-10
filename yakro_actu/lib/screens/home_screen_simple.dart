import 'package:flutter/material.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Yakro Actu'),
        actions: [
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: () {},
          ),
          IconButton(
            icon: const Icon(Icons.notifications),
            onPressed: () {},
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Flash Infos Section
          _buildSection(
            context,
            title: '⚡ Flash Infos',
            child: Card(
              color: Colors.red[50],
              child: const ListTile(
                leading: Icon(Icons.bolt, color: Colors.red),
                title: Text('Dernières actualités importantes'),
                subtitle: Text('Restez informé des dernières nouvelles'),
              ),
            ),
          ),
          const SizedBox(height: 24),
          
          // Catégories
          _buildSection(
            context,
            title: '📰 Catégories',
            child: GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              mainAxisSpacing: 16,
              crossAxisSpacing: 16,
              children: [
                _buildCategoryCard(context, 'Politique', Icons.gavel, Colors.blue),
                _buildCategoryCard(context, 'Économie', Icons.attach_money, Colors.green),
                _buildCategoryCard(context, 'Sport', Icons.sports_soccer, Colors.orange),
                _buildCategoryCard(context, 'Culture', Icons.theater_comedy, Colors.purple),
              ],
            ),
          ),
          const SizedBox(height: 24),
          
          // Articles récents
          _buildSection(
            context,
            title: '📱 Articles récents',
            child: Column(
              children: List.generate(3, (index) {
                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: ListTile(
                    leading: Container(
                      width: 60,
                      height: 60,
                      color: Colors.grey[300],
                      child: const Icon(Icons.article),
                    ),
                    title: Text('Article ${index + 1}'),
                    subtitle: const Text('Description de l\'article...'),
                    trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                    onTap: () {},
                  ),
                );
              }),
            ),
          ),
        ],
      ),
      bottomNavigationBar: BottomNavigationBar(
        type: BottomNavigationBarType.fixed,
        currentIndex: 0,
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.home),
            label: 'Accueil',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.article),
            label: 'Articles',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.place),
            label: 'Lieux',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.settings),
            label: 'Paramètres',
          ),
        ],
        onTap: (index) {
          // Navigation
        },
      ),
    );
  }

  Widget _buildSection(BuildContext context, {required String title, required Widget child}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),
        child,
      ],
    );
  }

  Widget _buildCategoryCard(BuildContext context, String title, IconData icon, Color color) {
    return Card(
      elevation: 2,
      child: InkWell(
        onTap: () {},
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 48, color: color),
            const SizedBox(height: 8),
            Text(
              title,
              style: Theme.of(context).textTheme.titleMedium,
            ),
          ],
        ),
      ),
    );
  }
}
