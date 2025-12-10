import 'package:flutter/material.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_spacing.dart';
import '../../theme/app_text_styles.dart';
import '../../models/sport.dart';
import '../../services/api/sport_service.dart';
import 'sport_match_detail_screen.dart';

class SportScreen extends StatefulWidget {
  const SportScreen({Key? key}) : super(key: key);

  @override
  State<SportScreen> createState() => _SportScreenState();
}

class _SportScreenState extends State<SportScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final SportService _service = SportService();

  List<SportMatch> _liveMatches = [];
  List<SportMatch> _todayMatches = [];
  bool _isLoadingLive = true;
  bool _isLoadingToday = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _loadData();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadData() async {
    _loadLiveMatches();
    _loadTodayMatches();
  }

  Future<void> _loadLiveMatches() async {
    try {
      final matches = await _service.getLiveMatches();
      setState(() {
        _liveMatches = matches;
        _isLoadingLive = false;
      });
    } catch (e) {
      setState(() {
        _isLoadingLive = false;
        _errorMessage = e.toString();
      });
    }
  }

  Future<void> _loadTodayMatches() async {
    try {
      final matches = await _service.getTodayMatches();
      setState(() {
        _todayMatches = matches;
        _isLoadingToday = false;
      });
    } catch (e) {
      setState(() {
        _isLoadingToday = false;
        _errorMessage = e.toString();
      });
    }
  }

  Future<void> _refresh() async {
    setState(() {
      _isLoadingLive = true;
      _isLoadingToday = true;
      _errorMessage = null;
    });
    await _loadData();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Sport'),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'En Direct'),
            Tab(text: 'Aujourd\'hui'),
            Tab(text: 'Calendrier'),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _refresh,
          ),
        ],
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildLiveTab(),
          _buildTodayTab(),
          _buildCalendarTab(),
        ],
      ),
    );
  }

  Widget _buildLiveTab() {
    if (_isLoadingLive) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_errorMessage != null) {
      return _buildErrorState(_errorMessage!);
    }

    if (_liveMatches.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.sports_soccer,
              size: 64,
              color: AppColors.textTertiary,
            ),
            const SizedBox(height: AppSpacing.md),
            const Text(
              'Aucun match en direct',
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

    return RefreshIndicator(
      onRefresh: _refresh,
      child: ListView.builder(
        padding: const EdgeInsets.all(AppSpacing.paddingScreen),
        itemCount: _liveMatches.length,
        itemBuilder: (context, index) {
          return _buildMatchCard(_liveMatches[index], isLive: true);
        },
      ),
    );
  }

  Widget _buildTodayTab() {
    if (_isLoadingToday) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_todayMatches.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.event_available,
              size: 64,
              color: AppColors.textTertiary,
            ),
            const SizedBox(height: AppSpacing.md),
            const Text(
              'Aucun match aujourd\'hui',
              style: AppTextStyles.h5,
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _refresh,
      child: ListView.builder(
        padding: const EdgeInsets.all(AppSpacing.paddingScreen),
        itemCount: _todayMatches.length,
        itemBuilder: (context, index) {
          return _buildMatchCard(_todayMatches[index]);
        },
      ),
    );
  }

  Widget _buildCalendarTab() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.calendar_today,
            size: 64,
            color: AppColors.textTertiary,
          ),
          const SizedBox(height: AppSpacing.md),
          const Text(
            'Calendrier',
            style: AppTextStyles.h5,
          ),
          const SizedBox(height: AppSpacing.sm),
          const Text(
            'Fonctionnalité à venir',
            style: AppTextStyles.caption,
          ),
        ],
      ),
    );
  }

  Widget _buildMatchCard(SportMatch match, {bool isLive = false}) {
    return Card(
      margin: const EdgeInsets.only(bottom: AppSpacing.marginBetweenCards),
      child: InkWell(
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => SportMatchDetailScreen(match: match),
            ),
          );
        },
        borderRadius: BorderRadius.circular(AppSpacing.radiusMedium),
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.paddingCard),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // En-tête : Ligue et statut
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Row(
                      children: [
                        if (match.leagueLogo != null) ...[
                          Image.network(
                            match.leagueLogo!,
                            width: 20,
                            height: 20,
                            errorBuilder: (context, error, stackTrace) {
                              return const Icon(Icons.sports,
                                  size: 20, color: AppColors.textSecondary);
                            },
                          ),
                          const SizedBox(width: AppSpacing.xs),
                        ],
                        Expanded(
                          child: Text(
                            match.league ?? 'Football',
                            style: AppTextStyles.bodySmall.copyWith(
                              fontWeight: FontWeight.w600,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                  ),
                  if (isLive || match.isLive)
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: AppSpacing.sm,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.live,
                        borderRadius:
                            BorderRadius.circular(AppSpacing.radiusSmall),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: const [
                          Icon(Icons.circle, size: 8, color: Colors.white),
                          SizedBox(width: 4),
                          Text(
                            'LIVE',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                        ],
                      ),
                    )
                  else
                    Text(
                      _formatMatchTime(match.matchDate),
                      style: AppTextStyles.caption,
                    ),
                ],
              ),
              const SizedBox(height: AppSpacing.md),

              // Équipes et scores
              Row(
                children: [
                  // Équipe domicile
                  Expanded(
                    child: _buildTeam(
                      match.homeTeam,
                      match.homeTeamLogo,
                      match.homeScore,
                      true,
                    ),
                  ),

                  // Séparateur
                  Padding(
                    padding: const EdgeInsets.symmetric(
                        horizontal: AppSpacing.md),
                    child: Column(
                      children: [
                        if (match.isLive)
                          const Text(
                            'vs',
                            style: TextStyle(
                              fontSize: 12,
                              color: AppColors.textSecondary,
                            ),
                          )
                        else if (match.isScheduled)
                          const Icon(
                            Icons.schedule,
                            size: 20,
                            color: AppColors.textSecondary,
                          )
                        else
                          const Text(
                            '-',
                            style: TextStyle(
                              fontSize: 20,
                              color: AppColors.textSecondary,
                            ),
                          ),
                      ],
                    ),
                  ),

                  // Équipe extérieur
                  Expanded(
                    child: _buildTeam(
                      match.awayTeam,
                      match.awayTeamLogo,
                      match.awayScore,
                      false,
                    ),
                  ),
                ],
              ),

              // Stade
              if (match.venue != null) ...[
                const SizedBox(height: AppSpacing.sm),
                Row(
                  children: [
                    const Icon(
                      Icons.stadium,
                      size: 14,
                      color: AppColors.textSecondary,
                    ),
                    const SizedBox(width: 4),
                    Expanded(
                      child: Text(
                        match.venue!,
                        style: AppTextStyles.caption,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTeam(String name, String? logo, int? score, bool isHome) {
    return Column(
      children: [
        // Logo
        if (logo != null)
          Image.network(
            logo,
            width: 48,
            height: 48,
            errorBuilder: (context, error, stackTrace) {
              return Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: AppColors.surfaceVariant,
                  borderRadius: BorderRadius.circular(AppSpacing.radiusSmall),
                ),
                child: const Icon(Icons.shield, color: AppColors.textSecondary),
              );
            },
          )
        else
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: AppColors.surfaceVariant,
              borderRadius: BorderRadius.circular(AppSpacing.radiusSmall),
            ),
            child: const Icon(Icons.shield, color: AppColors.textSecondary),
          ),
        const SizedBox(height: AppSpacing.xs),

        // Nom
        Text(
          name,
          style: AppTextStyles.bodyMedium.copyWith(
            fontWeight: FontWeight.w600,
          ),
          textAlign: TextAlign.center,
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
        ),

        // Score
        if (score != null) ...[
          const SizedBox(height: 4),
          Text(
            score.toString(),
            style: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: AppColors.primary,
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildErrorState(String message) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.paddingSection),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.error_outline,
              size: 64,
              color: AppColors.error,
            ),
            const SizedBox(height: AppSpacing.md),
            const Text(
              'Erreur de chargement',
              style: AppTextStyles.h5,
            ),
            const SizedBox(height: AppSpacing.sm),
            Text(
              message.contains('Aucune configuration')
                  ? 'Aucune API sport configurée'
                  : 'Impossible de charger les matchs',
              style: AppTextStyles.bodyMedium.copyWith(
                color: AppColors.textSecondary,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: AppSpacing.lg),
            ElevatedButton(
              onPressed: _refresh,
              child: const Text('Réessayer'),
            ),
          ],
        ),
      ),
    );
  }

  String _formatMatchTime(DateTime date) {
    final hour = date.hour.toString().padLeft(2, '0');
    final minute = date.minute.toString().padLeft(2, '0');
    return '$hour:$minute';
  }
}
