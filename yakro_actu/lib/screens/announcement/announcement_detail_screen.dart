import 'package:flutter/material.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_spacing.dart';
import '../../theme/app_text_styles.dart';
import '../../models/announcement.dart';
import '../../services/api/announcement_service.dart';

class AnnouncementDetailScreen extends StatefulWidget {
  final Announcement announcement;

  const AnnouncementDetailScreen({
    Key? key,
    required this.announcement,
  }) : super(key: key);

  @override
  State<AnnouncementDetailScreen> createState() =>
      _AnnouncementDetailScreenState();
}

class _AnnouncementDetailScreenState extends State<AnnouncementDetailScreen> {
  final AnnouncementService _service = AnnouncementService();

  @override
  void initState() {
    super.initState();
    _incrementViewCount();
  }

  Future<void> _incrementViewCount() async {
    try {
      await _service.incrementViewCount(widget.announcement.id);
    } catch (e) {
      // Silently fail
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Annonce'),
        actions: [
          IconButton(icon: const Icon(Icons.share), onPressed: () {}),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // En-tête avec priorité
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(AppSpacing.paddingSection),
              decoration: BoxDecoration(
                gradient: _getPriorityGradient(),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      _buildPriorityBadge(),
                      const SizedBox(width: AppSpacing.sm),
                      _buildTypeBadge(),
                      const Spacer(),
                      if (widget.announcement.isExpired)
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: AppSpacing.sm,
                            vertical: 4,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.3),
                            borderRadius:
                                BorderRadius.circular(AppSpacing.radiusSmall),
                          ),
                          child: const Text(
                            'Expirée',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.md),
                  Text(
                    widget.announcement.title,
                    style: AppTextStyles.h4.copyWith(color: Colors.white),
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  Row(
                    children: [
                      Icon(Icons.visibility, size: 16, color: Colors.white70),
                      const SizedBox(width: 4),
                      Text(
                        '${widget.announcement.viewCount} vues',
                        style: const TextStyle(color: Colors.white70),
                      ),
                      if (widget.announcement.expiresAt != null) ...[
                        const SizedBox(width: AppSpacing.md),
                        Icon(Icons.event, size: 16, color: Colors.white70),
                        const SizedBox(width: 4),
                        Text(
                          'Expire le ${_formatDate(widget.announcement.expiresAt!)}',
                          style: const TextStyle(color: Colors.white70),
                        ),
                      ],
                    ],
                  ),
                ],
              ),
            ),

            // Contenu
            Padding(
              padding: const EdgeInsets.all(AppSpacing.paddingSection),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    widget.announcement.content,
                    style: AppTextStyles.bodyMedium.copyWith(height: 1.8),
                  ),

                  // Pièce jointe
                  if (widget.announcement.attachmentUrl != null) ...[
                    const SizedBox(height: AppSpacing.xl),
                    const Text('Pièce jointe', style: AppTextStyles.h6),
                    const SizedBox(height: AppSpacing.md),
                    InkWell(
                      onTap: () {
                        // TODO: Télécharger la pièce jointe
                      },
                      child: Container(
                        padding: const EdgeInsets.all(AppSpacing.paddingCard),
                        decoration: BoxDecoration(
                          color: AppColors.surfaceVariant,
                          borderRadius:
                              BorderRadius.circular(AppSpacing.radiusMedium),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.attachment,
                                color: AppColors.primary),
                            const SizedBox(width: AppSpacing.md),
                            const Expanded(
                              child: Text(
                                'Télécharger le document',
                                style: AppTextStyles.bodyMedium,
                              ),
                            ),
                            const Icon(Icons.download,
                                color: AppColors.textSecondary),
                          ],
                        ),
                      ),
                    ),
                  ],

                  // Contact
                  if (widget.announcement.contactEmail != null ||
                      widget.announcement.contactPhone != null) ...[
                    const SizedBox(height: AppSpacing.xl),
                    const Text('Contact', style: AppTextStyles.h6),
                    const SizedBox(height: AppSpacing.md),
                    if (widget.announcement.contactEmail != null)
                      _buildContactInfo(
                        Icons.email,
                        widget.announcement.contactEmail!,
                      ),
                    if (widget.announcement.contactPhone != null)
                      _buildContactInfo(
                        Icons.phone,
                        widget.announcement.contactPhone!,
                      ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  LinearGradient _getPriorityGradient() {
    switch (widget.announcement.priority) {
      case 'urgent':
        return LinearGradient(
          colors: [AppColors.error, AppColors.error.withOpacity(0.8)],
        );
      case 'high':
        return LinearGradient(
          colors: [AppColors.breaking, AppColors.breaking.withOpacity(0.8)],
        );
      default:
        return AppColors.primaryGradient;
    }
  }

  Widget _buildPriorityBadge() {
    String label;
    switch (widget.announcement.priority) {
      case 'urgent':
        label = 'URGENT';
        break;
      case 'high':
        label = 'IMPORTANT';
        break;
      case 'medium':
        label = 'Moyen';
        break;
      default:
        label = 'Normal';
    }

    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.sm,
        vertical: 4,
      ),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.3),
        borderRadius: BorderRadius.circular(AppSpacing.radiusSmall),
      ),
      child: Text(
        label,
        style: const TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.bold,
          color: Colors.white,
        ),
      ),
    );
  }

  Widget _buildTypeBadge() {
    String label;
    switch (widget.announcement.type) {
      case 'press_release':
        label = 'Communiqué de presse';
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
        color: Colors.white.withOpacity(0.3),
        borderRadius: BorderRadius.circular(AppSpacing.radiusSmall),
      ),
      child: Text(
        label,
        style: const TextStyle(
          fontSize: 11,
          color: Colors.white,
        ),
      ),
    );
  }

  Widget _buildContactInfo(IconData icon, String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.sm),
      child: Row(
        children: [
          Icon(icon, size: 20, color: AppColors.primary),
          const SizedBox(width: AppSpacing.sm),
          Expanded(
            child: Text(
              text,
              style: AppTextStyles.bodyMedium.copyWith(
                color: AppColors.primary,
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _formatDate(DateTime date) {
    final months = [
      'janvier',
      'février',
      'mars',
      'avril',
      'mai',
      'juin',
      'juillet',
      'août',
      'septembre',
      'octobre',
      'novembre',
      'décembre'
    ];
    return '${date.day} ${months[date.month - 1]} ${date.year}';
  }
}
