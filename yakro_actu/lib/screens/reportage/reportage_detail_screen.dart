import 'package:flutter/material.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_spacing.dart';
import '../../theme/app_text_styles.dart';
import '../../models/reportage.dart';
import '../../services/api/reportage_service.dart';

class ReportageDetailScreen extends StatefulWidget {
  final Reportage reportage;

  const ReportageDetailScreen({
    Key? key,
    required this.reportage,
  }) : super(key: key);

  @override
  State<ReportageDetailScreen> createState() => _ReportageDetailScreenState();
}

class _ReportageDetailScreenState extends State<ReportageDetailScreen> {
  final ReportageService _service = ReportageService();
  final ScrollController _scrollController = ScrollController();
  bool _showTitle = false;

  @override
  void initState() {
    super.initState();
    _service.incrementViewCount(widget.reportage.id);
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.offset > 200 && !_showTitle) {
      setState(() => _showTitle = true);
    } else if (_scrollController.offset <= 200 && _showTitle) {
      setState(() => _showTitle = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: CustomScrollView(
        controller: _scrollController,
        slivers: [
          // App Bar avec image
          SliverAppBar(
            expandedHeight: 300,
            pinned: true,
            title: _showTitle
                ? Text(
                    widget.reportage.title,
                    style: const TextStyle(fontSize: 16),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  )
                : null,
            flexibleSpace: FlexibleSpaceBar(
              background: Stack(
                fit: StackFit.expand,
                children: [
                  if (widget.reportage.coverImage != null)
                    Image.network(
                      widget.reportage.coverImage!,
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) {
                        return Container(
                          color: AppColors.surfaceVariant,
                          child: const Icon(
                            Icons.image_outlined,
                            size: 64,
                            color: AppColors.textTertiary,
                          ),
                        );
                      },
                    )
                  else
                    Container(
                      color: AppColors.surfaceVariant,
                      child: const Icon(
                        Icons.article_outlined,
                        size: 64,
                        color: AppColors.textTertiary,
                      ),
                    ),
                  // Gradient overlay
                  Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          Colors.transparent,
                          Colors.black.withOpacity(0.7),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
            actions: [
              IconButton(
                icon: const Icon(Icons.share),
                onPressed: () {
                  // TODO: Partage
                },
              ),
              IconButton(
                icon: const Icon(Icons.bookmark_border),
                onPressed: () {
                  // TODO: Favoris
                },
              ),
            ],
          ),

          // Contenu
          SliverToBoxAdapter(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // En-tête
                Padding(
                  padding: const EdgeInsets.all(AppSpacing.paddingScreen),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Catégorie et infos
                      Row(
                        children: [
                          if (widget.reportage.categoryName != null) ...[
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: AppSpacing.sm,
                                vertical: 4,
                              ),
                              decoration: BoxDecoration(
                                color: AppColors.primary.withOpacity(0.1),
                                borderRadius: BorderRadius.circular(
                                    AppSpacing.radiusSmall),
                              ),
                              child: Text(
                                widget.reportage.categoryName!.toUpperCase(),
                                style: AppTextStyles.overline.copyWith(
                                  color: AppColors.primary,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                            const SizedBox(width: AppSpacing.sm),
                          ],
                          Text(
                            '${widget.reportage.viewCount} vues',
                            style: AppTextStyles.caption,
                          ),
                          const Text(' • ', style: AppTextStyles.caption),
                          Text(
                            _formatDate(widget.reportage.publishedAt),
                            style: AppTextStyles.caption,
                          ),
                        ],
                      ),
                      const SizedBox(height: AppSpacing.md),

                      // Titre
                      Text(
                        widget.reportage.title,
                        style: AppTextStyles.h2,
                      ),
                      const SizedBox(height: AppSpacing.md),

                      // Résumé
                      Text(
                        widget.reportage.summary,
                        style: AppTextStyles.articleSubtitle,
                      ),
                      const SizedBox(height: AppSpacing.lg),

                      // Auteur
                      if (widget.reportage.authorName != null)
                        Row(
                          children: [
                            CircleAvatar(
                              radius: 20,
                              backgroundImage: widget.reportage.authorAvatar !=
                                      null
                                  ? NetworkImage(widget.reportage.authorAvatar!)
                                  : null,
                              child: widget.reportage.authorAvatar == null
                                  ? const Icon(Icons.person)
                                  : null,
                            ),
                            const SizedBox(width: AppSpacing.sm),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  widget.reportage.authorName!,
                                  style: AppTextStyles.bodyMedium.copyWith(
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                                const Text(
                                  'Journaliste',
                                  style: AppTextStyles.caption,
                                ),
                              ],
                            ),
                          ],
                        ),

                      const SizedBox(height: AppSpacing.lg),
                      const Divider(),
                      const SizedBox(height: AppSpacing.lg),

                      // Contenu principal
                      Text(
                        widget.reportage.content,
                        style: AppTextStyles.bodyLarge.copyWith(height: 1.8),
                      ),

                      // Galerie d'images
                      if (widget.reportage.gallery != null &&
                          widget.reportage.gallery!.isNotEmpty) ...[
                        const SizedBox(height: AppSpacing.xl),
                        const Text(
                          'Galerie',
                          style: AppTextStyles.sectionTitle,
                        ),
                        const SizedBox(height: AppSpacing.md),
                        _buildGallery(),
                      ],

                      // Vidéo
                      if (widget.reportage.videoUrl != null) ...[
                        const SizedBox(height: AppSpacing.xl),
                        _buildVideoPlayer(),
                      ],

                      // Audio
                      if (widget.reportage.audioUrl != null) ...[
                        const SizedBox(height: AppSpacing.xl),
                        _buildAudioPlayer(),
                      ],

                      // Tags
                      if (widget.reportage.tags != null &&
                          widget.reportage.tags!.isNotEmpty) ...[
                        const SizedBox(height: AppSpacing.xl),
                        const Divider(),
                        const SizedBox(height: AppSpacing.md),
                        Wrap(
                          spacing: AppSpacing.sm,
                          runSpacing: AppSpacing.sm,
                          children: widget.reportage.tags!
                              .map((tag) => Chip(
                                    label: Text(tag),
                                    backgroundColor:
                                        AppColors.primary.withOpacity(0.1),
                                    side: BorderSide.none,
                                  ))
                              .toList(),
                        ),
                      ],

                      const SizedBox(height: AppSpacing.xxl),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildGallery() {
    return SizedBox(
      height: 200,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: widget.reportage.gallery!.length,
        itemBuilder: (context, index) {
          final media = widget.reportage.gallery![index];
          return Container(
            width: 300,
            margin: const EdgeInsets.only(right: AppSpacing.md),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(AppSpacing.radiusMedium),
              child: Stack(
                fit: StackFit.expand,
                children: [
                  Image.network(
                    media.url,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) {
                      return Container(
                        color: AppColors.surfaceVariant,
                        child: const Icon(Icons.image_outlined),
                      );
                    },
                  ),
                  if (media.caption != null)
                    Positioned(
                      bottom: 0,
                      left: 0,
                      right: 0,
                      child: Container(
                        padding: const EdgeInsets.all(AppSpacing.sm),
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                            colors: [
                              Colors.transparent,
                              Colors.black.withOpacity(0.7),
                            ],
                          ),
                        ),
                        child: Text(
                          media.caption!,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 12,
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildVideoPlayer() {
    return Container(
      height: 200,
      decoration: BoxDecoration(
        color: Colors.black,
        borderRadius: BorderRadius.circular(AppSpacing.radiusMedium),
      ),
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.play_circle_outline, size: 64, color: Colors.white),
            const SizedBox(height: AppSpacing.sm),
            Text(
              'Vidéo disponible',
              style: AppTextStyles.bodyMedium.copyWith(color: Colors.white),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAudioPlayer() {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.paddingCard),
      decoration: BoxDecoration(
        color: AppColors.surfaceVariant,
        borderRadius: BorderRadius.circular(AppSpacing.radiusMedium),
      ),
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: const BoxDecoration(
              color: AppColors.primary,
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.play_arrow, color: Colors.white),
          ),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Audio disponible',
                  style: AppTextStyles.bodyMedium.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const Text(
                  'Écouter le reportage',
                  style: AppTextStyles.caption,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _formatDate(DateTime? date) {
    if (date == null) return '';
    final months = [
      'jan',
      'fév',
      'mar',
      'avr',
      'mai',
      'juin',
      'juil',
      'août',
      'sep',
      'oct',
      'nov',
      'déc'
    ];
    return '${date.day} ${months[date.month - 1]} ${date.year}';
  }
}
