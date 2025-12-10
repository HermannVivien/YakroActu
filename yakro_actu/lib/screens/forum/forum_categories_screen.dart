import 'package:flutter/material.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_spacing.dart';
import '../../theme/app_text_styles.dart';
import '../../models/forum.dart';
import '../../services/api/forum_service.dart';
import 'forum_topics_screen.dart';

class ForumCategoriesScreen extends StatefulWidget {
  const ForumCategoriesScreen({Key? key}) : super(key: key);

  @override
  State<ForumCategoriesScreen> createState() => _ForumCategoriesScreenState();
}

class _ForumCategoriesScreenState extends State<ForumCategoriesScreen> {
  final ForumService _service = ForumService();
  List<ForumCategory> _categories = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadCategories();
  }

  Future<void> _loadCategories() async {
    try {
      final categories = await _service.getCategories();
      setState(() {
        _categories = categories;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erreur: ${e.toString()}')),
        );
      }
    }
  }

  Future<void> _refresh() async {
    setState(() => _isLoading = true);
    await _loadCategories();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Forum'),
        actions: [
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: () {},
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _refresh,
              child: _categories.isEmpty
                  ? _buildEmptyState()
                  : ListView.builder(
                      padding: const EdgeInsets.all(AppSpacing.paddingScreen),
                      itemCount: _categories.length,
                      itemBuilder: (context, index) {
                        return _buildCategoryCard(_categories[index]);
                      },
                    ),
            ),
    );
  }

  Widget _buildCategoryCard(ForumCategory category) {
    return Card(
      margin: const EdgeInsets.only(bottom: AppSpacing.marginBetweenCards),
      child: InkWell(
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => ForumTopicsScreen(category: category),
            ),
          );
        },
        borderRadius: BorderRadius.circular(AppSpacing.radiusMedium),
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.paddingCard),
          child: Row(
            children: [
              // Icône avec couleur
              Container(
                width: 56,
                height: 56,
                decoration: BoxDecoration(
                  color: _getCategoryColor(category.color).withOpacity(0.15),
                  borderRadius: BorderRadius.circular(AppSpacing.radiusMedium),
                ),
                child: Center(
                  child: Icon(
                    _getCategoryIcon(category.icon),
                    size: 28,
                    color: _getCategoryColor(category.color),
                  ),
                ),
              ),
              const SizedBox(width: AppSpacing.md),

              // Détails
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      category.name,
                      style: AppTextStyles.h6,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    if (category.description != null)
                      Text(
                        category.description!,
                        style: AppTextStyles.caption,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    const SizedBox(height: AppSpacing.sm),
                    Row(
                      children: [
                        Icon(
                          Icons.topic,
                          size: 14,
                          color: AppColors.textSecondary,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          '${category.topicCount} sujets',
                          style: AppTextStyles.caption,
                        ),
                        const SizedBox(width: AppSpacing.md),
                        Icon(
                          Icons.comment,
                          size: 14,
                          color: AppColors.textSecondary,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          '${category.postCount} posts',
                          style: AppTextStyles.caption,
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              // Flèche
              Icon(
                Icons.chevron_right,
                color: AppColors.textSecondary,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.forum,
            size: 64,
            color: AppColors.textTertiary,
          ),
          const SizedBox(height: AppSpacing.md),
          const Text(
            'Aucune catégorie',
            style: AppTextStyles.h5,
          ),
          const SizedBox(height: AppSpacing.sm),
          const Text(
            'Revenez plus tard',
            style: AppTextStyles.caption,
          ),
        ],
      ),
    );
  }

  IconData _getCategoryIcon(String? iconName) {
    switch (iconName) {
      case 'politics':
        return Icons.account_balance;
      case 'economy':
        return Icons.trending_up;
      case 'sport':
        return Icons.sports_soccer;
      case 'culture':
        return Icons.palette;
      case 'society':
        return Icons.groups;
      case 'tech':
        return Icons.computer;
      default:
        return Icons.forum;
    }
  }

  Color _getCategoryColor(String? colorName) {
    switch (colorName) {
      case 'red':
        return AppColors.error;
      case 'blue':
        return AppColors.primary;
      case 'green':
        return AppColors.success;
      case 'orange':
        return AppColors.secondary;
      case 'purple':
        return const Color(0xFF9C27B0);
      case 'teal':
        return const Color(0xFF009688);
      default:
        return AppColors.primary;
    }
  }
}
