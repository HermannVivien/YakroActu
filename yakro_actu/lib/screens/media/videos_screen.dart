import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';

import '../../models/video.dart';
import '../../services/mock/mock_data_service.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_spacing.dart';
import '../../theme/app_text_styles.dart';
import 'video_player_screen.dart';

class VideosScreen extends StatefulWidget {
  const VideosScreen({super.key});

  @override
  State<VideosScreen> createState() => _VideosScreenState();
}

class _VideosScreenState extends State<VideosScreen> with SingleTickerProviderStateMixin {
  List<Video> _videos = [];
  List<Video> _filteredVideos = [];
  bool _isLoading = true;
  String _selectedFilter = 'Tous';
  late AnimationController _animationController;

  final List<String> _filters = ['Tous', 'Articles', 'Reportages', 'Interviews'];

  @override
  void initState() {
    super.initState();
    _loadVideos();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );
    _animationController.forward();
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  Future<void> _loadVideos() async {
    setState(() => _isLoading = true);
    
    await Future.delayed(const Duration(milliseconds: 300));
    
    final videos = MockDataService.getMockVideos();
    
    setState(() {
      _videos = videos;
      _filterVideos();
      _isLoading = false;
    });
  }

  void _filterVideos() {
    if (_selectedFilter == 'Tous') {
      _filteredVideos = _videos;
    } else if (_selectedFilter == 'Articles') {
      _filteredVideos = _videos.where((v) => v.type == 'article').toList();
    } else if (_selectedFilter == 'Reportages') {
      _filteredVideos = _videos.where((v) => v.type == 'reportage').toList();
    } else if (_selectedFilter == 'Interviews') {
      _filteredVideos = _videos.where((v) => v.type == 'interview').toList();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.videoColor,
        foregroundColor: Colors.white,
        elevation: 0,
        title: const Text(
          'Vidéos',
          style: TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
            fontSize: 18,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: () {
              // TODO: Implémenter la recherche
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Filtres compacts
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            color: Colors.white,
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: _filters.map((filter) => _buildFilterChip(filter)).toList(),
              ),
            ),
          ),

          // Liste des vidéos
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _filteredVideos.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.videocam_off, size: 64, color: AppColors.textSecondary),
                            const SizedBox(height: 16),
                            Text(
                              'Aucune vidéo disponible',
                              style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary),
                            ),
                          ],
                        ),
                      )
                    : RefreshIndicator(
                        onRefresh: _loadVideos,
                        child: ListView.builder(
                          padding: const EdgeInsets.all(12),
                          itemCount: _filteredVideos.length,
                          itemBuilder: (context, index) {
                            final video = _filteredVideos[index];
                            return _buildCompactVideoCard(video, index);
                          },
                        ),
                      ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String label) {
    final isSelected = _selectedFilter == label;
    
    return Padding(
      padding: const EdgeInsets.only(right: 6),
      child: FilterChip(
        label: Text(
          label,
          style: TextStyle(
            color: isSelected ? Colors.white : AppColors.textPrimary,
            fontSize: 11,
            fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
          ),
        ),
        selected: isSelected,
        onSelected: (selected) {
          setState(() {
            _selectedFilter = label;
            _filterVideos();
          });
        },
        backgroundColor: Colors.grey[100],
        selectedColor: AppColors.videoColor,
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 2),
        labelPadding: EdgeInsets.zero,
        materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
      ),
    );
  }

  Widget _buildCompactVideoCard(Video video, int index) {
    final animation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _animationController,
        curve: Interval(
          (index * 0.05).clamp(0.0, 1.0),
          ((index + 1) * 0.05).clamp(0.0, 1.0),
          curve: Curves.easeOut,
        ),
      ),
    );

    return FadeTransition(
      opacity: animation,
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        child: InkWell(
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => VideoPlayerScreen(video: video),
              ),
            );
          },
          borderRadius: BorderRadius.circular(8),
          child: Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(8),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.04),
                  blurRadius: 3,
                  offset: const Offset(0, 1),
                ),
              ],
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Thumbnail compact
                Stack(
                  children: [
                    ClipRRect(
                      borderRadius: const BorderRadius.horizontal(left: Radius.circular(8)),
                      child: CachedNetworkImage(
                        imageUrl: video.thumbnailUrl,
                        width: 130,
                        height: 90,
                        fit: BoxFit.cover,
                        placeholder: (context, url) => Container(
                          color: Colors.grey[300],
                          child: const Center(
                            child: SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            ),
                          ),
                        ),
                        errorWidget: (context, url, error) => Container(
                          color: Colors.grey[300],
                          child: const Icon(Icons.error, size: 20),
                        ),
                      ),
                    ),
                    
                    // Overlay
                    Positioned.fill(
                      child: Container(
                        decoration: const BoxDecoration(
                          borderRadius: BorderRadius.horizontal(left: Radius.circular(8)),
                          gradient: LinearGradient(
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                            colors: [
                              Colors.transparent,
                              Colors.black26,
                            ],
                          ),
                        ),
                      ),
                    ),
                    
                    // Play button
                    Positioned.fill(
                      child: Center(
                        child: Container(
                          width: 36,
                          height: 36,
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.95),
                            shape: BoxShape.circle,
                          ),
                          child: Icon(
                            Icons.play_arrow,
                            size: 24,
                            color: AppColors.videoColor,
                          ),
                        ),
                      ),
                    ),
                    
                    // Durée
                    Positioned(
                      bottom: 4,
                      right: 4,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                        decoration: BoxDecoration(
                          color: Colors.black.withOpacity(0.8),
                          borderRadius: BorderRadius.circular(3),
                        ),
                        child: Text(
                          video.duration,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 9,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ),
                    
                    // Badge type
                    Positioned(
                      top: 4,
                      left: 4,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                        decoration: BoxDecoration(
                          color: _getTypeColor(video.type),
                          borderRadius: BorderRadius.circular(3),
                        ),
                        child: Text(
                          _getTypeLabel(video.type),
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 8,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
                
                // Informations
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.all(10),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Titre
                        Text(
                          video.title,
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            height: 1.3,
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 6),
                        
                        // Catégorie
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: AppColors.getCategoryColor(video.categoryName).withOpacity(0.1),
                            borderRadius: BorderRadius.circular(3),
                          ),
                          child: Text(
                            video.categoryName,
                            style: TextStyle(
                              color: AppColors.getCategoryColor(video.categoryName),
                              fontSize: 9,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                        const SizedBox(height: 6),
                        
                        // Stats
                        Row(
                          children: [
                            Icon(Icons.remove_red_eye, size: 11, color: AppColors.textSecondary),
                            const SizedBox(width: 3),
                            Text(
                              _formatViews(video.viewCount),
                              style: TextStyle(
                                color: AppColors.textSecondary,
                                fontSize: 10,
                              ),
                            ),
                            const SizedBox(width: 10),
                            Icon(Icons.thumb_up, size: 11, color: AppColors.textSecondary),
                            const SizedBox(width: 3),
                            Text(
                              _formatViews(video.likeCount),
                              style: TextStyle(
                                color: AppColors.textSecondary,
                                fontSize: 10,
                              ),
                            ),
                            const Spacer(),
                            Text(
                              _formatDate(video.publishedAt),
                              style: TextStyle(
                                color: AppColors.textSecondary,
                                fontSize: 9,
                              ),
                            ),
                          ],
                        ),
                        
                        // Auteur
                        if (video.authorName != null) ...[
                          const SizedBox(height: 4),
                          Row(
                            children: [
                              Icon(Icons.person, size: 10, color: AppColors.textSecondary),
                              const SizedBox(width: 3),
                              Expanded(
                                child: Text(
                                  video.authorName!,
                                  style: TextStyle(
                                    color: AppColors.textSecondary,
                                    fontSize: 9,
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Color _getTypeColor(String type) {
    switch (type) {
      case 'article':
        return Colors.blue;
      case 'reportage':
        return Colors.orange;
      case 'interview':
        return Colors.purple;
      default:
        return Colors.grey;
    }
  }

  String _getTypeLabel(String type) {
    switch (type) {
      case 'article':
        return 'ARTICLE';
      case 'reportage':
        return 'REPORTAGE';
      case 'interview':
        return 'INTERVIEW';
      default:
        return type.toUpperCase();
    }
  }

  String _formatViews(int count) {
    if (count >= 1000000) {
      return '${(count / 1000000).toStringAsFixed(1)}M';
    } else if (count >= 1000) {
      return '${(count / 1000).toStringAsFixed(1)}k';
    }
    return count.toString();
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final difference = now.difference(date);

    if (difference.inDays > 7) {
      return 'Il y a ${difference.inDays} j';
    } else if (difference.inDays > 0) {
      return 'Il y a ${difference.inDays}j';
    } else if (difference.inHours > 0) {
      return 'Il y a ${difference.inHours}h';
    } else if (difference.inMinutes > 0) {
      return 'Il y a ${difference.inMinutes}min';
    } else {
      return 'À l\'instant';
    }
  }
}
