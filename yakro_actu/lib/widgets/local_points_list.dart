import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/local_point.dart';
import '../services/geolocation_service.dart';
import '../services/recommendation_service.dart';

class LocalPointsList extends StatefulWidget {
  const LocalPointsList({super.key});

  @override
  State<LocalPointsList> createState() => _LocalPointsListState();
}

class _LocalPointsListState extends State<LocalPointsList> {
  List<LocalPoint> _localPoints = [];
  String _selectedCategory = 'all';
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchLocalPoints();
  }

  Future<void> _fetchLocalPoints() async {
    final recommendationService = Provider.of<RecommendationService>(context, listen: false);
    final localPoints = await recommendationService.getRecommendedLocalPoints();
    setState(() {
      _localPoints = localPoints;
      _isLoading = false;
    });
  }

  Widget _buildCategoryFilter() {
    final categories = [
      'all',
      'pharmacy',
      'hospital',
      'school',
      'restaurant',
      'hotel'
    ];

    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: categories.map((category) {
          return Padding(
            padding: const EdgeInsets.symmetric(horizontal: 4.0),
            child: FilterChip(
              label: Text(category == 'all' ? 'Tout' : category),
              selected: _selectedCategory == category,
              onSelected: (selected) {
                setState(() {
                  _selectedCategory = selected ? category : 'all';
                });
              },
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildLocalPointsList() {
    final filteredPoints = _selectedCategory == 'all'
        ? _localPoints
        : _localPoints
            .where((point) => point.category == _selectedCategory)
            .toList();

    return ListView.builder(
      itemCount: filteredPoints.length,
      itemBuilder: (context, index) {
        final point = filteredPoints[index];
        return Card(
          margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          child: ListTile(
            leading: CircleAvatar(
              backgroundImage: NetworkImage(point.media.first.url),
            ),
            title: Text(point.name),
            subtitle: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(point.address.street),
                Row(
                  children: [
                    const Icon(Icons.star, size: 16),
                    Text('${point.analytics.averageRating}'),
                  ],
                ),
              ],
            ),
            trailing: IconButton(
              icon: const Icon(Icons.favorite_border),
              onPressed: () {
                // TODO: Implement favorite functionality
              },
            ),
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => LocalPointDetailScreen(localPoint: point),
                ),
              );
            },
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Points d\'intérêt'),
        actions: [
          IconButton(
            icon: const Icon(Icons.map),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => LocalPointsMap(localPoints: _localPoints),
                ),
              );
            },
          ),
        ],
      ),
      body: Column(
        children: [
          _buildCategoryFilter(),
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _buildLocalPointsList(),
          ),
        ],
      ),
    );
  }
}
