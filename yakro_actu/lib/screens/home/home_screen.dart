import 'package:flutter/material.dart';
import 'dart:async';
import 'package:cached_network_image/cached_network_image.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_spacing.dart';
import '../../theme/app_text_styles.dart';
import '../../models/article.dart';
import '../../models/reportage.dart';
import '../../models/sport.dart';
import '../../services/api/article_service.dart';
import '../../services/api/reportage_service.dart';
import '../../services/api/sport_service.dart';
import '../../widgets/common_widgets.dart';
import '../article/article_detail_screen.dart';
import '../articles/article_list_screen.dart';
import '../media/media_screen.dart';
import '../media/videos_screen.dart';
import '../media/video_player_screen.dart';
import '../reportage/reportage_detail_screen.dart';
import '../about_screen.dart';
import '../search_screen.dart';
import '../notifications_screen.dart';
import '../pharmacy/pharmacies_screen.dart';
import '../events/events_screen.dart';
import '../announcements/announcements_screen.dart';
import '../../services/mock/mock_data_service.dart';
import 'home_drawer.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0;
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  
  final ArticleService _articleService = ArticleService();
  final ReportageService _reportageService = ReportageService();
  final SportService _sportService = SportService();

  // Données pour la page d'accueil
  List<Article> _featuredArticles = [];
  List<Article> _breakingNews = [];
  List<Article> _allArticles = [];
  Map<String, List<Article>> _articlesByCategory = {};
  List<Article> _sportArticles = [];
  List<Article> _diversArticles = [];
  List<Reportage> _latestReportages = [];
  List<SportMatch> _liveMatches = [];
  List<dynamic> _banners = [];
  List<dynamic> _videos = [];
  List<dynamic> _pharmacies = [];
  List<dynamic> _events = [];
  List<Map<String, dynamic>> _flashInfos = [];
  
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadHomeData();
  }

  Future<void> _loadHomeData() async {
    setState(() => _isLoading = true);
    
    // Simulate API delay
    await Future.delayed(const Duration(milliseconds: 1000));
    
    // Load mock data
    final mockArticles = MockDataService.getMockArticles();
    final mockReportages = MockDataService.getMockReportages();
    final mockMatches = MockDataService.getMockLiveMatches();
    final mockFlashInfos = MockDataService.getMockFlashInfo();
    
    setState(() {
      // All articles
      _allArticles = mockArticles;
      
      // Featured articles (articles à la une)
      _featuredArticles = mockArticles.where((a) => a.isFeatured == true).toList();
      
      // Breaking news
      _breakingNews = mockArticles.where((a) => a.isBreaking == true).toList();
      
      // Articles by category
      for (var article in mockArticles) {
        final categorySlug = article.categoryName?.toLowerCase() ?? '';
        if (!_articlesByCategory.containsKey(categorySlug)) {
          _articlesByCategory[categorySlug] = [];
        }
        _articlesByCategory[categorySlug]!.add(article);
      }
      
      // Sport articles
      _sportArticles = mockArticles.where((a) => a.categoryName == 'Sport').toList();
      
      // Faits divers articles
      _diversArticles = mockArticles.where((a) => a.categoryName == 'Faits Divers').toList();
      
      // Reportages
      _latestReportages = mockReportages;
      
      // Live matches
      _liveMatches = mockMatches;
      
      // Flash infos
      _flashInfos = mockFlashInfos;
      
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      key: _scaffoldKey,
      drawer: const HomeDrawer(),
      body: _buildCurrentTab(),
      bottomNavigationBar: _buildBottomNav(),
    );
  }

  Widget _buildCurrentTab() {
    switch (_selectedIndex) {
      case 0:
        return _buildHomeTab();
      case 1:
        return _buildArticlesTab();
      case 2:
        return const MediaScreen();
      case 3:
        return const AboutScreen();
      default:
        return _buildHomeTab();
    }
  }

  Widget _buildBottomNav() {
    return BottomNavigationBar(
      currentIndex: _selectedIndex,
      onTap: (index) => setState(() => _selectedIndex = index),
      type: BottomNavigationBarType.fixed,
      selectedItemColor: AppColors.primary,
      unselectedItemColor: AppColors.textSecondary,
      items: const [
        BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Accueil'),
        BottomNavigationBarItem(icon: Icon(Icons.article), label: 'Articles'),
        BottomNavigationBarItem(icon: Icon(Icons.videocam), label: 'Vidéos'),
        BottomNavigationBarItem(icon: Icon(Icons.info), label: 'À propos'),
      ],
    );
  }

  // ==================== PAGE D'ACCUEIL ====================
  Widget _buildHomeTab() {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    return RefreshIndicator(
      onRefresh: _loadHomeData,
      child: CustomScrollView(
        slivers: [
          _buildModernAppBar(),
          // 1. Section À la Une
          _buildALaUneSection(),
          // 1b. Tous les articles (8 articles minimum)
          _buildTousLesArticlesSection(),
          // 2. Catégories
          _buildQuickCategories(),
          // 3. Bannière Slider
          _buildBannerSlider(),
          // 4. Actualités (1 principal + 4 articles)
          _buildActualitesSection(),
          // 5. Flash Infos / Breaking News (liste de 5)
          _buildFlashInfosList(),
          // 6. Vidéos (vidéo principale + différents types)
          _buildVideosSection(),
          // 7. Actualités Sportives (1 principal + 3 articles + matchs en cours)
          _buildSportSection(),
          // 8. Pharmacies de garde
          _buildPharmaciesSection(),
          // 9. Événements
          _buildEventsSection(),
          // 10. Section Culture
          _buildCultureSection(),
          // 11. Espace publicitaire
          _buildPubliciteSection(),
          // 12. Météo
          _buildMeteoSection(),
          // 13. Titrologie
          _buildTitrologieSection(),
          // 14. Faits divers
          _buildFaitsDiversSection(),
        ],
      ),
    );
  }

  // AppBar moderne minimaliste
  Widget _buildModernAppBar() {
    return SliverAppBar(
      pinned: true,
      floating: false,
      snap: false,
      elevation: 0,
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      expandedHeight: _flashInfos.isNotEmpty ? 100 : 56,
      leading: IconButton(
        icon: Icon(Icons.menu, color: Theme.of(context).iconTheme.color),
        onPressed: () => _scaffoldKey.currentState?.openDrawer(),
      ),
      title: Text(
        'Yakro Actu',
        style: AppTextStyles.h5.copyWith(
          fontWeight: FontWeight.bold,
          color: AppColors.primary,
        ),
      ),
      actions: [
        IconButton(
          icon: Icon(Icons.search, color: Theme.of(context).iconTheme.color),
          onPressed: () {
            Navigator.push(
              context,
              MaterialPageRoute(builder: (context) => const SearchScreen()),
            );
          },
        ),
        IconButton(
          icon: Icon(Icons.notifications_outlined, color: Theme.of(context).iconTheme.color),
          onPressed: () {
            Navigator.push(
              context,
              MaterialPageRoute(builder: (context) => const NotificationsScreen()),
            );
          },
        ),
      ],
      flexibleSpace: FlexibleSpaceBar(
        background: Column(
          mainAxisAlignment: MainAxisAlignment.end,
          children: [
            if (_flashInfos.isNotEmpty)
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 8),
                child: _buildFlashInfoTicker(),
              ),
          ],
        ),
      ),
    );
  }

  // Widget Flash Info qui défile horizontalement
  Widget _buildFlashInfoTicker() {
    return Container(
      height: 32,
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: AppColors.error,
              borderRadius: BorderRadius.circular(4),
            ),
            child: Row(
              children: [
                Icon(Icons.flash_on, size: 14, color: Colors.white),
                const SizedBox(width: 4),
                Text(
                  'FLASH',
                  style: AppTextStyles.caption.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 10,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: _FlashInfoScrollingText(flashInfos: _flashInfos),
          ),
        ],
      ),
    );
  }

  // ==================== SECTIONS DE LA PAGE D'ACCUEIL ====================

  // 1. Section À la Une (1 article principal + 3 thumbnails)
  Widget _buildALaUneSection() {
    // Si pas d'articles, afficher un placeholder
    if (_featuredArticles.isEmpty) {
      return SliverToBoxAdapter(
        child: Container(
          margin: const EdgeInsets.all(AppSpacing.paddingScreen),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Icon(Icons.stars, color: AppColors.primary, size: 24),
                  const SizedBox(width: 8),
                  Text('À la Une', style: AppTextStyles.h5),
                ],
              ),
              const SizedBox(height: AppSpacing.md),
              Container(
                height: 280,
                decoration: BoxDecoration(
                  color: AppColors.surfaceVariant,
                  borderRadius: BorderRadius.circular(AppSpacing.radiusLarge),
                ),
                child: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.article, size: 64, color: AppColors.textSecondary),
                      const SizedBox(height: 8),
                      Text(
                        'Aucun article à la une',
                        style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      );
    }
    
    final mainArticle = _featuredArticles.first;
    final thumbnails = _featuredArticles.skip(1).take(3).toList();

    return SliverToBoxAdapter(
      child: Container(
        margin: const EdgeInsets.all(AppSpacing.paddingScreen),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.stars, color: AppColors.primary, size: 24),
                const SizedBox(width: 8),
                Text('À la Une', style: AppTextStyles.h5),
              ],
            ),
            const SizedBox(height: AppSpacing.md),
            // Article principal
            InkWell(
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => ArticleDetailScreen(article: mainArticle),
                  ),
                );
              },
              child: Container(
                height: 280,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(AppSpacing.radiusLarge),
                ),
                child: Stack(
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(AppSpacing.radiusLarge),
                      child: Image.network(
                        mainArticle.coverImage,
                        width: double.infinity,
                        height: 280,
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) {
                          return Container(
                            color: AppColors.surfaceVariant,
                            child: const Icon(Icons.image, size: 64),
                          );
                        },
                      ),
                    ),
                    Container(
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(AppSpacing.radiusLarge),
                        gradient: LinearGradient(
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          colors: [
                            Colors.transparent,
                            Colors.black.withOpacity(0.8),
                          ],
                        ),
                      ),
                    ),
                    Positioned(
                      left: 16,
                      right: 16,
                      bottom: 16,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          if (mainArticle.categoryName != null)
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                              decoration: BoxDecoration(
                                color: AppColors.primary,
                                borderRadius: BorderRadius.circular(AppSpacing.radiusSmall),
                              ),
                              child: Text(
                                mainArticle.categoryName!.toUpperCase(),
                                style: AppTextStyles.badge.copyWith(color: Colors.white),
                              ),
                            ),
                          const SizedBox(height: 8),
                          Text(
                            mainArticle.title,
                            style: AppTextStyles.h5.copyWith(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                            ),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 8),
                          Text(
                            _formatTimeAgo(mainArticle.publishedAt),
                            style: AppTextStyles.caption.copyWith(color: Colors.white70),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: AppSpacing.md),
            // 3 thumbnails
            Row(
              children: thumbnails.map((article) {
                return Expanded(
                  child: Container(
                    margin: const EdgeInsets.only(right: 8),
                    child: InkWell(
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => ArticleDetailScreen(article: article),
                          ),
                        );
                      },
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          ClipRRect(
                            borderRadius: BorderRadius.circular(AppSpacing.radiusSmall),
                            child: Image.network(
                              article.coverImage,
                              height: 80,
                              width: double.infinity,
                              fit: BoxFit.cover,
                              errorBuilder: (context, error, stackTrace) {
                                return Container(
                                  height: 80,
                                  color: AppColors.surfaceVariant,
                                  child: const Icon(Icons.image, size: 24),
                                );
                              },
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            article.title,
                            style: AppTextStyles.caption.copyWith(fontWeight: FontWeight.w600),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
          ],
        ),
      ),
    );
  }

  // 1b. Section Tous les Articles (8 articles minimum)
  Widget _buildTousLesArticlesSection() {
    return SliverToBoxAdapter(
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: AppSpacing.paddingScreen, vertical: AppSpacing.sm),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.article, color: AppColors.primary, size: 20),
                const SizedBox(width: 6),
                Text('Tous les articles', style: AppTextStyles.h6),
                const Spacer(),
                TextButton(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const ArticleListScreen()),
                    );
                  },
                  style: TextButton.styleFrom(
                    padding: EdgeInsets.zero,
                    minimumSize: const Size(50, 30),
                    tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  ),
                  child: const Text('Voir tout', style: TextStyle(fontSize: 12)),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.sm),
            if (_allArticles.isEmpty)
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.surfaceVariant,
                  borderRadius: BorderRadius.circular(AppSpacing.radiusSmall),
                ),
                child: Center(
                  child: Text(
                    'Aucun article disponible',
                    style: AppTextStyles.bodySmall.copyWith(color: AppColors.textSecondary),
                  ),
                ),
              )
            else
              GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  childAspectRatio: 1.0,
                  crossAxisSpacing: 8,
                  mainAxisSpacing: 8,
                ),
                itemCount: _allArticles.length > 8 ? 8 : _allArticles.length,
                itemBuilder: (context, index) {
                  final article = _allArticles[index];
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
                      decoration: BoxDecoration(
                        color: AppColors.surfaceVariant.withOpacity(0.3),
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(
                          color: AppColors.surfaceVariant.withOpacity(0.5),
                          width: 0.5,
                        ),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Stack(
                            children: [
                              ClipRRect(
                                borderRadius: const BorderRadius.vertical(
                                  top: Radius.circular(6),
                                ),
                                child: Image.network(
                                  article.coverImage,
                                  height: 90,
                                  width: double.infinity,
                                  fit: BoxFit.cover,
                                  errorBuilder: (context, error, stackTrace) {
                                    return Container(
                                      height: 90,
                                      color: AppColors.surfaceVariant,
                                      child: const Icon(Icons.image, size: 28),
                                    );
                                  },
                                ),
                              ),
                              // Badge Yakro Actu
                              Positioned(
                                top: 4,
                                left: 4,
                                child: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: AppColors.primary.withOpacity(0.92),
                                    borderRadius: BorderRadius.circular(3),
                                  ),
                                  child: Text(
                                    'Yakro Actu',
                                    style: AppTextStyles.caption.copyWith(
                                      fontSize: 7,
                                      color: Colors.white,
                                      fontWeight: FontWeight.bold,
                                      letterSpacing: 0.2,
                                    ),
                                  ),
                                ),
                              ),
                              // Bouton partager
                              Positioned(
                                top: 4,
                                right: 4,
                                child: InkWell(
                                  onTap: () => _shareArticle(article),
                                  child: Container(
                                    padding: const EdgeInsets.all(3),
                                    decoration: BoxDecoration(
                                      color: Colors.white.withOpacity(0.92),
                                      borderRadius: BorderRadius.circular(3),
                                    ),
                                    child: Icon(
                                      Icons.share,
                                      size: 12,
                                      color: AppColors.primary,
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                          Padding(
                            padding: const EdgeInsets.fromLTRB(6, 5, 6, 5),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                if (article.categoryName != null) ...[
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1.5),
                                    decoration: BoxDecoration(
                                      color: AppColors.getCategoryColor(article.categoryName!.toLowerCase()).withOpacity(0.15),
                                      borderRadius: BorderRadius.circular(2.5),
                                    ),
                                    child: Text(
                                      article.categoryName!,
                                      style: AppTextStyles.caption.copyWith(
                                        fontSize: 7.5,
                                        color: AppColors.getCategoryColor(article.categoryName!.toLowerCase()),
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                  ),
                                  const SizedBox(height: 3),
                                ],
                                Text(
                                  article.title,
                                  style: AppTextStyles.caption.copyWith(
                                    fontWeight: FontWeight.w600,
                                    fontSize: 10,
                                    height: 1.1,
                                  ),
                                  maxLines: 2,
                                  overflow: TextOverflow.ellipsis,
                                ),
                                const SizedBox(height: 3),
                                Row(
                                  children: [
                                    Icon(Icons.access_time, size: 8, color: AppColors.textSecondary),
                                    const SizedBox(width: 2),
                                    Text(
                                      _formatTimeAgo(article.publishedAt),
                                      style: AppTextStyles.caption.copyWith(
                                        fontSize: 7,
                                        color: AppColors.textSecondary,
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
          ],
        ),
      ),
    );
  }

  // 2. Catégories
  Widget _buildQuickCategories() {
    final categories = [
      {'name': 'Politique', 'icon': Icons.account_balance, 'slug': 'politique'},
      {'name': 'Économie', 'icon': Icons.trending_up, 'slug': 'economie'},
      {'name': 'Sport', 'icon': Icons.sports_soccer, 'slug': 'sport'},
      {'name': 'Culture', 'icon': Icons.palette, 'slug': 'culture'},
      {'name': 'Santé', 'icon': Icons.health_and_safety, 'slug': 'sante'},
      {'name': 'Tech', 'icon': Icons.computer, 'slug': 'technologie'},
    ];

    return SliverToBoxAdapter(
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: AppSpacing.md),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.paddingScreen),
              child: Text('Catégories', style: AppTextStyles.h6),
            ),
            const SizedBox(height: AppSpacing.md),
            SizedBox(
              height: 100,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.paddingScreen),
                itemCount: categories.length,
                itemBuilder: (context, index) {
                  final cat = categories[index];
                  final categorySlug = cat['slug'] as String;
                  final categoryColor = AppColors.getCategoryColor(categorySlug);
                  
                  return Container(
                    width: 80,
                    margin: const EdgeInsets.only(right: 12),
                    child: InkWell(
                      onTap: () {},
                      child: Column(
                        children: [
                          Container(
                            width: 64,
                            height: 64,
                            decoration: BoxDecoration(
                              color: categoryColor.withOpacity(0.15),
                              borderRadius: BorderRadius.circular(AppSpacing.radiusMedium),
                            ),
                            child: Icon(cat['icon'] as IconData, color: categoryColor, size: 32),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            cat['name'] as String,
                            style: AppTextStyles.caption,
                            textAlign: TextAlign.center,
                            maxLines: 1,
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  // 3. Bannière Slider
  Widget _buildBannerSlider() {
    return SliverToBoxAdapter(
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: AppSpacing.md),
        height: 160,
        child: PageView.builder(
          itemCount: 3,
          itemBuilder: (context, index) {
            return Container(
              margin: const EdgeInsets.symmetric(horizontal: AppSpacing.paddingScreen),
              decoration: BoxDecoration(
                gradient: AppColors.primaryGradient,
                borderRadius: BorderRadius.circular(AppSpacing.radiusMedium),
              ),
              child: Center(
                child: Text(
                  'Bannière ${index + 1}',
                  style: AppTextStyles.h5.copyWith(color: Colors.white),
                ),
              ),
            );
          },
        ),
      ),
    );
  }

  // 4. Actualités (1 principal + 4 articles)
  Widget _buildActualitesSection() {
    final articles = _articlesByCategory['politique'] ?? [];
    
    return SliverToBoxAdapter(
      child: Container(
        margin: const EdgeInsets.all(AppSpacing.paddingScreen),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.newspaper, color: AppColors.primary, size: 24),
                const SizedBox(width: 8),
                Text('Actualités', style: AppTextStyles.h5),
                const Spacer(),
                TextButton(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const ArticleListScreen()),
                    );
                  },
                  child: const Text('Voir tout'),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),
            if (articles.isEmpty)
              Container(
                height: 150,
                decoration: BoxDecoration(
                  color: AppColors.surfaceVariant,
                  borderRadius: BorderRadius.circular(AppSpacing.radiusMedium),
                ),
                child: Center(
                  child: Text(
                    'Aucune actualité pour le moment',
                    style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary),
                  ),
                ),
              ),
            if (articles.isNotEmpty) ...[
              _buildMainArticleCard(articles.first),
              const SizedBox(height: AppSpacing.md),
              ...articles.skip(1).take(4).map((article) => _buildSmallArticleCard(article)),
            ],
          ],
        ),
      ),
    );
  }

  // 5. Flash Infos / Breaking News (liste de 5)
  Widget _buildFlashInfosList() {
    return SliverToBoxAdapter(
      child: Container(
        margin: const EdgeInsets.all(AppSpacing.paddingScreen),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.flash_on, color: AppColors.breaking, size: 24),
                const SizedBox(width: 8),
                Text('Flash Infos', style: AppTextStyles.h5),
                const Spacer(),
                TextButton(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => ArticleListScreen(
                          categoryName: 'Flash',
                          showOnlyBreaking: true,
                        ),
                      ),
                    );
                  },
                  child: const Text('Voir plus'),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),
            if (_breakingNews.isEmpty)
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.breaking.withOpacity(0.05),
                  borderRadius: BorderRadius.circular(AppSpacing.radiusSmall),
                  border: Border.all(color: AppColors.breaking.withOpacity(0.2)),
                ),
                child: Center(
                  child: Text(
                    'Aucun flash info pour le moment',
                    style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary),
                  ),
                ),
              )
            else
              ...List.generate(
              _breakingNews.length > 5 ? 5 : _breakingNews.length,
              (index) {
                final article = _breakingNews[index];
                return Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.breaking.withOpacity(0.05),
                    borderRadius: BorderRadius.circular(AppSpacing.radiusSmall),
                    border: Border.all(color: AppColors.breaking.withOpacity(0.2)),
                  ),
                  child: InkWell(
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => ArticleDetailScreen(article: article),
                        ),
                      );
                    },
                    child: Row(
                      children: [
                        Icon(Icons.bolt, color: AppColors.breaking, size: 16),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            article.title,
                            style: AppTextStyles.bodySmall.copyWith(fontWeight: FontWeight.w600),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          _formatTimeAgo(article.publishedAt),
                          style: AppTextStyles.caption.copyWith(color: AppColors.breaking),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  // 6. Vidéos (vidéo principale + types de vidéos)
  Widget _buildVideosSection() {
    final videos = MockDataService.getMockVideos();
    
    return SliverToBoxAdapter(
      child: Container(
        margin: const EdgeInsets.all(AppSpacing.paddingScreen),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.play_circle, color: AppColors.videoColor, size: 24),
                const SizedBox(width: 8),
                Text('Vidéos', style: AppTextStyles.h5),
                const Spacer(),
                TextButton(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const VideosScreen()),
                    );
                  },
                  child: const Text('Voir tout'),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),
            
            // Vidéo principale (première vidéo)
            if (videos.isNotEmpty) ...[
              _buildMainVideoCard(videos.first),
              const SizedBox(height: AppSpacing.md),
            ],
            
            // Liste horizontale des autres vidéos (compacte)
            if (videos.length > 1) ...[
              Row(
                children: [
                  Expanded(
                    child: SizedBox(
                      height: 120,
                      child: ListView.builder(
                        scrollDirection: Axis.horizontal,
                        itemCount: videos.length > 10 ? 10 : videos.length - 1,
                        itemBuilder: (context, index) {
                          final video = videos[index + 1];
                          return _buildCompactVideoCard(video);
                        },
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildMainVideoCard(dynamic video) {
    return InkWell(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => VideoPlayerScreen(video: video),
          ),
        );
      },
      child: Container(
        height: 200,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(AppSpacing.radiusMedium),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.1),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Stack(
          children: [
            // Image de fond
            ClipRRect(
              borderRadius: BorderRadius.circular(AppSpacing.radiusMedium),
              child: CachedNetworkImage(
                imageUrl: video.thumbnailUrl,
                width: double.infinity,
                height: double.infinity,
                fit: BoxFit.cover,
                placeholder: (context, url) => Container(
                  color: Colors.grey[300],
                ),
                errorWidget: (context, url, error) => Container(
                  color: Colors.grey[300],
                  child: const Icon(Icons.error),
                ),
              ),
            ),
            
            // Gradient overlay
            Container(
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(AppSpacing.radiusMedium),
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Colors.transparent,
                    Colors.black.withOpacity(0.8),
                  ],
                ),
              ),
            ),
            
            // Play button au centre
            Center(
              child: Container(
                width: 64,
                height: 64,
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.9),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  Icons.play_arrow,
                  size: 40,
                  color: AppColors.videoColor,
                ),
              ),
            ),
            
            // Informations en bas
            Positioned(
              bottom: 12,
              left: 12,
              right: 12,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Badge type
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.videoColor,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      video.type == 'article' ? 'ARTICLE' : video.type == 'reportage' ? 'REPORTAGE' : 'INTERVIEW',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
                  
                  // Titre
                  Text(
                    video.title,
                    style: AppTextStyles.bodyMedium.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  
                  // Stats
                  Row(
                    children: [
                      Icon(Icons.remove_red_eye, size: 12, color: Colors.white70),
                      const SizedBox(width: 4),
                      Text(
                        _formatVideoViews(video.viewCount),
                        style: const TextStyle(color: Colors.white70, fontSize: 11),
                      ),
                      const SizedBox(width: 12),
                      Icon(Icons.access_time, size: 12, color: Colors.white70),
                      const SizedBox(width: 4),
                      Text(
                        video.duration,
                        style: const TextStyle(color: Colors.white70, fontSize: 11),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSmallVideoCard(dynamic video) {
    return Container(
      width: 200,
      margin: const EdgeInsets.only(right: 12),
      child: InkWell(
        onTap: () {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Lecture: ${video.title}'),
              duration: const Duration(seconds: 2),
            ),
          );
        },
        borderRadius: BorderRadius.circular(8),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Thumbnail
            Stack(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: AspectRatio(
                    aspectRatio: 16 / 9,
                    child: CachedNetworkImage(
                      imageUrl: video.thumbnailUrl,
                      fit: BoxFit.cover,
                      placeholder: (context, url) => Container(
                        color: Colors.grey[300],
                      ),
                      errorWidget: (context, url, error) => Container(
                        color: Colors.grey[300],
                        child: const Icon(Icons.error, size: 20),
                      ),
                    ),
                  ),
                ),
                
                // Overlay
                Positioned.fill(
                  child: Container(
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(8),
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          Colors.transparent,
                          Colors.black.withOpacity(0.5),
                        ],
                      ),
                    ),
                  ),
                ),
                
                // Play icon
                Positioned.fill(
                  child: Center(
                    child: Container(
                      width: 32,
                      height: 32,
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.9),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        Icons.play_arrow,
                        size: 20,
                        color: AppColors.videoColor,
                      ),
                    ),
                  ),
                ),
                
                // Durée
                Positioned(
                  bottom: 4,
                  right: 4,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                    decoration: BoxDecoration(
                      color: Colors.black.withOpacity(0.8),
                      borderRadius: BorderRadius.circular(3),
                    ),
                    child: Text(
                      video.duration,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 9,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 6),
            
            // Titre
            Text(
              video.title,
              style: AppTextStyles.caption.copyWith(
                fontWeight: FontWeight.w600,
                fontSize: 11,
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 4),
            
            // Vues
            Row(
              children: [
                Icon(Icons.remove_red_eye, size: 10, color: AppColors.textSecondary),
                const SizedBox(width: 3),
                Text(
                  _formatVideoViews(video.viewCount),
                  style: TextStyle(
                    color: AppColors.textSecondary,
                    fontSize: 9,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCompactVideoCard(dynamic video) {
    return Container(
      width: 140,
      margin: const EdgeInsets.only(right: 8),
      child: InkWell(
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => VideoPlayerScreen(video: video),
            ),
          );
        },
        borderRadius: BorderRadius.circular(6),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Thumbnail compact
            Stack(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(6),
                  child: AspectRatio(
                    aspectRatio: 16 / 9,
                    child: CachedNetworkImage(
                      imageUrl: video.thumbnailUrl,
                      fit: BoxFit.cover,
                      placeholder: (context, url) => Container(
                        color: Colors.grey[300],
                      ),
                      errorWidget: (context, url, error) => Container(
                        color: Colors.grey[300],
                        child: const Icon(Icons.error, size: 16),
                      ),
                    ),
                  ),
                ),
                
                // Overlay léger
                Positioned.fill(
                  child: Container(
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(6),
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          Colors.transparent,
                          Colors.black.withOpacity(0.4),
                        ],
                      ),
                    ),
                  ),
                ),
                
                // Play icon plus petit
                Positioned.fill(
                  child: Center(
                    child: Container(
                      width: 28,
                      height: 28,
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.95),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        Icons.play_arrow,
                        size: 18,
                        color: AppColors.videoColor,
                      ),
                    ),
                  ),
                ),
                
                // Durée
                Positioned(
                  bottom: 3,
                  right: 3,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 3, vertical: 1),
                    decoration: BoxDecoration(
                      color: Colors.black.withOpacity(0.8),
                      borderRadius: BorderRadius.circular(2),
                    ),
                    child: Text(
                      video.duration,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 8,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 4),
            
            // Titre compact
            Text(
              video.title,
              style: const TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.w600,
                height: 1.2,
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 2),
            
            // Vues compact
            Row(
              children: [
                Icon(Icons.remove_red_eye, size: 9, color: AppColors.textSecondary),
                const SizedBox(width: 2),
                Text(
                  _formatVideoViews(video.viewCount),
                  style: TextStyle(
                    color: AppColors.textSecondary,
                    fontSize: 8,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  String _formatVideoViews(int count) {
    if (count >= 1000000) {
      return '${(count / 1000000).toStringAsFixed(1)}M';
    } else if (count >= 1000) {
      return '${(count / 1000).toStringAsFixed(1)}k';
    }
    return count.toString();
  }

  // 7. Actualités Sportives
  Widget _buildSportSection() {
    final articles = _sportArticles;
    
    return SliverToBoxAdapter(
      child: Container(
        margin: const EdgeInsets.all(AppSpacing.paddingScreen),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.sports_soccer, color: AppColors.getCategoryColor('sport'), size: 24),
                const SizedBox(width: 8),
                Text('Sport', style: AppTextStyles.h5),
                const Spacer(),
                TextButton(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const ArticleListScreen(category: 'sport')),
                    );
                  },
                  child: const Text('Voir tout'),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),
            if (articles.isEmpty)
              Container(
                height: 150,
                decoration: BoxDecoration(
                  color: AppColors.surfaceVariant,
                  borderRadius: BorderRadius.circular(AppSpacing.radiusMedium),
                ),
                child: Center(
                  child: Text(
                    'Aucune actualité sportive',
                    style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary),
                  ),
                ),
              ),
            if (articles.isNotEmpty) ...[
              _buildMainArticleCard(articles.first, categoryColor: AppColors.getCategoryColor('sport')),
              const SizedBox(height: AppSpacing.md),
              ...articles.skip(1).take(3).map((article) => _buildSmallArticleCard(article, categoryColor: AppColors.getCategoryColor('sport'))),
              const SizedBox(height: AppSpacing.md),
            ],
            // Matchs en cours
            if (_liveMatches.isNotEmpty) ...[
              Text('Matchs en cours', style: AppTextStyles.h6),
              const SizedBox(height: 8),
              ..._liveMatches.map((match) {
                return Container(
                  margin: const EdgeInsets.only(bottom: 8),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.live.withOpacity(0.05),
                    borderRadius: BorderRadius.circular(AppSpacing.radiusSmall),
                    border: Border.all(color: AppColors.live.withOpacity(0.3)),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(child: Text(match.homeTeam, textAlign: TextAlign.center)),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppColors.live,
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          '${match.homeScore} - ${match.awayScore}',
                          style: AppTextStyles.bodySmall.copyWith(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      Expanded(child: Text(match.awayTeam, textAlign: TextAlign.center)),
                    ],
                  ),
                );
              }),
            ],
          ],
        ),
      ),
    );
  }

  // 8. Pharmacies de garde
  Widget _buildPharmaciesSection() {
    return SliverToBoxAdapter(
      child: Container(
        margin: const EdgeInsets.all(AppSpacing.paddingScreen),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.local_pharmacy, color: AppColors.pharmacieColor, size: 24),
                const SizedBox(width: 8),
                Text('Pharmacies de garde', style: AppTextStyles.h5),
                const Spacer(),
                TextButton(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => const PharmaciesScreen(),
                      ),
                    );
                  },
                  child: const Text('Voir tout'),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),
            ...List.generate(3, (index) {
              return Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.surfaceVariant,
                  borderRadius: BorderRadius.circular(AppSpacing.radiusSmall),
                ),
                child: Row(
                  children: [
                    Icon(Icons.local_pharmacy, color: AppColors.pharmacieColor),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Pharmacie ${index + 1}',
                            style: AppTextStyles.bodyMedium.copyWith(fontWeight: FontWeight.w600),
                          ),
                          Text('Adresse de la pharmacie', style: AppTextStyles.caption),
                        ],
                      ),
                    ),
                    Icon(Icons.phone, color: AppColors.pharmacieColor),
                  ],
                ),
              );
            }),
          ],
        ),
      ),
    );
  }

  // 9. Événements
  Widget _buildEventsSection() {
    return SliverToBoxAdapter(
      child: Container(
        margin: const EdgeInsets.all(AppSpacing.paddingScreen),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.event, color: AppColors.eventColor, size: 24),
                const SizedBox(width: 8),
                Text('Événements', style: AppTextStyles.h5),
                const Spacer(),
                TextButton(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => const EventsScreen(),
                      ),
                    );
                  },
                  child: const Text('Voir tout'),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),
            SizedBox(
              height: 180,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                itemCount: 4,
                itemBuilder: (context, index) {
                  return Container(
                    width: 280,
                    margin: const EdgeInsets.only(right: 12),
                    decoration: BoxDecoration(
                      color: AppColors.surfaceVariant,
                      borderRadius: BorderRadius.circular(AppSpacing.radiusMedium),
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(12),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  color: AppColors.primary.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Column(
                                  children: [
                                    Text('${10 + index}', style: AppTextStyles.h6),
                                    Text('DÉC', style: AppTextStyles.caption),
                                  ],
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'Événement ${index + 1}',
                                      style: AppTextStyles.bodyMedium.copyWith(fontWeight: FontWeight.w600),
                                      maxLines: 2,
                                    ),
                                    Text('Lieu de l\'événement', style: AppTextStyles.caption),
                                  ],
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'Description de l\'événement à venir dans la ville...',
                            style: AppTextStyles.caption,
                            maxLines: 3,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  // 10. Section Culture
  Widget _buildCultureSection() {
    final articles = _articlesByCategory['culture'] ?? [];
    if (articles.isEmpty) return const SliverToBoxAdapter();

    return SliverToBoxAdapter(
      child: Container(
        margin: const EdgeInsets.all(AppSpacing.paddingScreen),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.palette, color: AppColors.getCategoryColor('culture'), size: 24),
                const SizedBox(width: 8),
                Text('Culture', style: AppTextStyles.h5),
                const Spacer(),
                TextButton(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => ArticleListScreen(
                          categoryName: 'Culture',
                        ),
                      ),
                    );
                  },
                  child: const Text('Voir tout'),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),
            ...articles.take(3).map((article) => _buildSmallArticleCard(article, categoryColor: AppColors.getCategoryColor('culture'))),
          ],
        ),
      ),
    );
  }

  // 11. Espace publicitaire
  Widget _buildPubliciteSection() {
    return SliverToBoxAdapter(
      child: Container(
        margin: const EdgeInsets.all(AppSpacing.paddingScreen),
        height: 120,
        decoration: BoxDecoration(
          color: AppColors.surfaceVariant,
          borderRadius: BorderRadius.circular(AppSpacing.radiusMedium),
        ),
        child: Center(
          child: Text(
            'Espace Publicitaire',
            style: AppTextStyles.h6.copyWith(color: AppColors.textSecondary),
          ),
        ),
      ),
    );
  }

  // 12. Météo
  Widget _buildMeteoSection() {
    return SliverToBoxAdapter(
      child: Container(
        margin: const EdgeInsets.all(AppSpacing.paddingScreen),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [Colors.blue.shade300, Colors.blue.shade500],
          ),
          borderRadius: BorderRadius.circular(AppSpacing.radiusMedium),
        ),
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Yamoussoukro',
                      style: AppTextStyles.h5.copyWith(color: Colors.white),
                    ),
                    Text(
                      'Aujourd\'hui',
                      style: AppTextStyles.caption.copyWith(color: Colors.white70),
                    ),
                  ],
                ),
                Row(
                  children: [
                    Icon(Icons.wb_sunny, size: 48, color: Colors.yellow.shade200),
                    const SizedBox(width: 8),
                    Text(
                      '32°',
                      style: AppTextStyles.h3.copyWith(color: Colors.white),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildWeatherDay('Lun', Icons.wb_sunny, '31°'),
                _buildWeatherDay('Mar', Icons.wb_cloudy, '29°'),
                _buildWeatherDay('Mer', Icons.wb_cloudy, '30°'),
                _buildWeatherDay('Jeu', Icons.grain, '28°'),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildWeatherDay(String day, IconData icon, String temp) {
    return Column(
      children: [
        Text(day, style: AppTextStyles.caption.copyWith(color: Colors.white70)),
        const SizedBox(height: 4),
        Icon(icon, color: Colors.white, size: 24),
        const SizedBox(height: 4),
        Text(temp, style: AppTextStyles.bodySmall.copyWith(color: Colors.white)),
      ],
    );
  }

  // 13. Titrologie
  Widget _buildTitrologieSection() {
    return SliverToBoxAdapter(
      child: Container(
        margin: const EdgeInsets.all(AppSpacing.paddingScreen),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.newspaper, color: AppColors.titrologieColor, size: 24),
                const SizedBox(width: 8),
                Text('Titrologie', style: AppTextStyles.h5),
                const Spacer(),
                TextButton(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => ArticleListScreen(
                          categoryName: 'Titrologie',
                        ),
                      ),
                    );
                  },
                  child: const Text('Voir tout'),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),
            SizedBox(
              height: 200,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                itemCount: 5,
                itemBuilder: (context, index) {
                  return Container(
                    width: 160,
                    margin: const EdgeInsets.only(right: 12),
                    decoration: BoxDecoration(
                      color: AppColors.surfaceVariant,
                      borderRadius: BorderRadius.circular(AppSpacing.radiusSmall),
                      border: Border.all(color: AppColors.primary.withOpacity(0.3)),
                    ),
                    child: Column(
                      children: [
                        Expanded(
                          child: Container(
                            decoration: BoxDecoration(
                              color: Colors.grey.shade300,
                              borderRadius: const BorderRadius.vertical(
                                top: Radius.circular(AppSpacing.radiusSmall),
                              ),
                            ),
                            child: const Center(
                              child: Icon(Icons.article, size: 48),
                            ),
                          ),
                        ),
                        Padding(
                          padding: const EdgeInsets.all(8),
                          child: Text(
                            'Journal ${index + 1}',
                            style: AppTextStyles.caption.copyWith(fontWeight: FontWeight.w600),
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  // 14. Faits divers
  Widget _buildFaitsDiversSection() {
    final articles = _diversArticles;
    if (articles.isEmpty) return const SliverToBoxAdapter();

    return SliverToBoxAdapter(
      child: Container(
        margin: const EdgeInsets.all(AppSpacing.paddingScreen),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.local_fire_department, color: AppColors.getCategoryColor('faits-divers'), size: 24),
                const SizedBox(width: 8),
                Text('Faits Divers', style: AppTextStyles.h5),
                const Spacer(),
                TextButton(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => ArticleListScreen(
                          categoryName: 'Faits Divers',
                        ),
                      ),
                    );
                  },
                  child: const Text('Voir tout'),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),
            ...articles.take(5).map((article) => _buildSmallArticleCard(article, categoryColor: AppColors.getCategoryColor('faits-divers'))),
          ],
        ),
      ),
    );
  }

  // ==================== WIDGETS COMMUNS ====================

  Widget _buildMainArticleCard(Article article, {Color? categoryColor}) {
    final badgeColor = categoryColor ?? AppColors.parseColor(article.categoryColor, fallback: AppColors.getCategoryColor(article.categoryName));
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
        height: 200,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(AppSpacing.radiusMedium),
        ),
        child: Stack(
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(AppSpacing.radiusMedium),
              child: Image.network(
                article.coverImage,
                width: double.infinity,
                height: 200,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) {
                  return Container(
                    color: AppColors.surfaceVariant,
                    child: const Icon(Icons.image, size: 48),
                  );
                },
              ),
            ),
            Container(
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(AppSpacing.radiusMedium),
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [Colors.transparent, Colors.black.withOpacity(0.7)],
                ),
              ),
            ),
            Positioned(
              left: 12,
              right: 12,
              bottom: 12,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (article.categoryName != null)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: badgeColor,
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        article.categoryName!.toUpperCase(),
                        style: AppTextStyles.badge.copyWith(color: Colors.white, fontSize: 9),
                      ),
                    ),
                  const SizedBox(height: 6),
                  Text(
                    article.title,
                    style: AppTextStyles.bodyMedium.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    _formatTimeAgo(article.publishedAt),
                    style: AppTextStyles.caption.copyWith(color: Colors.white70),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSmallArticleCard(Article article, {Color? categoryColor}) {
    final badgeColor = categoryColor ?? AppColors.parseColor(article.categoryColor, fallback: AppColors.getCategoryColor(article.categoryName));
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => ArticleDetailScreen(article: article),
            ),
          );
        },
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(AppSpacing.radiusSmall),
              child: Image.network(
                article.coverImage,
                width: 100,
                height: 80,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) {
                  return Container(
                    width: 100,
                    height: 80,
                    color: AppColors.surfaceVariant,
                    child: const Icon(Icons.image, size: 32),
                  );
                },
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (article.categoryName != null)
                    Text(
                      article.categoryName!.toUpperCase(),
                      style: AppTextStyles.caption.copyWith(
                        color: badgeColor,
                        fontWeight: FontWeight.w600,
                        fontSize: 10,
                      ),
                    ),
                  const SizedBox(height: 4),
                  Text(
                    article.title,
                    style: AppTextStyles.bodySmall.copyWith(fontWeight: FontWeight.w600),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Icon(Icons.access_time, size: 12, color: AppColors.textSecondary),
                      const SizedBox(width: 4),
                      Text(
                        _formatTimeAgo(article.publishedAt),
                        style: AppTextStyles.caption,
                      ),
                      const SizedBox(width: 12),
                      Icon(Icons.visibility, size: 12, color: AppColors.textSecondary),
                      const SizedBox(width: 4),
                      Text(
                        '${article.viewCount}',
                        style: AppTextStyles.caption,
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ==================== ONGLETS SECONDAIRES ====================
  
  Widget _buildArticlesTab() {
    return const ArticleListScreen(
      category: 'Articles',
    );
  }

  // ==================== UTILITAIRES ====================
  
  String _formatTimeAgo(DateTime dateTime) {
    final now = DateTime.now();
    final difference = now.difference(dateTime);

    if (difference.inDays > 0) {
      return 'il y a ${difference.inDays}j';
    } else if (difference.inHours > 0) {
      return 'il y a ${difference.inHours}h';
    } else if (difference.inMinutes > 0) {
      return 'il y a ${difference.inMinutes}min';
    } else {
      return 'à l\'instant';
    }
  }

  void _shareArticle(Article article) {
    // TODO: Implémenter le partage d'article
    // Pour l'instant, on affiche juste un message
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Partager: ${article.title}'),
        duration: const Duration(seconds: 2),
        action: SnackBarAction(
          label: 'OK',
          onPressed: () {},
        ),
      ),
    );
  }
}

