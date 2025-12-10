import 'package:flutter/material.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_spacing.dart';
import '../../theme/app_text_styles.dart';
import '../../models/sport.dart';

class SportMatchDetailScreen extends StatelessWidget {
  final SportMatch match;

  const SportMatchDetailScreen({
    Key? key,
    required this.match,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Détails du match'),
        actions: [
          IconButton(
            icon: const Icon(Icons.share),
            onPressed: () {},
          ),
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () {},
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            // En-tête avec statut
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(AppSpacing.paddingSection),
              decoration: BoxDecoration(
                gradient: AppColors.primaryGradient,
              ),
              child: Column(
                children: [
                  // Ligue
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      if (match.leagueLogo != null) ...[
                        Image.network(
                          match.leagueLogo!,
                          width: 24,
                          height: 24,
                          color: Colors.white,
                          errorBuilder: (context, error, stackTrace) {
                            return const Icon(Icons.sports,
                                size: 24, color: Colors.white);
                          },
                        ),
                        const SizedBox(width: AppSpacing.sm),
                      ],
                      Text(
                        match.league ?? 'Football',
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: Colors.white,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.lg),

                  // Statut et date
                  if (match.isLive)
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: AppSpacing.md,
                        vertical: AppSpacing.sm,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.live,
                        borderRadius:
                            BorderRadius.circular(AppSpacing.radiusSmall),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: const [
                          Icon(Icons.circle, size: 10, color: Colors.white),
                          SizedBox(width: 8),
                          Text(
                            'EN DIRECT',
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                              letterSpacing: 1,
                            ),
                          ),
                        ],
                      ),
                    )
                  else
                    Text(
                      _formatMatchDate(match.matchDate),
                      style: const TextStyle(
                        fontSize: 14,
                        color: Colors.white70,
                      ),
                    ),
                  const SizedBox(height: AppSpacing.xl),

                  // Équipes et scores
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      // Équipe domicile
                      Expanded(
                        child: _buildTeamDisplay(
                          match.homeTeam,
                          match.homeTeamLogo,
                          match.homeScore,
                        ),
                      ),

                      // Séparateur
                      Padding(
                        padding: const EdgeInsets.symmetric(
                            horizontal: AppSpacing.md),
                        child: Text(
                          match.isScheduled ? 'vs' : '-',
                          style: const TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                      ),

                      // Équipe extérieur
                      Expanded(
                        child: _buildTeamDisplay(
                          match.awayTeam,
                          match.awayTeamLogo,
                          match.awayScore,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.lg),

                  // Stade
                  if (match.venue != null)
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.stadium, size: 16, color: Colors.white70),
                        const SizedBox(width: 4),
                        Text(
                          match.venue!,
                          style: const TextStyle(
                            fontSize: 14,
                            color: Colors.white70,
                          ),
                        ),
                      ],
                    ),
                ],
              ),
            ),

            // Statistiques et détails
            Padding(
              padding: const EdgeInsets.all(AppSpacing.paddingScreen),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Informations',
                    style: AppTextStyles.sectionTitle,
                  ),
                  const SizedBox(height: AppSpacing.md),

                  _buildInfoRow('Statut', _getStatusText()),
                  _buildInfoRow('Date', _formatMatchDate(match.matchDate)),
                  if (match.venue != null)
                    _buildInfoRow('Stade', match.venue!),

                  const SizedBox(height: AppSpacing.xl),

                  // Section vide pour statistiques futures
                  Container(
                    padding: const EdgeInsets.all(AppSpacing.paddingSection),
                    decoration: BoxDecoration(
                      color: AppColors.surfaceVariant,
                      borderRadius:
                          BorderRadius.circular(AppSpacing.radiusMedium),
                    ),
                    child: Center(
                      child: Column(
                        children: [
                          const Icon(
                            Icons.analytics_outlined,
                            size: 48,
                            color: AppColors.textSecondary,
                          ),
                          const SizedBox(height: AppSpacing.md),
                          const Text(
                            'Statistiques détaillées',
                            style: AppTextStyles.h6,
                          ),
                          const SizedBox(height: AppSpacing.sm),
                          Text(
                            'Disponibles prochainement',
                            style: AppTextStyles.caption,
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTeamDisplay(String name, String? logo, int? score) {
    return Column(
      children: [
        // Logo
        if (logo != null)
          Image.network(
            logo,
            width: 80,
            height: 80,
            errorBuilder: (context, error, stackTrace) {
              return Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(AppSpacing.radiusMedium),
                ),
                child: const Icon(Icons.shield, color: Colors.white, size: 40),
              );
            },
          )
        else
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.2),
              borderRadius: BorderRadius.circular(AppSpacing.radiusMedium),
            ),
            child: const Icon(Icons.shield, color: Colors.white, size: 40),
          ),
        const SizedBox(height: AppSpacing.md),

        // Nom
        Text(
          name,
          style: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
          textAlign: TextAlign.center,
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
        ),

        // Score
        if (score != null) ...[
          const SizedBox(height: AppSpacing.sm),
          Text(
            score.toString(),
            style: const TextStyle(
              fontSize: 36,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.md),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: AppTextStyles.bodyMedium.copyWith(
              color: AppColors.textSecondary,
            ),
          ),
          Text(
            value,
            style: AppTextStyles.bodyMedium.copyWith(
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  String _getStatusText() {
    if (match.isLive) return 'En direct';
    if (match.isFinished) return 'Terminé';
    if (match.isScheduled) return 'À venir';
    return match.status;
  }

  String _formatMatchDate(DateTime date) {
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
    final hour = date.hour.toString().padLeft(2, '0');
    final minute = date.minute.toString().padLeft(2, '0');
    return '${date.day} ${months[date.month - 1]} ${date.year} à $hour:$minute';
  }
}
