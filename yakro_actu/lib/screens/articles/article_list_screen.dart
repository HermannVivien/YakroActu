import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';

import '../../models/article.dart';
import '../../services/mock/mock_data_service.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_spacing.dart';
import '../../theme/app_text_styles.dart';
import '../article/article_detail_screen.dart';

class ArticleListScreen extends StatefulWidget {
  final String? category;
  final String? categoryName;
  final bool showOnlyBreaking;

  const ArticleListScreen({
    super.key,
    this.category,
    this.categoryName,
    this.showOnlyBreaking = false,
  });

  @override
  State<ArticleListScreen> createState() => _ArticleListScreenState();
}

class _ArticleListScreenState extends State<ArticleListScreen> with SingleTickerProviderStateMixin {
  List<Article> _articles = [];
  bool _isLoading = true;
  String _selectedFilter = 'Récents';
  late AnimationController _animationController;

  @override
  void initState() {
    super.initState();
    _loadArticles();
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

  Future<void> _loadArticles() async {
    setState(() => _isLoading = true);
    
    await Future.delayed(const Duration(milliseconds: 300));
    
    final allArticles = MockDataService.getMockArticles();
    
    setState(() {
      if (widget.showOnlyBreaking) {
        // Afficher uniquement les articles flash/breaking
        _articles = allArticles
            .where((article) => article.isBreaking == true)
            .toList();
      } else if (widget.categoryName != null) {
        // Filtrer par nom de catégorie exact
        _articles = allArticles
            .where((article) => 
                article.categoryName?.toLowerCase() == widget.categoryName?.toLowerCase())
            .toList();
      } else if (widget.category != null) {
        // Filtrer par slug de catégorie
        _articles = allArticles
            .where((article) => 
                article.categoryName?.toLowerCase() == widget.category?.toLowerCase())
            .toList();
      } else {
        _articles = allArticles;
      }
      
      _sortArticles();
      _isLoading = false;
    });
  }

  void _sortArticles() {
    if (_selectedFilter == 'Récents') {
      _articles.sort((a, b) => b.publishedAt!.compareTo(a.publishedAt!));
    } else if (_selectedFilter == 'Populaires') {
      _articles.sort((a, b) => b.viewCount.compareTo(a.viewCount));
    } else if (_selectedFilter == 'À la une') {
      _articles.sort((a, b) {
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return b.publishedAt!.compareTo(a.publishedAt!);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        elevation: 0,
        title: Text(
          widget.categoryName ?? widget.category ?? 'Tous les articles',
          style: AppTextStyles.h5.copyWith(
            color: Colors.white,
            fontWeight: FontWeight.bold,
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
          // En-tête avec filtres uniquement
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  AppColors.primary,
                  AppColors.primary.withOpacity(0.85),
                ],
              ),
            ),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _buildFilterChip('Récents'),
                  const SizedBox(width: 6),
                  _buildFilterChip('Populaires'),
                  const SizedBox(width: 6),
                  _buildFilterChip('À la une'),
                ],
              ),
            ),
          ),
          
