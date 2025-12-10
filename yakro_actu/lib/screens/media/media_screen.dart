import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:shimmer/shimmer.dart';

import '../../widgets/search/search_bar.dart' as custom_search;

class MediaScreen extends StatefulWidget {
  const MediaScreen({super.key});

  @override
  State<MediaScreen> createState() => _MediaScreenState();
}

class _MediaScreenState extends State<MediaScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Médias',
          style: GoogleFonts.poppins(
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      body: CustomScrollView(
        slivers: [
          // Barre de recherche
          SliverToBoxAdapter(
            child: custom_search.SearchBar(
              onSearch: (query) {
                // TODO: Implémenter la recherche dans les médias
              },
            ),
          ),

          // Catégories de médias
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Catégories',
                    style: GoogleFonts.poppins(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      _buildCategoryChip('Podcasts'),
                      _buildCategoryChip('Vidéos'),
                      _buildCategoryChip('Reportages'),
                      _buildCategoryChip('Interviews'),
                    ],
                  ),
                ],
              ),
            ),
          ),

          // Section Podcasts
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Podcasts',
                    style: GoogleFonts.poppins(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Container(
                    height: 200,
                    child: ListView.builder(
                      scrollDirection: Axis.horizontal,
                      itemCount: 5,
                      itemBuilder: (context, index) {
                        return Container(
                          width: 200,
                          margin: const EdgeInsets.only(right: 16),
                          child: Card(
                            elevation: 1,
                            child: Column(
                              children: [
                                Expanded(
                                  child: CachedNetworkImage(
                                    imageUrl: 'https://via.placeholder.com/200x150',
                                    placeholder: (context, url) => Shimmer.fromColors(
                                      baseColor: Theme.of(context).colorScheme.surface.withOpacity(0.5),
                                      highlightColor: Theme.of(context).colorScheme.surface.withOpacity(0.8),
                                      child: Container(color: Theme.of(context).colorScheme.surface),
                                    ),
                                  ),
                                ),
                                Padding(
                                  padding: const EdgeInsets.all(8),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        'Podcast ${index + 1}',
                                        style: GoogleFonts.poppins(
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                      Text(
                                        'Description du podcast...',
                                        style: GoogleFonts.poppins(),
                                      ),
                                      const SizedBox(height: 8),
                                      Row(
                                        children: [
                                          Icon(
                                            Icons.play_circle,
                                            color: Theme.of(context).colorScheme.primary,
                                          ),
                                          const SizedBox(width: 8),
                                          Text(
                                            '30 min',
                                            style: GoogleFonts.poppins(),
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Section Vidéos
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Vidéos',
                    style: GoogleFonts.poppins(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Container(
                    height: 200,
                    child: ListView.builder(
                      scrollDirection: Axis.horizontal,
                      itemCount: 5,
                      itemBuilder: (context, index) {
                        return Container(
                          width: 200,
                          margin: const EdgeInsets.only(right: 16),
                          child: Card(
                            elevation: 1,
                            child: Column(
                              children: [
                                Expanded(
                                  child: Stack(
                                    children: [
                                      CachedNetworkImage(
                                        imageUrl: 'https://via.placeholder.com/200x150',
                                        placeholder: (context, url) => Shimmer.fromColors(
                                          baseColor: Theme.of(context).colorScheme.surface.withOpacity(0.5),
                                          highlightColor: Theme.of(context).colorScheme.surface.withOpacity(0.8),
                                          child: Container(color: Theme.of(context).colorScheme.surface),
                                        ),
                                      ),
                                      const Positioned(
                                        top: 50,
                                        left: 50,
                                        child: Icon(
                                          Icons.play_circle,
                                          color: Colors.white,
                                          size: 40,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                Padding(
                                  padding: const EdgeInsets.all(8),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        'Vidéo ${index + 1}',
                                        style: GoogleFonts.poppins(
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                      Text(
                                        'Description de la vidéo...',
                                        style: GoogleFonts.poppins(),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
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
    );
  }

  Widget _buildCategoryChip(String label) {
    return Chip(
      label: Text(
        label,
        style: GoogleFonts.poppins(),
      ),
      backgroundColor: Theme.of(context).colorScheme.surface,
      onDeleted: () {
        // TODO: Implémenter la navigation vers la catégorie
      },
    );
  }
}
