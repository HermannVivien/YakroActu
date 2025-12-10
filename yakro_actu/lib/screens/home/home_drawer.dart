import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_spacing.dart';
import '../../theme/app_text_styles.dart';
import '../../services/theme_service.dart';
import '../articles/article_list_screen.dart';
import '../reportage/reportage_list_screen.dart';
import '../interview/interview_list_screen.dart';
import '../forum/forum_categories_screen.dart';
import '../sport/sport_screen.dart';
import '../pharmacy/pharmacies_screen.dart';
import '../events/events_screen.dart';
import '../announcements/announcements_screen.dart';
import '../testimony/testimony_list_screen.dart';
import '../settings_screen.dart';
import '../about_screen.dart';
import '../profile_screen.dart';
import '../media/media_screen.dart';

class HomeDrawer extends StatelessWidget {
  const HomeDrawer({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Drawer(
      child: Column(
        children: [
          // Header du drawer (fixe)
          Container(
            width: double.infinity,
            decoration: BoxDecoration(
              gradient: AppColors.primaryGradient,
            ),
            padding: const EdgeInsets.fromLTRB(16, 50, 16, 16),
            child: Row(
              children: [
                const CircleAvatar(
                  radius: 20,
                  backgroundColor: Colors.white,
                  child: Icon(Icons.person, size: 24, color: AppColors.primary),
                ),
                const SizedBox(width: 12),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Text(
                      'Yakro Actu',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'L\'info en temps réel',
                      style: TextStyle(
                        color: Colors.white.withOpacity(0.9),
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // Contenu scrollable
          Expanded(
            child: ListView(
              padding: const EdgeInsets.only(bottom: 80),
              children: [
                // Accueil
                _buildMenuItem(
                  context,
                  icon: Icons.home,
                  title: 'Accueil',
                  onTap: () => Navigator.pop(context),
                ),

          const Divider(),

          // Section Contenu
          _buildSectionTitle(context, 'Contenu'),
          _buildMenuItem(
            context,
            icon: Icons.article,
            title: 'Articles',
            onTap: () {
              Navigator.pop(context);
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const ArticleListScreen(),
                ),
              );
            },
          ),
          _buildMenuItem(
            context,
            icon: Icons.library_books,
            title: 'Reportages',
            onTap: () {
              Navigator.pop(context);
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const ReportageListScreen(),
                ),
              );
            },
          ),
          _buildMenuItem(
            context,
            icon: Icons.mic,
            title: 'Interviews',
            onTap: () {
              Navigator.pop(context);
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const InterviewListScreen(),
                ),
              );
            },
          ),
          _buildMenuItem(
            context,
            icon: Icons.video_library,
            title: 'Vidéos',
            onTap: () {
              Navigator.pop(context);
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const MediaScreen(),
                ),
              );
            },
          ),

          const Divider(),

          // Section Communauté
          _buildSectionTitle(context, 'Communauté'),
          _buildMenuItem(
            context,
            icon: Icons.forum,
            title: 'Forum',
            onTap: () {
              Navigator.pop(context);
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const ForumCategoriesScreen(),
                ),
              );
            },
          ),
          _buildMenuItem(
            context,
            icon: Icons.rate_review,
            title: 'Témoignages',
            onTap: () {
              Navigator.pop(context);
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const TestimonyListScreen(),
                ),
              );
            },
          ),

          const Divider(),

          // Section Services
          _buildSectionTitle(context, 'Compte'),
          _buildMenuItem(
            context,
            icon: Icons.person,
            title: 'Mon profil',
            onTap: () {
              Navigator.pop(context);
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const ProfileScreen(),
                ),
              );
            },
          ),

          const Divider(),

          // Section Services
          _buildSectionTitle(context, 'Services'),
          _buildMenuItem(
            context,
            icon: Icons.sports_soccer,
            title: 'Sport Live',
            onTap: () {
              Navigator.pop(context);
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const SportScreen(),
                ),
              );
            },
          ),
          _buildMenuItem(
            context,
            icon: Icons.local_pharmacy,
            title: 'Pharmacies de garde',
            onTap: () {
              Navigator.pop(context);
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const PharmaciesScreen(),
                ),
              );
            },
          ),
          _buildMenuItem(
            context,
            icon: Icons.event,
            title: 'Événements',
            onTap: () {
              Navigator.pop(context);
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const EventsScreen(),
                ),
              );
            },
          ),
          _buildMenuItem(
            context,
            icon: Icons.campaign,
            title: 'Annonces',
            onTap: () {
              Navigator.pop(context);
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const AnnouncementsScreen(),
                ),
              );
            },
          ),

          const Divider(),

          // Section Paramètres
          _buildMenuItem(
            context,
            icon: Icons.brightness_6,
            title: 'Thème',
            onTap: () {
              final themeService = Provider.of<ThemeService>(context, listen: false);
              themeService.toggleTheme();
            },
          ),
          _buildMenuItem(
            context,
            icon: Icons.settings,
            title: 'Paramètres',
            onTap: () {
              Navigator.pop(context);
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const SettingsScreen(),
                ),
              );
            },
          ),
          _buildMenuItem(
            context,
            icon: Icons.info,
            title: 'À propos',
            onTap: () {
              Navigator.pop(context);
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const AboutScreen(),
                ),
              );
            },
          ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(BuildContext context, String title) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Padding(
      padding: const EdgeInsets.fromLTRB(
        AppSpacing.paddingScreen,
        AppSpacing.md,
        AppSpacing.paddingScreen,
        AppSpacing.sm,
      ),
      child: Text(
        title.toUpperCase(),
        style: AppTextStyles.caption.copyWith(
          fontWeight: FontWeight.bold,
          letterSpacing: 1.2,
          color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
        ),
      ),
    );
  }

  Widget _buildMenuItem(
    BuildContext context, {
    required IconData icon,
    required String title,
    required VoidCallback onTap,
  }) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return ListTile(
      leading: Icon(icon, color: AppColors.primary),
      title: Text(
        title,
        style: AppTextStyles.bodyMedium.copyWith(
          fontWeight: FontWeight.w500,
          color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
        ),
      ),
      trailing: Icon(
        Icons.chevron_right,
        color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
      ),
      onTap: onTap,
    );
  }
}

