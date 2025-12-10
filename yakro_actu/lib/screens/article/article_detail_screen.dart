import 'package:flutter/material.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_spacing.dart';
import '../../theme/app_text_styles.dart';
import '../../models/article.dart';
import '../../services/api/article_service.dart';
import '../../services/mock/mock_data_service.dart';

class ArticleDetailScreen extends StatefulWidget {
  final Article article;

  const ArticleDetailScreen({
    Key? key,
    required this.article,
  }) : super(key: key);

  @override
  State<ArticleDetailScreen> createState() => _ArticleDetailScreenState();
}

class _ArticleDetailScreenState extends State<ArticleDetailScreen> with SingleTickerProviderStateMixin {
  final ArticleService _service = ArticleService();
  final ScrollController _scrollController = ScrollController();
  bool _showAppBarTitle = false;
  bool _isFavorite = false;
  bool _isLiked = false;
  List<Article> _relatedArticles = [];
  List<String> _tags = [];
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    _incrementViewCount();
    _loadRelatedContent();
    _scrollController.addListener(_onScroll);
    
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );
    _fadeAnimation = CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    );
    _animationController.forward();
  }

  void _onScroll() {
    if (_scrollController.offset > 200 && !_showAppBarTitle) {
      setState(() => _showAppBarTitle = true);
    } else if (_scrollController.offset <= 200 && _showAppBarTitle) {
      setState(() => _showAppBarTitle = false);
    }
  }

  Future<void> _loadRelatedContent() async {
    await Future.delayed(const Duration(milliseconds: 500));
    final allArticles = MockDataService.getMockArticles();
    
    setState(() {
      // Articles connexes de la même catégorie
      _relatedArticles = allArticles
          .where((a) => 
              a.id != widget.article.id && 
              a.categoryName == widget.article.categoryName)
          .take(4)
          .toList();
      
      // Mots-clés générés basés sur la catégorie et le titre
      _tags = _generateTags();
    });
  }

  List<String> _generateTags() {
    final tags = <String>[
      widget.article.categoryName ?? 'Actualité',
      'Côte d\'Ivoire',
    ];
    
    // Ajouter des tags basés sur le titre
    if (widget.article.title.toLowerCase().contains('président')) tags.add('Politique');
    if (widget.article.title.toLowerCase().contains('économie')) tags.add('Économie');
    if (widget.article.title.toLowerCase().contains('sport')) tags.add('Sport');
    if (widget.article.title.toLowerCase().contains('abidjan')) tags.add('Abidjan');
    if (widget.article.title.toLowerCase().contains('yamoussoukro')) tags.add('Yamoussoukro');
    if (widget.article.title.toLowerCase().contains('santé')) tags.add('Santé');
    if (widget.article.title.toLowerCase().contains('éducation')) tags.add('Éducation');
    
    return tags.take(6).toList();
  }

  Color _getTagColor(int index) {
    final colors = [
      const Color(0xFF3B82F6), // Bleu
      const Color(0xFF10B981), // Vert
      const Color(0xFF8B5CF6), // Violet
      const Color(0xFFEC4899), // Rose
      const Color(0xFFF59E0B), // Ambre
      const Color(0xFF06B6D4), // Cyan
    ];
    return colors[index % colors.length];
  }

  Future<void> _incrementViewCount() async {
    try {
      await _service.incrementViewCount(widget.article.id);
    } catch (e) {
      // Silently fail
    }
  }

  void _shareArticle() {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Partager: ${widget.article.title}'),
        duration: const Duration(seconds: 2),
        action: SnackBarAction(
          label: 'OK',
          onPressed: () {},
        ),
      ),
    );
  }

  void _toggleFavorite() {
    setState(() => _isFavorite = !_isFavorite);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(_isFavorite ? 'Ajouté aux favoris' : 'Retiré des favoris'),
        duration: const Duration(seconds: 2),
      ),
    );
  }

  void _toggleLike() {
    setState(() => _isLiked = !_isLiked);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(_isLiked ? 'Vous aimez cet article' : 'J\'aime retiré'),
        duration: const Duration(seconds: 1),
      ),
    );
  }

  @override
  void dispose() {
    _scrollController.dispose();
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: CustomScrollView(
        controller: _scrollController,
        slivers: [
          // AppBar avec effet de parallaxe
          SliverAppBar(
            expandedHeight: 300,
            pinned: true,
            elevation: 0,
            backgroundColor: AppColors.primary,
            leading: IconButton(
              icon: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.black.withOpacity(0.3),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.arrow_back, color: Colors.white, size: 20),
              ),
              onPressed: () => Navigator.pop(context),
            ),
            actions: [
              IconButton(
                icon: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.black.withOpacity(0.3),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.share, color: Colors.white, size: 20),
                ),
                onPressed: _shareArticle,
              ),
              IconButton(
                icon: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.black.withOpacity(0.3),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    _isFavorite ? Icons.bookmark : Icons.bookmark_border,
                    color: Colors.white,
                    size: 20,
                  ),
                ),
                onPressed: _toggleFavorite,
              ),
            ],
            flexibleSpace: FlexibleSpaceBar(
              title: _showAppBarTitle
                  ? Text(
                      widget.article.title,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        shadows: [Shadow(blurRadius: 4, color: Colors.black45)],
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    )
                  : null,
              background: Stack(
                fit: StackFit.expand,
                children: [
                  Image.network(
                    widget.article.coverImage,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) {
                      return Container(
                        color: AppColors.surfaceVariant,
                        child: const Icon(Icons.image, size: 64),
                      );
                    },
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
                  // Badge Yakro Actu
                  Positioned(
                    bottom: 16,
                    left: 16,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                      decoration: BoxDecoration(
                        color: AppColors.primary,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        'Yakro Actu',
                        style: AppTextStyles.caption.copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Contenu de l'article
          SliverToBoxAdapter(
            child: FadeTransition(
              opacity: _fadeAnimation,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // En-tête de l'article
                  Container(
                    padding: const EdgeInsets.all(AppSpacing.paddingScreen),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Catégorie
                        if (widget.article.categoryName != null)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: AppColors.getCategoryColor(
                                widget.article.categoryName!.toLowerCase(),
                              ).withOpacity(0.15),
                              borderRadius: BorderRadius.circular(16),
                            ),
                            child: Text(
                              widget.article.categoryName!,
                              style: AppTextStyles.caption.copyWith(
                                color: AppColors.getCategoryColor(
                                  widget.article.categoryName!.toLowerCase(),
                                ),
                                fontWeight: FontWeight.bold,
                                fontSize: 11,
                              ),
                            ),
                          ),
                        const SizedBox(height: AppSpacing.sm),

                        // Titre
                        Text(
                          widget.article.title,
                          style: AppTextStyles.h3.copyWith(
                            fontSize: 22,
                            height: 1.25,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: AppSpacing.sm),

                        // Description
                        if (widget.article.description != null)
                          Text(
                            widget.article.description!,
                            style: AppTextStyles.bodyMedium.copyWith(
                              color: AppColors.textSecondary,
                              fontStyle: FontStyle.italic,
                              height: 1.4,
                            ),
                          ),
                        const SizedBox(height: AppSpacing.md),

                        // Meta informations
                        Row(
                          children: [
                            CircleAvatar(
                              radius: 18,
                              backgroundImage: widget.article.authorAvatar != null
                                  ? NetworkImage(widget.article.authorAvatar!)
                                  : null,
                              child: widget.article.authorAvatar == null
                                  ? const Icon(Icons.person, size: 18)
                                  : null,
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    widget.article.author,
                                    style: AppTextStyles.bodySmall.copyWith(
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  Row(
                                    children: [
                                      Icon(Icons.access_time, size: 12, color: AppColors.textSecondary),
                                      const SizedBox(width: 3),
                                      Text(
                                        _formatDate(widget.article.publishedAt),
                                        style: AppTextStyles.caption.copyWith(
                                          color: AppColors.textSecondary,
                                          fontSize: 11,
                                        ),
                                      ),
                                      const SizedBox(width: 8),
                                      Icon(Icons.visibility, size: 12, color: AppColors.textSecondary),
                                      const SizedBox(width: 3),
                                      Text(
                                        '${widget.article.viewCount}',
                                        style: AppTextStyles.caption.copyWith(
                                          color: AppColors.textSecondary,
                                          fontSize: 11,
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: AppSpacing.md),

                        // Divider
                        Divider(color: AppColors.surfaceVariant, thickness: 0.5),
                        const SizedBox(height: AppSpacing.md),

                        // Contenu de l'article
                        Text(
                          widget.article.content,
                          style: AppTextStyles.bodyMedium.copyWith(
                            height: 1.7,
                            fontSize: 15,
                          ),
                        ),
                        const SizedBox(height: AppSpacing.md),

                        // Divider
                        Divider(color: AppColors.surfaceVariant, thickness: 0.5),
                        const SizedBox(height: AppSpacing.md),

                        // Mots-clés avec couleurs variées
                        if (_tags.isNotEmpty) ...[
                          Row(
                            children: [
                              Icon(Icons.label_outline, size: 16, color: AppColors.textSecondary),
                              const SizedBox(width: 6),
                              Text(
                                'Mots-clés',
                                style: AppTextStyles.bodyMedium.copyWith(
                                  fontWeight: FontWeight.bold,
                                  color: AppColors.textSecondary,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Wrap(
                            spacing: 6,
                            runSpacing: 6,
                            children: _tags.asMap().entries.map((entry) {
                              final index = entry.key;
                              final tag = entry.value;
                              final tagColor = _getTagColor(index);
                              return Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                                decoration: BoxDecoration(
                                  gradient: LinearGradient(
                                    colors: [
                                      tagColor.withOpacity(0.15),
                                      tagColor.withOpacity(0.05),
                                    ],
                                  ),
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(
                                    color: tagColor.withOpacity(0.4),
                                    width: 1,
                                  ),
                                ),
                                child: Text(
                                  tag,
                                  style: AppTextStyles.caption.copyWith(
                                    color: tagColor,
                                    fontWeight: FontWeight.w600,
                                    fontSize: 11,
                                  ),
                                ),
                              );
                            }).toList(),
                          ),
                          const SizedBox(height: AppSpacing.md),
                        ],

                        // Barre de progression de lecture
                        Container(
                          height: 4,
                          decoration: BoxDecoration(
                            color: Colors.grey[200],
                            borderRadius: BorderRadius.circular(2),
                          ),
                          child: LayoutBuilder(
                            builder: (context, constraints) {
                              return Container(
                                width: constraints.maxWidth * 0.7,
                                decoration: BoxDecoration(
                                  gradient: LinearGradient(
                                    colors: [
                                      AppColors.primary,
                                      AppColors.primary.withOpacity(0.6),
                                    ],
                                  ),
                                  borderRadius: BorderRadius.circular(2),
                                ),
                              );
                            },
                          ),
                        ),
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            Icon(Icons.access_time_filled, size: 12, color: AppColors.textSecondary),
                            const SizedBox(width: 4),
                            Text(
                              'Temps de lecture estimé: 3 min',
                              style: AppTextStyles.caption.copyWith(
                                color: AppColors.textSecondary,
                                fontSize: 11,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: AppSpacing.md),

                        // Actions compactes et modernes
                        Row(
                          children: [
                            Expanded(
                              child: _buildCompactActionButton(
                                icon: _isLiked ? Icons.thumb_up : Icons.thumb_up_outlined,
                                label: 'J\'aime',
                                onTap: _toggleLike,
                                isActive: _isLiked,
                                activeColor: Colors.red,
                              ),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: _buildCompactActionButton(
                                icon: Icons.share_outlined,
                                label: 'Partager',
                                onTap: _shareArticle,
                                isActive: false,
                              ),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: _buildCompactActionButton(
                                icon: _isFavorite ? Icons.bookmark : Icons.bookmark_outline,
                                label: 'Sauvegarder',
                                onTap: _toggleFavorite,
                                isActive: _isFavorite,
                                activeColor: Colors.amber,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: AppSpacing.md),

                        // Citation inspirante
                        Container(
                          margin: const EdgeInsets.symmetric(vertical: AppSpacing.md),
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                              colors: [
                                AppColors.primary.withOpacity(0.05),
                                AppColors.primary.withOpacity(0.02),
                              ],
                            ),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: AppColors.primary.withOpacity(0.2),
                              width: 1,
                            ),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Icon(Icons.format_quote, color: AppColors.primary, size: 20),
                                  const SizedBox(width: 8),
                                  Text(
                                    'Le saviez-vous ?',
                                    style: AppTextStyles.bodyMedium.copyWith(
                                      fontWeight: FontWeight.bold,
                                      color: AppColors.primary,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Text(
                                'Chaque article est vérifié par notre équipe de rédaction pour garantir l\'exactitude et la qualité de l\'information diffusée.',
                                style: AppTextStyles.bodySmall.copyWith(
                                  fontStyle: FontStyle.italic,
                                  color: AppColors.textSecondary,
                                  height: 1.5,
                                ),
                              ),
                            ],
                          ),
                        ),

                        // Statistiques de l'article
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: Colors.grey[50],
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceAround,
                            children: [
                              _buildStatItem(Icons.visibility_outlined, '1.2k', 'Vues'),
                              Container(width: 1, height: 30, color: Colors.grey[300]),
                              _buildStatItem(Icons.thumb_up_outlined, '234', 'J\'aime'),
                              Container(width: 1, height: 30, color: Colors.grey[300]),
                              _buildStatItem(Icons.share_outlined, '56', 'Partages'),
                            ],
                          ),
                        ),
                        const SizedBox(height: AppSpacing.md),

                        // Articles connexes
                        if (_relatedArticles.isNotEmpty) ...[
                          Text(
                            'Sur le même sujet',
                            style: AppTextStyles.h6.copyWith(fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: AppSpacing.sm),
                          ..._relatedArticles.map((article) => _buildRelatedArticleCard(article)),
                        ],
                        // Padding bottom pour éviter le menu du téléphone
                        const SizedBox(height: 80),
                      ],
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

  Widget _buildCompactActionButton({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
    bool isActive = false,
    Color? activeColor,
  }) {
    final color = isActive && activeColor != null ? activeColor : Colors.grey[600]!;
    
    return InkWell(
      onTap: onTap,
      child: Column(
        children: [
          Icon(icon, size: 22, color: color),
          const SizedBox(height: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: 10,
              color: color,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionButton({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      child: Column(
        children: [
          Icon(icon, size: 24, color: AppColors.primary),
          const SizedBox(height: 4),
          Text(
            label,
            style: AppTextStyles.caption.copyWith(
              color: AppColors.primary,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatItem(IconData icon, String value, String label) {
    return Column(
      children: [
        Icon(icon, size: 18, color: AppColors.primary),
        const SizedBox(height: 4),
        Text(
          value,
          style: AppTextStyles.bodyMedium.copyWith(
            fontWeight: FontWeight.bold,
            fontSize: 14,
          ),
        ),
        Text(
          label,
          style: AppTextStyles.caption.copyWith(
            color: AppColors.textSecondary,
            fontSize: 10,
          ),
        ),
      ],
    );
  }

  Widget _buildRelatedArticleCard(Article article) {
    return InkWell(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => ArticleDetailScreen(article: article),
          ),
        );
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: AppColors.surfaceVariant.withOpacity(0.3),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: AppColors.surfaceVariant.withOpacity(0.5),
            width: 0.5,
          ),
        ),
        child: Row(
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(6),
              child: Image.network(
                article.coverImage,
                width: 70,
                height: 70,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) {
                  return Container(
                    width: 70,
                    height: 70,
                    color: AppColors.surfaceVariant,
                    child: const Icon(Icons.image, size: 20),
                  );
                },
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (article.categoryName != null)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                      decoration: BoxDecoration(
                        color: AppColors.getCategoryColor(
                          article.categoryName!.toLowerCase(),
                        ).withOpacity(0.15),
                        borderRadius: BorderRadius.circular(3),
                      ),
                      child: Text(
                        article.categoryName!,
                        style: AppTextStyles.caption.copyWith(
                          fontSize: 8,
                          color: AppColors.getCategoryColor(
                            article.categoryName!.toLowerCase(),
                          ),
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  const SizedBox(height: 3),
                  Text(
                    article.title,
                    style: AppTextStyles.bodySmall.copyWith(
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                      height: 1.2,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 3),
                  Row(
                    children: [
                      Icon(Icons.access_time, size: 10, color: AppColors.textSecondary),
                      const SizedBox(width: 3),
                      Text(
                        _formatDate(article.publishedAt),
                        style: AppTextStyles.caption.copyWith(
                          color: AppColors.textSecondary,
                          fontSize: 10,
                        ),
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
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final diff = now.difference(date);

    if (diff.inDays > 0) {
      return 'il y a ${diff.inDays}j';
    } else if (diff.inHours > 0) {
      return 'il y a ${diff.inHours}h';
    } else {
      return 'il y a ${diff.inMinutes}min';
    }
  }
}
