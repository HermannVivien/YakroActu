import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_spacing.dart';
import '../theme/app_text_styles.dart';

/// Widget de section avec titre
class SectionHeader extends StatelessWidget {
  final String title;
  final String? subtitle;
  final VoidCallback? onSeeAll;
  final IconData? icon;
  
  const SectionHeader({
    Key? key,
    required this.title,
    this.subtitle,
    this.onSeeAll,
    this.icon,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.paddingScreen,
        vertical: AppSpacing.sm,
      ),
      child: Row(
        children: [
          if (icon != null) ...[
            Icon(icon, size: AppSpacing.iconMedium, color: AppColors.primary),
            const SizedBox(width: AppSpacing.sm),
          ],
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: AppTextStyles.sectionTitle),
                if (subtitle != null)
                  Text(subtitle!, style: AppTextStyles.caption),
              ],
            ),
          ),
          if (onSeeAll != null)
            TextButton(
              onPressed: onSeeAll,
              child: const Text('Voir tout'),
            ),
        ],
      ),
    );
  }
}

/// Badge personnalisé (Breaking, Live, etc.)
class BadgeLabel extends StatelessWidget {
  final String text;
  final Color color;
  final Color? textColor;
  final IconData? icon;
  
  const BadgeLabel({
    Key? key,
    required this.text,
    required this.color,
    this.textColor,
    this.icon,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.sm,
        vertical: AppSpacing.xs,
      ),
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(AppSpacing.radiusSmall),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: 12, color: textColor ?? AppColors.textOnPrimary),
            const SizedBox(width: 4),
          ],
          Text(
            text,
            style: AppTextStyles.badge.copyWith(
              color: textColor ?? AppColors.textOnPrimary,
            ),
          ),
        ],
      ),
    );
  }
}

/// Carte d'article élégante
class ArticleCard extends StatelessWidget {
  final String title;
  final String? subtitle;
  final String? imageUrl;
  final String? category;
  final String? timeAgo;
  final bool isFeatured;
  final bool isBreaking;
  final VoidCallback onTap;
  
  const ArticleCard({
    Key? key,
    required this.title,
    this.subtitle,
    this.imageUrl,
    this.category,
    this.timeAgo,
    this.isFeatured = false,
    this.isBreaking = false,
    required this.onTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      shadowColor: Colors.black.withOpacity(0.1),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppSpacing.radiusMedium),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image
            if (imageUrl != null)
              Stack(
                children: [
                  AspectRatio(
                    aspectRatio: 16 / 9,
                    child: Image.network(
                      imageUrl!,
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) {
                        return Container(
                          color: AppColors.surfaceVariant,
                          child: const Icon(
                            Icons.image_outlined,
                            size: 48,
                            color: AppColors.textTertiary,
                          ),
                        );
                      },
                    ),
                  ),
                  // Badges
                  Positioned(
                    top: AppSpacing.sm,
                    left: AppSpacing.sm,
                    child: Row(
                      children: [
                        if (isBreaking)
                          const BadgeLabel(
                            text: 'BREAKING',
                            color: AppColors.breaking,
                            icon: Icons.bolt,
                          ),
                        if (isFeatured)
                          const Padding(
                            padding: EdgeInsets.only(left: AppSpacing.xs),
                            child: BadgeLabel(
                              text: 'À LA UNE',
                              color: AppColors.featured,
                              textColor: AppColors.textPrimary,
                              icon: Icons.star,
                            ),
                          ),
                      ],
                    ),
                  ),
                ],
              ),
            
            // Contenu
            Padding(
              padding: const EdgeInsets.all(AppSpacing.paddingCard),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Catégorie et temps
                  if (category != null || timeAgo != null)
                    Padding(
                      padding: const EdgeInsets.only(bottom: AppSpacing.xs),
                      child: Row(
                        children: [
                          if (category != null) ...[
                            Text(
                              category!.toUpperCase(),
                              style: AppTextStyles.overline.copyWith(
                                color: AppColors.primary,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            if (timeAgo != null) ...[
                              const Text(' • ', style: AppTextStyles.overline),
                            ],
                          ],
                          if (timeAgo != null)
                            Text(timeAgo!, style: AppTextStyles.timestamp),
                        ],
                      ),
                    ),
                  
                  // Titre
                  Text(
                    title,
                    style: AppTextStyles.articleTitle,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  
                  // Sous-titre
                  if (subtitle != null) ...[
                    const SizedBox(height: AppSpacing.xs),
                    Text(
                      subtitle!,
                      style: AppTextStyles.articleSubtitle,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
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
}

/// Shimmer loading pour articles
class ArticleCardShimmer extends StatelessWidget {
  const ArticleCardShimmer({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            height: AppSpacing.imageCardHeight,
            color: AppColors.surfaceVariant,
          ),
          Padding(
            padding: const EdgeInsets.all(AppSpacing.paddingCard),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 100,
                  height: 12,
                  color: AppColors.surfaceVariant,
                ),
                const SizedBox(height: AppSpacing.sm),
                Container(
                  height: 20,
                  color: AppColors.surfaceVariant,
                ),
                const SizedBox(height: AppSpacing.xs),
                Container(
                  height: 20,
                  width: 200,
                  color: AppColors.surfaceVariant,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// Widget d'état vide
class EmptyState extends StatelessWidget {
  final IconData icon;
  final String title;
  final String message;
  final String? actionLabel;
  final VoidCallback? onAction;
  
  const EmptyState({
    Key? key,
    required this.icon,
    required this.title,
    required this.message,
    this.actionLabel,
    this.onAction,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.paddingSection),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              size: AppSpacing.iconXLarge * 2,
              color: AppColors.textTertiary,
            ),
            const SizedBox(height: AppSpacing.lg),
            Text(
              title,
              style: AppTextStyles.h5,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: AppSpacing.sm),
            Text(
              message,
              style: AppTextStyles.bodyMedium.copyWith(
                color: AppColors.textSecondary,
              ),
              textAlign: TextAlign.center,
            ),
            if (actionLabel != null && onAction != null) ...[
              const SizedBox(height: AppSpacing.lg),
              ElevatedButton(
                onPressed: onAction,
                child: Text(actionLabel!),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
