import 'package:flutter/material.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_spacing.dart';
import '../../theme/app_text_styles.dart';
import '../../models/forum.dart';
import '../../services/api/forum_service.dart';

class ForumTopicDetailScreen extends StatefulWidget {
  final ForumTopic topic;

  const ForumTopicDetailScreen({
    Key? key,
    required this.topic,
  }) : super(key: key);

  @override
  State<ForumTopicDetailScreen> createState() => _ForumTopicDetailScreenState();
}

class _ForumTopicDetailScreenState extends State<ForumTopicDetailScreen> {
  final ForumService _service = ForumService();
  final ScrollController _scrollController = ScrollController();
  final TextEditingController _replyController = TextEditingController();

  List<ForumPost> _posts = [];
  bool _isLoading = true;
  bool _isLoadingMore = false;
  int _currentPage = 1;
  bool _hasMore = true;
  int? _replyingToId;

  @override
  void initState() {
    super.initState();
    _loadPosts();
    _scrollController.addListener(_onScroll);
    _incrementViews();
  }

  @override
  void dispose() {
    _scrollController.dispose();
    _replyController.dispose();
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

  Future<void> _incrementViews() async {
    try {
      await _service.incrementTopicViews(widget.topic.id);
    } catch (e) {
      // Silently fail
    }
  }

  Future<void> _loadPosts() async {
    try {
      final posts = await _service.getPosts(
        topicId: widget.topic.id,
        page: 1,
        limit: 20,
      );
      setState(() {
        _posts = posts;
        _currentPage = 1;
        _hasMore = posts.length >= 20;
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
      final posts = await _service.getPosts(
        topicId: widget.topic.id,
        page: _currentPage + 1,
        limit: 20,
      );

      setState(() {
        _posts.addAll(posts);
        _currentPage++;
        _hasMore = posts.length >= 20;
        _isLoadingMore = false;
      });
    } catch (e) {
      setState(() => _isLoadingMore = false);
    }
  }

  Future<void> _submitReply() async {
    final content = _replyController.text.trim();
    if (content.isEmpty) return;

    try {
      // Note: Requires authentication token
      await _service.createPost(
        content: content,
        topicId: widget.topic.id,
        parentId: _replyingToId,
        token: 'user_token_here', // TODO: Get from auth service
      );

      _replyController.clear();
      setState(() => _replyingToId = null);
      _loadPosts();

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Réponse publiée')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erreur: ${e.toString()}')),
        );
      }
    }
  }

  Future<void> _votePost(int postId, String voteType) async {
    try {
      await _service.votePost(
        postId,
        voteType,
        'user_token_here', // TODO: Get from auth service
      );
      _loadPosts();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erreur: ${e.toString()}')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          widget.topic.title,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.share),
            onPressed: () {},
          ),
          IconButton(
            icon: const Icon(Icons.more_vert),
            onPressed: () {},
          ),
        ],
      ),
      body: Column(
        children: [
          // Contenu du sujet
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(AppSpacing.paddingSection),
            decoration: BoxDecoration(
              color: AppColors.surfaceVariant,
              border: Border(
                bottom: BorderSide(
                  color: AppColors.textTertiary.withOpacity(0.2),
                  width: 1,
                ),
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Badges
                Row(
                  children: [
                    if (widget.topic.isPinned)
                      _buildBadge('Épinglé', Icons.push_pin, AppColors.featured),
                    if (widget.topic.isLocked) ...[
                      if (widget.topic.isPinned) const SizedBox(width: AppSpacing.xs),
                      _buildBadge('Verrouillé', Icons.lock, AppColors.error),
                    ],
                  ],
                ),
                if (widget.topic.isPinned || widget.topic.isLocked)
                  const SizedBox(height: AppSpacing.md),

                // Titre
                Text(
                  widget.topic.title,
                  style: AppTextStyles.h5,
                ),
                const SizedBox(height: AppSpacing.md),

                // Contenu
                Text(
                  widget.topic.content,
                  style: AppTextStyles.bodyMedium.copyWith(height: 1.6),
                ),
                const SizedBox(height: AppSpacing.md),

                // Auteur et stats
                Row(
                  children: [
                    CircleAvatar(
                      radius: 16,
                      backgroundColor: AppColors.primary,
                      child: Icon(
                        Icons.person,
                        size: 18,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(width: AppSpacing.sm),
                    Text(
                      widget.topic.author?.name ?? 'Anonyme',
                      style: AppTextStyles.bodyMedium.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const Spacer(),
                    Icon(Icons.visibility, size: 16, color: AppColors.textSecondary),
                    const SizedBox(width: 4),
                    Text('${widget.topic.viewCount}', style: AppTextStyles.caption),
                    const SizedBox(width: AppSpacing.md),
                    Icon(Icons.comment, size: 16, color: AppColors.textSecondary),
                    const SizedBox(width: 4),
                    Text('${widget.topic.postCount}', style: AppTextStyles.caption),
                  ],
                ),
              ],
            ),
          ),

          // Liste des réponses
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _posts.isEmpty
                    ? _buildEmptyState()
                    : ListView.builder(
                        controller: _scrollController,
                        padding: const EdgeInsets.all(AppSpacing.paddingScreen),
                        itemCount: _posts.length + (_isLoadingMore ? 1 : 0),
                        itemBuilder: (context, index) {
                          if (index == _posts.length) {
                            return const Center(
                              child: Padding(
                                padding: EdgeInsets.all(AppSpacing.md),
                                child: CircularProgressIndicator(),
                              ),
                            );
                          }
                          return _buildPostCard(_posts[index]);
                        },
                      ),
          ),

          // Zone de réponse
          if (!widget.topic.isLocked) _buildReplyBox(),
        ],
      ),
    );
  }

  Widget _buildBadge(String label, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.sm,
        vertical: 4,
      ),
      decoration: BoxDecoration(
        color: color.withOpacity(0.15),
        borderRadius: BorderRadius.circular(AppSpacing.radiusSmall),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: color),
          const SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: color,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPostCard(ForumPost post, {int level = 0}) {
    final isReply = post.parentId != null;

    return Container(
      margin: EdgeInsets.only(
        bottom: AppSpacing.marginBetweenCards,
        left: isReply ? AppSpacing.xl : 0,
      ),
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.paddingCard),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Auteur et date
              Row(
                children: [
                  CircleAvatar(
                    radius: 14,
                    backgroundColor: AppColors.surfaceVariant,
                    child: Icon(
                      Icons.person,
                      size: 16,
                      color: AppColors.textSecondary,
                    ),
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  Text(
                    post.author?.name ?? 'Anonyme',
                    style: AppTextStyles.bodyMedium.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const Spacer(),
                  Text(
                    _formatDate(post.createdAt),
                    style: AppTextStyles.caption,
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.md),

              // Contenu
              Text(
                post.content,
                style: AppTextStyles.bodyMedium.copyWith(height: 1.6),
              ),
              if (post.isEdited) ...[
                const SizedBox(height: AppSpacing.sm),
                Text(
                  'Modifié',
                  style: AppTextStyles.caption.copyWith(
                    fontStyle: FontStyle.italic,
                  ),
                ),
              ],
              const SizedBox(height: AppSpacing.md),

              // Actions
              Row(
                children: [
                  // Vote up
                  InkWell(
                    onTap: () => _votePost(post.id, 'upvote'),
                    child: Row(
                      children: [
                        Icon(
                          Icons.arrow_upward,
                          size: 18,
                          color: AppColors.success,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          '${post.upvotes}',
                          style: AppTextStyles.caption.copyWith(
                            color: AppColors.success,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: AppSpacing.md),

                  // Vote down
                  InkWell(
                    onTap: () => _votePost(post.id, 'downvote'),
                    child: Row(
                      children: [
                        Icon(
                          Icons.arrow_downward,
                          size: 18,
                          color: AppColors.error,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          '${post.downvotes}',
                          style: AppTextStyles.caption.copyWith(
                            color: AppColors.error,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: AppSpacing.md),

                  // Total
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: AppSpacing.sm,
                      vertical: 2,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.surfaceVariant,
                      borderRadius:
                          BorderRadius.circular(AppSpacing.radiusSmall),
                    ),
                    child: Text(
                      '${post.totalVotes}',
                      style: AppTextStyles.caption.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  const Spacer(),

                  // Répondre
                  TextButton.icon(
                    onPressed: () {
                      setState(() => _replyingToId = post.id);
                      _replyController.text = '@${post.author?.name ?? "Anonyme"} ';
                    },
                    icon: const Icon(Icons.reply, size: 16),
                    label: const Text('Répondre'),
                  ),
                ],
              ),

              // Réponses imbriquées
              if (post.replies != null && post.replies!.isNotEmpty) ...[
                const SizedBox(height: AppSpacing.md),
                ...post.replies!.map((reply) => _buildPostCard(reply, level: level + 1)),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildReplyBox() {
    return Container(
      padding: EdgeInsets.only(
        left: AppSpacing.paddingScreen,
        right: AppSpacing.paddingScreen,
        top: AppSpacing.md,
        bottom: MediaQuery.of(context).viewInsets.bottom + AppSpacing.md,
      ),
      decoration: BoxDecoration(
        color: AppColors.surface,
        border: Border(
          top: BorderSide(
            color: AppColors.textTertiary.withOpacity(0.2),
            width: 1,
          ),
        ),
      ),
      child: Row(
        children: [
          Expanded(
            child: TextField(
              controller: _replyController,
              decoration: InputDecoration(
                hintText: _replyingToId != null
                    ? 'Écrire une réponse...'
                    : 'Commenter...',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(AppSpacing.radiusMedium),
                ),
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: AppSpacing.md,
                  vertical: AppSpacing.sm,
                ),
                suffixIcon: _replyingToId != null
                    ? IconButton(
                        icon: const Icon(Icons.close),
                        onPressed: () {
                          setState(() => _replyingToId = null);
                          _replyController.clear();
                        },
                      )
                    : null,
              ),
              maxLines: null,
            ),
          ),
          const SizedBox(width: AppSpacing.sm),
          IconButton(
            onPressed: _submitReply,
            icon: const Icon(Icons.send),
            color: AppColors.primary,
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.comment,
            size: 64,
            color: AppColors.textTertiary,
          ),
          const SizedBox(height: AppSpacing.md),
          const Text(
            'Aucun commentaire',
            style: AppTextStyles.h5,
          ),
          const SizedBox(height: AppSpacing.sm),
          const Text(
            'Soyez le premier à commenter',
            style: AppTextStyles.caption,
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
