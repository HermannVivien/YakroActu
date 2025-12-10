import 'package:flutter/material.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_text_styles.dart';
import '../../theme/app_spacing.dart';
import '../../models/announcement.dart';
import '../../services/mock/mock_data_service.dart';

class AnnouncementsScreen extends StatefulWidget {
  const AnnouncementsScreen({Key? key}) : super(key: key);

  @override
  State<AnnouncementsScreen> createState() => _AnnouncementsScreenState();
}

class _AnnouncementsScreenState extends State<AnnouncementsScreen> with SingleTickerProviderStateMixin {
  bool _isLoading = true;
  List<Announcement> _announcements = [];
  late AnimationController _animationController;
  String _selectedFilter = 'all';
  final Set<int> _readAnnouncements = {};

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 350),
    );
    _loadAnnouncements();
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  Future<void> _loadAnnouncements() async {
    setState(() => _isLoading = true);
    
    // Simulate API delay
    await Future.delayed(const Duration(milliseconds: 800));
    
    // Use mock data
    setState(() {
      _announcements = MockDataService.getMockAnnouncements();
      _isLoading = false;
    });
    _animationController.forward();
  }

  List<Announcement> get _filteredAnnouncements {
    if (_selectedFilter == 'all') return _announcements;
    return _announcements.where((a) => a.type == _selectedFilter).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        elevation: 0,
        backgroundColor: Colors.transparent,
        title: Text('Annonces', style: AppTextStyles.h5.copyWith(color: AppColors.textPrimary)),
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: AppColors.textPrimary),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          IconButton(
            icon: Icon(Icons.mark_email_read, color: AppColors.primary),
            onPressed: _markAllAsRead,
            tooltip: 'Tout marquer comme lu',
          ),
        ],
      ),
      body: Column(
        children: [
          _buildFilterChips(),
          Expanded(
            child: _isLoading 
              ? _buildLoadingState()
              : RefreshIndicator(
                  onRefresh: _loadAnnouncements,
                  child: _filteredAnnouncements.isEmpty 
                    ? _buildEmptyState() 
                    : _buildAnnouncementsList(),
                ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChips() {
    return Container(
      height: 50,
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.paddingScreen),
      child: ListView(
        scrollDirection: Axis.horizontal,
        children: [
          _buildFilterChip('all', 'Tout', Icons.all_inclusive, AppColors.primary),
          const SizedBox(width: 8),
          _buildFilterChip('info', 'Info', Icons.info, AppColors.info),
          const SizedBox(width: 8),
          _buildFilterChip('warning', 'Attention', Icons.warning, AppColors.warning),
          const SizedBox(width: 8),
          _buildFilterChip('success', 'Succès', Icons.check_circle, AppColors.success),
          const SizedBox(width: 8),
          _buildFilterChip('error', 'Urgent', Icons.error, AppColors.error),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String value, String label, IconData icon, Color color) {
    final isSelected = _selectedFilter == value;
    return FilterChip(
      selected: isSelected,
      label: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: isSelected ? Colors.white : color),
          const SizedBox(width: 4),
          Text(label),
        ],
      ),
      onSelected: (selected) {
        setState(() {
          _selectedFilter = value;
        });
      },
      backgroundColor: AppColors.surface,
      selectedColor: color,
      labelStyle: AppTextStyles.caption.copyWith(
        color: isSelected ? Colors.white : AppColors.textPrimary,
        fontWeight: FontWeight.w600,
        fontSize: 12,
      ),
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
    );
  }

  Widget _buildLoadingState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          SizedBox(
            width: 50,
            height: 50,
            child: CircularProgressIndicator(
              strokeWidth: 3,
              valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
            ),
          ),
          const SizedBox(height: 16),
          Text('Chargement...', style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary)),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.notifications_none, size: 80, color: AppColors.textTertiary),
          const SizedBox(height: 16),
          Text('Aucune annonce', style: AppTextStyles.h6.copyWith(color: AppColors.textSecondary)),
          const SizedBox(height: 8),
          Text('Tirez pour actualiser', style: AppTextStyles.bodySmall.copyWith(color: AppColors.textTertiary)),
        ],
      ),
    );
  }

  Widget _buildAnnouncementsList() {
    return ListView.builder(
      padding: const EdgeInsets.all(AppSpacing.paddingScreen),
      itemCount: _filteredAnnouncements.length,
      itemBuilder: (context, index) {
        final announcement = _filteredAnnouncements[index];
        return ScaleTransition(
          scale: Tween<double>(begin: 0.9, end: 1.0).animate(
            CurvedAnimation(
              parent: _animationController,
              curve: Interval(
                index * 0.1,
                1.0,
                curve: Curves.easeOutBack,
              ),
            ),
          ),
          child: FadeTransition(
            opacity: Tween<double>(begin: 0.0, end: 1.0).animate(
              CurvedAnimation(
                parent: _animationController,
                curve: Interval(
                  index * 0.1,
                  1.0,
                  curve: Curves.easeOut,
                ),
              ),
            ),
            child: _buildAnnouncementCard(announcement),
          ),
        );
      },
    );
  }

  Widget _buildAnnouncementCard(Announcement announcement) {
    final categoryColor = _getCategoryColor(announcement.type);
    final priorityColor = _getPriorityColor(announcement.priority);
    final hasUnread = !_readAnnouncements.contains(announcement.id);

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () => _showAnnouncementDetails(announcement),
          borderRadius: BorderRadius.circular(14),
          child: Ink(
            decoration: BoxDecoration(
              color: hasUnread 
                ? categoryColor.withOpacity(0.03)
                : AppColors.surface,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(
                color: hasUnread 
                  ? categoryColor.withOpacity(0.3)
                  : AppColors.surfaceVariant,
                width: hasUnread ? 1.5 : 1,
              ),
              boxShadow: hasUnread ? [
                BoxShadow(
                  color: categoryColor.withOpacity(0.1),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ] : [
                BoxShadow(
                  color: Colors.black.withOpacity(0.02),
                  blurRadius: 4,
                  offset: const Offset(0, 1),
                ),
              ],
            ),
            child: Padding(
              padding: const EdgeInsets.all(14),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Category Icon
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: categoryColor.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Icon(
                      _getCategoryIcon(announcement.type),
                      color: categoryColor,
                      size: 22,
                    ),
                  ),
                  const SizedBox(width: 12),
                  // Content
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: Text(
                                announcement.title,
                                style: AppTextStyles.bodyMedium.copyWith(
                                  fontWeight: hasUnread ? FontWeight.w700 : FontWeight.w600,
                                  fontSize: 14,
                                  color: AppColors.textPrimary,
                                ),
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                            if (announcement.priority == 'urgent' || announcement.priority == 'high')
                              Container(
                                margin: const EdgeInsets.only(left: 6),
                                width: 8,
                                height: 8,
                                decoration: BoxDecoration(
                                  color: priorityColor,
                                  shape: BoxShape.circle,
                                ),
                              ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Text(
                          announcement.content,
                          style: AppTextStyles.bodySmall.copyWith(
                            color: AppColors.textSecondary,
                            fontSize: 12,
                            height: 1.4,
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            Icon(Icons.access_time, size: 12, color: AppColors.textTertiary),
                            const SizedBox(width: 4),
                            Text(
                              _formatDate(announcement.createdAt),
                              style: AppTextStyles.caption.copyWith(
                                color: AppColors.textTertiary,
                                fontSize: 11,
                              ),
                            ),
                            const SizedBox(width: 12),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: categoryColor.withOpacity(0.1),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text(
                                _getCategoryLabel(announcement.type),
                                style: AppTextStyles.caption.copyWith(
                                  color: categoryColor,
                                  fontWeight: FontWeight.w600,
                                  fontSize: 10,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  // Unread indicator
                  if (hasUnread)
                    Container(
                      width: 10,
                      height: 10,
                      margin: const EdgeInsets.only(top: 2),
                      decoration: BoxDecoration(
                        color: categoryColor,
                        shape: BoxShape.circle,
                      ),
                    ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  void _showAnnouncementDetails(Announcement announcement) {
    setState(() {
      _readAnnouncements.add(announcement.id);
    });

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => Container(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Category badge and priority
            Row(
              children: [
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: _getCategoryColor(announcement.type).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(
                    _getCategoryIcon(announcement.type),
                    color: _getCategoryColor(announcement.type),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(_getCategoryLabel(announcement.type), 
                        style: AppTextStyles.caption.copyWith(
                          color: _getCategoryColor(announcement.type),
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      if (announcement.priority != 'normal' && announcement.priority != 'low')
                        Text(
                          _getPriorityLabel(announcement.priority),
                          style: AppTextStyles.caption.copyWith(
                            color: _getPriorityColor(announcement.priority),
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Text(announcement.title, style: AppTextStyles.h6),
            const SizedBox(height: 8),
            Text(
              _formatDate(announcement.createdAt),
              style: AppTextStyles.caption.copyWith(color: AppColors.textTertiary),
            ),
            const SizedBox(height: 16),
            Text(
              announcement.content,
              style: AppTextStyles.bodyMedium.copyWith(height: 1.5),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () => Navigator.pop(context),
                style: ElevatedButton.styleFrom(
                  backgroundColor: _getCategoryColor(announcement.type),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                ),
                child: const Text('Fermer'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Color _getCategoryColor(String category) {
    switch (category) {
      case 'info': return AppColors.info;
      case 'warning': return AppColors.warning;
      case 'success': return AppColors.success;
      case 'error': return AppColors.error;
      default: return AppColors.primary;
    }
  }

  IconData _getCategoryIcon(String category) {
    switch (category) {
      case 'info': return Icons.info;
      case 'warning': return Icons.warning;
      case 'success': return Icons.check_circle;
      case 'error': return Icons.error;
      default: return Icons.notifications;
    }
  }

  String _getCategoryLabel(String category) {
    switch (category) {
      case 'info': return 'Information';
      case 'warning': return 'Attention';
      case 'success': return 'Succès';
      case 'error': return 'Urgent';
      default: return 'Annonce';
    }
  }

  Color _getPriorityColor(String priority) {
    switch (priority) {
      case 'urgent': return AppColors.error;
      case 'high': return AppColors.warning;
      case 'low': return AppColors.info;
      default: return AppColors.textSecondary;
    }
  }

  String _getPriorityLabel(String priority) {
    switch (priority) {
      case 'urgent': return 'URGENT';
      case 'high': return 'PRIORITÉ HAUTE';
      case 'low': return 'Faible priorité';
      default: return 'Normal';
    }
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final diff = now.difference(date);

    if (diff.inDays == 0) {
      if (diff.inHours == 0) {
        return 'Il y a ${diff.inMinutes} min';
      }
      return 'Il y a ${diff.inHours}h';
    } else if (diff.inDays == 1) {
      return 'Hier';
    } else if (diff.inDays < 7) {
      return 'Il y a ${diff.inDays} jours';
    } else {
      return '${date.day}/${date.month}/${date.year}';
    }
  }

  void _markAllAsRead() {
    setState(() {
      for (var announcement in _announcements) {
        _readAnnouncements.add(announcement.id);
      }
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Toutes les annonces ont été marquées comme lues')),
    );
  }
}
