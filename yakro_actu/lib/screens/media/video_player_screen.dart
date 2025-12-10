import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:video_player/video_player.dart';
import 'package:chewie/chewie.dart';

import '../../models/video.dart';
import '../../services/mock/mock_data_service.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_spacing.dart';
import '../../theme/app_text_styles.dart';

class VideoPlayerScreen extends StatefulWidget {
  final Video video;

  const VideoPlayerScreen({
    super.key,
    required this.video,
  });

  @override
  State<VideoPlayerScreen> createState() => _VideoPlayerScreenState();
}

class _VideoPlayerScreenState extends State<VideoPlayerScreen> {
  bool _isLiked = false;
  int _likeCount = 0;
  List<Video> _relatedVideos = [];
  VideoPlayerController? _videoController;
  ChewieController? _chewieController;
  bool _isPlayerReady = false;

  @override
  void initState() {
    super.initState();
    _likeCount = widget.video.likeCount;
    _loadRelatedVideos();
    _initializePlayer();
  }

  Future<void> _initializePlayer() async {
    try {
      _videoController = VideoPlayerController.network(
        widget.video.videoUrl,
      );
      
      await _videoController!.initialize();
      
      _chewieController = ChewieController(
        videoPlayerController: _videoController!,
        autoPlay: false,
        looping: false,
        aspectRatio: _videoController!.value.aspectRatio,
        allowFullScreen: true,
        allowMuting: true,
        showControls: true,
        materialProgressColors: ChewieProgressColors(
          playedColor: AppColors.videoColor,
          handleColor: AppColors.videoColor,
          backgroundColor: Colors.grey,
          bufferedColor: Colors.white70,
        ),
        placeholder: Container(
          color: Colors.black,
          child: CachedNetworkImage(
            imageUrl: widget.video.thumbnailUrl,
            fit: BoxFit.cover,
          ),
        ),
        errorBuilder: (context, errorMessage) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.error, color: Colors.white, size: 48),
                const SizedBox(height: 16),
                const Text(
                  'Erreur de lecture',
                  style: TextStyle(color: Colors.white),
                ),
                Text(
                  errorMessage,
                  style: const TextStyle(color: Colors.white70, fontSize: 12),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          );
        },
      );
      