          // Liste des articles
          Expanded(
            child: _isLoading
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        CircularProgressIndicator(color: AppColors.primary),
                        const SizedBox(height: 16),
                        Text(
                          'Chargement...',
                          style: AppTextStyles.bodySmall.copyWith(
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  )
                : _articles.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.article_outlined, size: 64, color: Colors.grey[300]),
                            const SizedBox(height: 16),
                            Text(
                              'Aucun article disponible',
                              style: AppTextStyles.bodyMedium.copyWith(
                                color: AppColors.textSecondary,
                              ),
                            ),
                          ],
                        ),
                      )
                    : RefreshIndicator(
                        onRefresh: _loadArticles,
                        color: AppColors.primary,
                        child: ListView.builder(
                          padding: const EdgeInsets.all(8),
                          itemCount: _articles.length,
                          itemBuilder: (context, index) {
                            return FadeTransition(
                              opacity: Tween<double>(begin: 0.0, end: 1.0).animate(
                                CurvedAnimation(
                                  parent: _animationController,
                                  curve: Interval(
                                    (index / _articles.length) * 0.5,
                                    1.0,
                                    curve: Curves.easeOut,
                                  ),
                                ),
                              ),
                              child: SlideTransition(
                                position: Tween<Offset>(
                                  begin: const Offset(0.3, 0),
                                  end: Offset.zero,
                                ).animate(
                                  CurvedAnimation(
                                    parent: _animationController,
                                    curve: Interval(
                                      (index / _articles.length) * 0.5,
                                      1.0,
                                      curve: Curves.easeOut,
                                    ),
                                  ),
                                ),
                                child: _buildCompactArticleCard(_articles[index], index),
                              ),
                            );
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
    return GestureDetector(
      onTap: () {
        setState(() {
          _selectedFilter = label;
          _sortArticles();
        });
      },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
        decoration: BoxDecoration(
          color: isSelected ? Colors.white : Colors.white.withOpacity(0.2),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? Colors.white : Colors.white.withOpacity(0.3),
            width: 1,
          ),
        ),
        child: Text(
          label,
          style: AppTextStyles.bodySmall.copyWith(
            color: isSelected ? AppColors.primary : Colors.white,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
            fontSize: 10,
          ),
        ),
      ),
    );
  }

  Widget _buildCompactArticleCard(Article article, int index) {
    final isBreaking = article.isBreaking;
    final isFeatured = article.isFeatured;
    
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
        margin: const EdgeInsets.only(bottom: 8),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(10),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.04),
              blurRadius: 6,
              offset: const Offset(0, 2),
            ),
          ],
          // Bordure gauche colorée pour articles flash
          border: isBreaking
              ? Border(
                  left: BorderSide(
                    color: Colors.red,
                    width: 4,
                  ),
                )
              : null,
        ),
        child: Stack(
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Image compacte avec overlay
                Stack(
                  children: [
                    ClipRRect(
                      borderRadius: const BorderRadius.only(
                        topLeft: Radius.circular(10),
                        bottomLeft: Radius.circular(10),
                      ),
                      child: CachedNetworkImage(
                        imageUrl: article.coverImage,
                        width: 90,
                        height: 90,
                        fit: BoxFit.cover,
                        placeholder: (context, url) => Container(
                          color: Colors.grey[200],
                          child: const Center(
                            child: CircularProgressIndicator(strokeWidth: 2),
                          ),
                        ),
                        errorWidget: (context, url, error) => Container(
                          color: Colors.grey[200],
                          child: Icon(Icons.image_not_supported, color: Colors.grey[400]),
                        ),
                      ),
                    ),
                    if (isFeatured)
                      Positioned(
                        top: 4,
                        left: 4,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              colors: [Colors.amber[700]!, Colors.amber[500]!],
                            ),
                            borderRadius: BorderRadius.circular(3),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: const [
                              Icon(Icons.star, size: 8, color: Colors.white),
                              SizedBox(width: 2),
                              Text(
                                'Une',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 7,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                  ],
                ),
                
                // Contenu
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.all(8),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Row avec catégorie et badge flash
                        Row(
                          children: [
                            // Catégorie
                            if (article.categoryName != null)
                              Flexible(
                                child: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                                  decoration: BoxDecoration(
                                    gradient: LinearGradient(
                                      colors: [
                                        AppColors.getCategoryColor(
                                          article.categoryName!.toLowerCase(),
                                        ).withOpacity(0.15),
                                        AppColors.getCategoryColor(
                                          article.categoryName!.toLowerCase(),
                                        ).withOpacity(0.05),
                                      ],
                                    ),
                                    borderRadius: BorderRadius.circular(3),
                                    border: Border.all(
                                      color: AppColors.getCategoryColor(
                                        article.categoryName!.toLowerCase(),
                                      ).withOpacity(0.3),
                                      width: 0.5,
                                    ),
                                  ),
                                  child: Text(
                                    article.categoryName!,
                                    style: AppTextStyles.caption.copyWith(
                                      color: AppColors.getCategoryColor(
                                        article.categoryName!.toLowerCase(),
                                      ),
                                      fontWeight: FontWeight.bold,
                                      fontSize: 8,
                                    ),
                                  ),
                                ),
                              ),
                            
                            // Badge Flash subtil
                            if (isBreaking) ...[
                              const SizedBox(width: 6),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                                decoration: BoxDecoration(
                                  color: Colors.red.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(3),
                                  border: Border.all(
                                    color: Colors.red.withOpacity(0.3),
                                    width: 0.5,
                                  ),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: const [
                                    Icon(Icons.bolt, size: 8, color: Colors.red),
                                    SizedBox(width: 2),
                                    Text(
                                      'Flash',
                                      style: TextStyle(
                                        color: Colors.red,
                                        fontSize: 7,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ],
                        ),
                        const SizedBox(height: 3),
                        
                        // Titre
                        Text(
                          article.title,
                          style: AppTextStyles.bodyMedium.copyWith(
                            fontWeight: FontWeight.bold,
                            fontSize: 12,
                            height: 1.25,
                            color: AppColors.textPrimary,
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 4),
                        
                        // Meta info avec icônes
                        Row(
                          children: [
                            Icon(Icons.access_time_rounded, size: 10, color: AppColors.textSecondary),
                            const SizedBox(width: 2),
                            Text(
                              article.publishedAt != null
                                  ? _formatDate(article.publishedAt!)
                                  : 'Récent',
                              style: AppTextStyles.caption.copyWith(
                                color: AppColors.textSecondary,
                                fontSize: 8,
                              ),
                            ),
                            const SizedBox(width: 8),
                            Icon(Icons.visibility_outlined, size: 10, color: AppColors.textSecondary),
                            const SizedBox(width: 2),
                            Text(
                              _formatViews(article.viewCount),
                              style: AppTextStyles.caption.copyWith(
                                color: AppColors.textSecondary,
                                fontSize: 8,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
                
                // Flèche indicatrice
                Padding(
                  padding: const EdgeInsets.all(8),
                  child: Icon(
                    Icons.arrow_forward_ios,
                    size: 12,
                    color: AppColors.textSecondary.withOpacity(0.4),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  String _formatViews(int views) {
    if (views >= 1000) {
      return '${(views / 1000).toStringAsFixed(1)}k';
    }
    return views.toString();
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final diff = now.difference(date);
    
    if (diff.inDays == 0) {
      if (diff.inHours == 0) {
        return 'Il y a ${diff.inMinutes}min';
      }
      return 'Il y a ${diff.inHours}h';
    } else if (diff.inDays < 7) {
      return 'Il y a ${diff.inDays}j';
    } else {
      return '${date.day}/${date.month}/${date.year}';
    }
  }
}
