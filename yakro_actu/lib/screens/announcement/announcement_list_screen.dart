import 'package:flutter/material.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_spacing.dart';
import '../../theme/app_text_styles.dart';
import '../../models/announcement.dart';
import '../../services/api/announcement_service.dart';
import 'announcement_detail_screen.dart';

class AnnouncementListScreen extends StatefulWidget {
  const AnnouncementListScreen({Key? key}) : super(key: key);

  @override
  State<AnnouncementListScreen> createState() => _AnnouncementListScreenState();
}

class _AnnouncementListScreenState extends State<AnnouncementListScreen> {
  final AnnouncementService _service = AnnouncementService();
  final ScrollController _scrollController = ScrollController();

  List<Announcement> _announcements = [];
  bool _isLoading = true;
  bool _isLoadingMore = false;
  int _currentPage = 1;
  bool _hasMore = true;
  String? _selectedType;

  @override
  void initState() {
    super.initState();
    _loadAnnouncements();
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

  Future<void> _loadAnnouncements() async {
    try {
      final announcements = await _service.getAnnouncements(
        page: 1,
        limit: 20,
        type: _selectedType,
      );
      setState(() {
        _announcements = announcements;
        _currentPage = 1;
        _hasMore = announcements.length >= 20;
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
      final announcements = await _service.getAnnouncements(
        page: _currentPage + 1,
        limit: 20,
        type: _selectedType,
      );

      setState(() {
        _announcements.addAll(announcements);
        _currentPage++;
        _hasMore = announcements.length >= 20;
        _isLoadingMore = false;
      });
    } catch (e) {
      setState(() => _isLoadingMore = false);
    }
  }

  Future<void> _refresh() async {
    setState(() => _isLoading = true);
    await _loadAnnouncements();
  }

  void _filterByType(String? type) {
    setState(() {
      _selectedType = type;
      _isLoading = true;
    });
    _loadAnnouncements();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Annonces'),
        actions: [
          PopupMenuButton<String>(
            icon: const Icon(Icons.filter_list),
            onSelected: _filterByType,
            itemBuilder: (context) => [
              const PopupMenuItem(value: null, child: Text('Toutes')),
              const PopupMenuItem(
                  value: 'announcement', child: Text('Annonces')),
              const PopupMenuItem(
                  value: 'press_release', child: Text('Communiqués')),
              const PopupMenuItem(
                  value: 'public_notice', child: Text('Avis publics')),
            ],
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _refresh,
              child: _announcements.isEmpty
                  ? _buildEmptyState()
                  : ListView.builder(
                      controller: _scrollController,
                      padding: const EdgeInsets.all(AppSpacing.paddingScreen),
                      itemCount: _announcements.length + (_isLoadingMore ? 1 : 0),
                      itemBuilder: (context, index) {
                        if (index == _announcements.length) {
                          return const Center(
                            child: Padding(
                              padding: EdgeInsets.all(AppSpacing.md),
                              child: CircularProgressIndicator(),
                            ),
                          );
                        }
                        return _buildAnnouncementCard(_announcements[index]);
                      },
                    ),
            ),
    );
  }

  Widget _buildAnnouncementCard(Announcement announcement) {
    return Card(
      margin: const EdgeInsets.only(bottom: AppSpacing.marginBetweenCards),
      child: InkWell(
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) =>
                  AnnouncementDetailScreen(announcement: announcement),
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
                  _buildPriorityBadge(announcement.priority),
                  const SizedBox(width: AppSpacing.xs),
                  _buildTypeBadge(announcement.type),
                  const Spacer(),
                  if (announcement.isExpired)
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: AppSpacing.sm,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.textSecondary.withOpacity(0.15),
                        borderRadius:
                            BorderRadius.circular(AppSpacing.radiusSmall),
                      ),
                      child: const Text(
                        'Expirée',
                        style: TextStyle(
                          fontSize: 11,
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ),
                ],
              ),
              const SizedBox(height: AppSpacing.md),

              // Titre
              Text(
                announcement.title,
                style: AppTextStyles.h6,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: AppSpacing.sm),

              // Extrait du contenu
              if (announcement.content.isNotEmpty)
                Text(
                  announcement.content,
                  style: AppTextStyles.bodyMedium.copyWith(
                    color: AppColors.textSecondary,
                  ),
                  maxLines: 3,
                  overflow: TextOverflow.ellipsis,
                ),
              const SizedBox(height: AppSpacing.md),

              // Footer
              Row(
                children: [
                  Icon(Icons.visibility,
                      size: 14, color: AppColors.textSecondary),
                  const SizedBox(width: 4),
                  Text('${announcement.viewCount}',
                      style: AppTextStyles.caption),
                  const SizedBox(width: AppSpacing.md),
                  if (announcement.expiresAt != null) ...[
                    Icon(Icons.event,
                        size: 14, color: AppColors.textSecondary),
                    const SizedBox(width: 4),
                    Text(
                      'Expire le ${_formatDate(announcement.expiresAt!)}',
                      style: AppTextStyles.caption,
                    ),
                  ],
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPriorityBadge(String priority) {
    Color color;
    String label;

    switch (priority) {
      case 'urgent':
        color = AppColors.error;
        label = 'URGENT';
        break;
      case 'high':
        color = AppColors.breaking;
        label = 'IMPORTANT';
        break;
      case 'medium':
        color = AppColors.featured;
        label = 'Moyen';
        break;
      default:
        color = AppColors.info;
        label = 'Normal';
    }

    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.sm,
        vertical: 4,
      ),
      decoration: BoxDecoration(
        color: color.withOpacity(0.15),
        borderRadius: BorderRadius.circular(AppSpacing.radiusSmall),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.bold,
          color: color,
        ),
      ),
    );
  }

  Widget _buildTypeBadge(String type) {
    String label;
    switch (type) {
      case 'press_release':
        label = 'Communiqué';
        break;
      case 'public_notice':
        label = 'Avis public';
        break;
      default:
        label = 'Annonce';
    }

    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.sm,
        vertical: 4,
      ),
      decoration: BoxDecoration(
        color: AppColors.primary.withOpacity(0.15),
        borderRadius: BorderRadius.circular(AppSpacing.radiusSmall),
      ),
      child: Text(
        label,
        style: const TextStyle(
          fontSize: 11,
          color: AppColors.primary,
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.campaign, size: 64, color: AppColors.textTertiary),
          const SizedBox(height: AppSpacing.md),
          const Text('Aucune annonce', style: AppTextStyles.h5),
          const SizedBox(height: AppSpacing.sm),
          const Text('Revenez plus tard', style: AppTextStyles.caption),
        ],
      ),
    );
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }
}