      if (mounted) {
        setState(() {
          _isPlayerReady = true;
        });
      }
    } catch (e) {
      print('Erreur lors de l\'initialisation du lecteur: $e');
      print('URL de la vidéo: ${widget.video.videoUrl}');
      if (mounted) {
        setState(() {
          _isPlayerReady = false;
        });
      }
    }
  }

  @override
  void dispose() {
    _chewieController?.dispose();
    _videoController?.dispose();
    SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
    super.dispose();
  }

  void _loadRelatedVideos() {
    final allVideos = MockDataService.getMockVideos();
    setState(() {
      _relatedVideos = allVideos
          .where((v) => 
              v.id != widget.video.id && 
              (v.categoryName == widget.video.categoryName || v.type == widget.video.type))
          .take(5)
          .toList();
    });
  }

  void _toggleLike() {
    setState(() {
      if (_isLiked) {
        _isLiked = false;
        _likeCount--;
      } else {
        _isLiked = true;
        _likeCount++;
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: SafeArea(
        child: Column(
          children: [
            // Zone de lecture vidéo avec Chewie
            AspectRatio(
              aspectRatio: 16 / 9,
              child: Container(
                color: Colors.black,
                child: _isPlayerReady && _chewieController != null
                    ? Chewie(controller: _chewieController!)
                    : Stack(
                        children: [
                          CachedNetworkImage(
                            imageUrl: widget.video.thumbnailUrl,
                            width: double.infinity,
                            height: double.infinity,
                            fit: BoxFit.cover,
                            placeholder: (context, url) => Container(
                              color: Colors.grey[900],
                              child: const Center(
                                child: CircularProgressIndicator(
                                  color: AppColors.videoColor,
                                ),
                              ),
                            ),
                            errorWidget: (context, url, error) => Container(
                              color: Colors.grey[900],
                              child: const Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(Icons.error, color: Colors.white, size: 48),
                                  SizedBox(height: 8),
                                  Text(
                                    'Erreur de chargement',
                                    style: TextStyle(color: Colors.white),
                                  ),
                                ],
                              ),
                            ),
                          ),
                          if (_videoController != null && !_isPlayerReady)
                            Container(
                              color: Colors.black.withOpacity(0.5),
                              child: const Center(
                                child: Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    CircularProgressIndicator(
                                      color: AppColors.videoColor,
                                    ),
                                    SizedBox(height: 16),
                                    Text(
                                      'Chargement de la vidéo...',
                                      style: TextStyle(color: Colors.white),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          Positioned(
                            top: 8,
                            left: 8,
                            child: IconButton(
                              icon: const Icon(Icons.arrow_back, color: Colors.white),
                              onPressed: () => Navigator.pop(context),
                            ),
                          ),
                        ],
                      ),
              ),
            ),
            
            // Informations et contenu
            Expanded(
              child: Container(
                color: AppColors.background,
                child: ListView(
                  padding: const EdgeInsets.all(16),
                  children: [
                    // Titre
                    Text(
                      widget.video.title,
                      style: AppTextStyles.h5.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 12),
                    
                    // Stats et actions
                    Row(
                      children: [
                        // Vues
                        Icon(Icons.remove_red_eye, size: 16, color: AppColors.textSecondary),
                        const SizedBox(width: 4),
                        Text(
                          _formatViews(widget.video.viewCount),
                          style: AppTextStyles.bodySmall.copyWith(
                            color: AppColors.textSecondary,
                          ),
                        ),
                        const SizedBox(width: 16),
                        
                        // Date
                        Icon(Icons.access_time, size: 16, color: AppColors.textSecondary),
                        const SizedBox(width: 4),
                        Text(
                          _formatDate(widget.video.publishedAt),
                          style: AppTextStyles.bodySmall.copyWith(
                            color: AppColors.textSecondary,
                          ),
                        ),
                        const Spacer(),
                        
                        // Bouton like
                        IconButton(
                          icon: Icon(
                            _isLiked ? Icons.thumb_up : Icons.thumb_up_outlined,
                            color: _isLiked ? AppColors.primary : AppColors.textSecondary,
                          ),
                          onPressed: _toggleLike,
                        ),
                        Text(
                          _formatViews(_likeCount),
                          style: AppTextStyles.bodySmall,
                        ),
                        
                        // Bouton partage
                        IconButton(
                          icon: Icon(Icons.share, color: AppColors.textSecondary),
                          onPressed: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('Partage à implémenter'),
                                duration: Duration(seconds: 2),
                              ),
                            );
                          },
                        ),
                      ],
                    ),
                    
                    const Divider(height: 24),
                    
                    // Catégorie et type
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: AppColors.getCategoryColor(widget.video.categoryName).withOpacity(0.1),
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Text(
                            widget.video.categoryName,
                            style: AppTextStyles.bodySmall.copyWith(
                              color: AppColors.getCategoryColor(widget.video.categoryName),
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: _getTypeColor(widget.video.type).withOpacity(0.1),
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                _getTypeIcon(widget.video.type),
                                size: 14,
                                color: _getTypeColor(widget.video.type),
                              ),
                              const SizedBox(width: 4),
                              Text(
                                _getTypeLabel(widget.video.type),
                                style: AppTextStyles.bodySmall.copyWith(
                                  color: _getTypeColor(widget.video.type),
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    
                    // Description
                    Text(
                      widget.video.description ?? '',
                      style: AppTextStyles.bodyMedium,
                    ),
                    const SizedBox(height: 16),
                    
                    // Auteur
                    Row(
                      children: [
                        CircleAvatar(
                          backgroundColor: AppColors.getCategoryColor(widget.video.categoryName),
                          child: Text(
                            (widget.video.authorName ?? 'A')[0].toUpperCase(),
                            style: const TextStyle(color: Colors.white),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              widget.video.authorName ?? 'Anonyme',
                              style: AppTextStyles.bodyMedium.copyWith(
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            Text(
                              'Journaliste',
                              style: AppTextStyles.bodySmall.copyWith(
                                color: AppColors.textSecondary,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                    
                    // Vidéos associées
                    if (_relatedVideos.isNotEmpty) ...[
                      const SizedBox(height: 24),
                      const Divider(),
                      const SizedBox(height: 16),
                      Text(
                        'Vidéos associées',
                        style: AppTextStyles.h6.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 16),
                      ..._relatedVideos.map((video) => _buildRelatedVideoCard(video)),
                    ],
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRelatedVideoCard(Video video) {
    return GestureDetector(
      onTap: () {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (context) => VideoPlayerScreen(video: video),
          ),
        );
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Thumbnail
            Stack(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: CachedNetworkImage(
                    imageUrl: video.thumbnailUrl,
                    width: 120,
                    height: 70,
                    fit: BoxFit.cover,
                    placeholder: (context, url) => Container(
                      color: Colors.grey[300],
                      child: const Center(child: CircularProgressIndicator()),
                    ),
                  ),
                ),
                Positioned(
                  bottom: 4,
                  right: 4,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                    decoration: BoxDecoration(
                      color: Colors.black.withOpacity(0.8),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      video.duration,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 10,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(width: 12),
            
            // Infos
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    video.title,
                    style: AppTextStyles.bodyMedium.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    video.authorName ?? 'Anonyme',
                    style: AppTextStyles.bodySmall.copyWith(
                      color: AppColors.textSecondary,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    '${_formatViews(video.viewCount)} • ${_formatDate(video.publishedAt)}',
                    style: AppTextStyles.bodySmall.copyWith(
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _formatViews(int views) {
    if (views >= 1000000) {
      return '${(views / 1000000).toStringAsFixed(1)}M';
    } else if (views >= 1000) {
      return '${(views / 1000).toStringAsFixed(1)}k';
    }
    return views.toString();
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final difference = now.difference(date);

    if (difference.inDays > 0) {
      return 'Il y a ${difference.inDays}j';
    } else if (difference.inHours > 0) {
      return 'Il y a ${difference.inHours}h';
    } else if (difference.inMinutes > 0) {
      return 'Il y a ${difference.inMinutes}min';
    } else {
      return 'À l\'instant';
    }
  }

  Color _getTypeColor(String type) {
    switch (type) {
      case 'article':
        return AppColors.videoColor;
      case 'reportage':
        return Colors.orange;
      case 'interview':
        return Colors.purple;
      default:
        return AppColors.primary;
    }
  }

  IconData _getTypeIcon(String type) {
    switch (type) {
      case 'article':
        return Icons.article;
      case 'reportage':
        return Icons.video_camera_back;
      case 'interview':
        return Icons.mic;
      default:
        return Icons.play_circle;
    }
  }

  String _getTypeLabel(String type) {
    switch (type) {
      case 'article':
        return 'Article';
      case 'reportage':
        return 'Reportage';
      case 'interview':
        return 'Interview';
      default:
        return 'Vidéo';
    }
  }
}
