import 'package:flutter/material.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_spacing.dart';
import '../../theme/app_text_styles.dart';
import '../../models/forum.dart';
import '../../services/api/forum_service.dart';
import 'forum_topic_detail_screen.dart';
import 'create_topic_screen.dart';

class ForumTopicsScreen extends StatefulWidget {
  final ForumCategory category;

  const ForumTopicsScreen({
    Key? key,
    required this.category,
  }) : super(key: key);

  @override
  State<ForumTopicsScreen> createState() => _ForumTopicsScreenState();
}

class _ForumTopicsScreenState extends State<ForumTopicsScreen> {
  final ForumService _service = ForumService();
  final ScrollController _scrollController = ScrollController();

  List<ForumTopic> _topics = [];
  bool _isLoading = true;
  bool _isLoadingMore = false;
  int _currentPage = 1;
  bool _hasMore = true;

  @override
  void initState() {
    super.initState();
    _loadTopics();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent * 0.8) {
      if (!_isLoadingMore && _hasMore) {
        _loadMore();
      }
    }
  }

  Future<void> _loadTopics() async {
    try {
      final topics = await _service.getTopics(
        page: 1,
        limit: 20,
        categoryId: widget.category.id,
      );
      setState(() {
        _topics = topics;
        _currentPage = 1;
        _hasMore = topics.length >= 20;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erreur: ${e.toString()}')),
        );
      }
    }
  }

  Future<void> _loadMore() async {
    if (_isLoadingMore || !_hasMore) return;

    setState(() => _isLoadingMore = true);

    try {
      final topics = await _service.getTopics(
        page: _currentPage + 1,
        limit: 20,
        categoryId: widget.category.id,
      );

      setState(() {
        _topics.addAll(topics);
        _currentPage++;
        _hasMore = topics.length >= 20;
        _isLoadingMore = false;
      });
    } catch (e) {
      setState(() => _isLoadingMore = false);
    }
  }

  Future<void> _refresh() async {
    setState(() => _isLoading = true);
    await _loadTopics();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.category.name),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _refresh,
              child: _topics.isEmpty
                  ? _buildEmptyState()
                  : ListView.builder(
                      controller: _scrollController,
                      padding: const EdgeInsets.all(AppSpacing.paddingScreen),
                      itemCount: _topics.length + (_isLoadingMore ? 1 : 0),
                      itemBuilder: (context, index) {
                        if (index == _topics.length) {
                          return const Center(
                            child: Padding(
                              padding: EdgeInsets.all(AppSpacing.md),
                              child: CircularProgressIndicator(),
                            ),
                          );
                        }
                        return _buildTopicCard(_topics[index]);
                      },
                    ),
            ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => CreateTopicScreen(category: widget.category),
            ),
          ).then((created) {
            if (created == true) {
              _refresh();
            }
          });
        },
        icon: const Icon(Icons.add),
        label: const Text('Nouveau sujet'),
      ),
    );
  }

  Widget _buildTopicCard(ForumTopic topic) {
    return Card(
      margin: const EdgeInsets.only(bottom: AppSpacing.marginBetweenCards),
      child: InkWell(
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => ForumTopicDetailScreen(topic: topic),
            ),
          );
        },
        borderRadius: BorderRadius.circular(AppSpacing.radiusMedium),
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.paddingCard),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // En-tête avec badges
              Row(
                children: [
                  if (topic.isPinned)
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: AppSpacing.sm,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.featured.withOpacity(0.15),
                        borderRadius:
                            BorderRadius.circular(AppSpacing.radiusSmall),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            Icons.push_pin,
                            size: 12,
                            color: AppColors.featured,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            'Épinglé',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              color: AppColors.featured,
                            ),
                          ),
                        ],
                      ),
                    ),
                  if (topic.isLocked) ...[
                    if (topic.isPinned) const SizedBox(width: AppSpacing.xs),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: AppSpacing.sm,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.error.withOpacity(0.15),
                        borderRadius:
                            BorderRadius.circular(AppSpacing.radiusSmall),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: const [
                          Icon(
                            Icons.lock,
                            size: 12,
                            color: AppColors.error,
                          ),
                          SizedBox(width: 4),
                          Text(
                            'Verrouillé',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              color: AppColors.error,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ],
              ),
              if (topic.isPinned || topic.isLocked)
                const SizedBox(height: AppSpacing.sm),

              // Titre
              Text(
                topic.title,
                style: AppTextStyles.h6,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: AppSpacing.sm),

              // Extrait du contenu
              if (topic.content.isNotEmpty)
                Text(
                  topic.content,
                  style: AppTextStyles.bodyMedium.copyWith(
                    color: AppColors.textSecondary,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              const SizedBox(height: AppSpacing.md),

              // Statistiques et auteur
              Row(
                children: [
                  // Auteur
                  CircleAvatar(
                    radius: 12,
                    backgroundColor: AppColors.surfaceVariant,
                    child: Icon(
                      Icons.person,
                      size: 16,
                      color: AppColors.textSecondary,
                    ),
                  ),
                  const SizedBox(width: AppSpacing.xs),
                  Text(
                    topic.author?.name ?? 'Anonyme',
                    style: AppTextStyles.caption,
                  ),
                  const Spacer(),

                  // Vues
                  Icon(
                    Icons.visibility,
                    size: 14,
                    color: AppColors.textSecondary,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    '${topic.viewCount}',
                    style: AppTextStyles.caption,
                  ),
                  const SizedBox(width: AppSpacing.md),

                  // Réponses
                  Icon(
                    Icons.comment,
                    size: 14,
                    color: AppColors.textSecondary,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    '${topic.postCount}',
                    style: AppTextStyles.caption,
                  ),
                ],
              ),

              // Dernière activité
              if (topic.lastActivity != null) ...[
                const SizedBox(height: AppSpacing.sm),
                Text(
                  'Dernière activité: ${_formatDate(topic.lastActivity!)}',
                  style: AppTextStyles.caption.copyWith(
                    fontSize: 11,
                    fontStyle: FontStyle.italic,
                  ),
                ),
              ],
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
            Icons.topic,
            size: 64,
            color: AppColors.textTertiary,
          ),
          const SizedBox(height: AppSpacing.md),
          const Text(
            'Aucun sujet',
            style: AppTextStyles.h5,
          ),
          const SizedBox(height: AppSpacing.sm),
          const Text(
            'Soyez le premier à créer un sujet',
            style: AppTextStyles.caption,
          ),
          const SizedBox(height: AppSpacing.lg),
          ElevatedButton.icon(
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) =>
                      CreateTopicScreen(category: widget.category),
                ),
              ).then((created) {
                if (created == true) {
                  _refresh();
                }
              });
            },
            icon: const Icon(Icons.add),
            label: const Text('Créer un sujet'),
          ),
        ],
      ),
    );
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final diff = now.difference(date);

    if (diff.inDays > 7) {
      return '${date.day}/${date.month}/${date.year}';
    } else if (diff.inDays > 0) {
      return 'il y a ${diff.inDays}j';
    } else if (diff.inHours > 0) {
      return 'il y a ${diff.inHours}h';
    } else if (diff.inMinutes > 0) {
      return 'il y a ${diff.inMinutes}min';
    } else {
      return 'à l\'instant';
    }
  }
}