// Widget pour afficher les flash infos qui défilent verticalement
class _FlashInfoScrollingText extends StatefulWidget {
  final List<Map<String, dynamic>> flashInfos;

  const _FlashInfoScrollingText({required this.flashInfos});

  @override
  State<_FlashInfoScrollingText> createState() => _FlashInfoScrollingTextState();
}

class _FlashInfoScrollingTextState extends State<_FlashInfoScrollingText> {
  late ScrollController _scrollController;
  late Timer _timer;
  double _scrollPosition = 0;

  @override
  void initState() {
    super.initState();
    _scrollController = ScrollController();
    _startAutoScroll();
  }

  void _startAutoScroll() {
    _timer = Timer.periodic(const Duration(milliseconds: 50), (timer) {
      if (_scrollController.hasClients) {
        _scrollPosition += 1;
        if (_scrollPosition >= _scrollController.position.maxScrollExtent) {
          _scrollPosition = 0;
        }
        _scrollController.jumpTo(_scrollPosition);
      }
    });
  }

  @override
  void dispose() {
    _timer.cancel();
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ListView.separated(
      controller: _scrollController,
      scrollDirection: Axis.horizontal,
      itemCount: widget.flashInfos.length * 100, // Boucle infinie
      separatorBuilder: (context, index) => Container(
        margin: const EdgeInsets.symmetric(horizontal: 16),
        child: Text(
          '•',
          style: TextStyle(
            color: AppColors.error.withOpacity(0.5),
            fontSize: 12,
          ),
        ),
      ),
      itemBuilder: (context, index) {
        final flash = widget.flashInfos[index % widget.flashInfos.length];
        return Center(
          child: Text(
            flash['title'] ?? '',
            style: AppTextStyles.caption.copyWith(
              color: AppColors.error,
              fontWeight: FontWeight.w500,
              fontSize: 12,
            ),
          ),
        );
      },
    );
  }
}
