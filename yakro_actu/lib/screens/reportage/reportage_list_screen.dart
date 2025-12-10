import 'package:flutter/material.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_spacing.dart';
import '../../theme/app_text_styles.dart';
import '../../widgets/common_widgets.dart';
import '../../models/reportage.dart';
import '../../services/api/reportage_service.dart';
import 'reportage_detail_screen.dart';

class ReportageListScreen extends StatefulWidget {
  final int? categoryId;
  final String? categoryName;

  const ReportageListScreen({
    Key? key,
    this.categoryId,
    this.categoryName,
  }) : super(key: key);

  @override
  State<ReportageListScreen> createState() => _ReportageListScreenState();
}

class _ReportageListScreenState extends State<ReportageListScreen> {
  final ReportageService _service = ReportageService();
  final ScrollController _scrollController = ScrollController();
  
  List<Reportage> _reportages = [];
  bool _isLoading = true;
  bool _isLoadingMore = false;
  int _currentPage = 1;
  bool _hasMore = true;

  @override
  void initState() {
    super.initState();
    _loadReportages();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
            _scrollController.position.maxScrollExtent * 0.8 &&
        !_isLoadingMore &&
        _hasMore) {
      _loadMore();
    }
  }

  Future<void> _loadReportages() async {
    try {
      final reportages = await _service.getReportages(
        page: 1,
        limit: 10,
        category: widget.categoryName,
      );
      setState(() {
        _reportages = reportages;
        _isLoading = false;
        _hasMore = reportages.length >= 10;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      _showError('Erreur de chargement');
    }
  }

  Future<void> _loadMore() async {
    if (_isLoadingMore) return;
    
    setState(() => _isLoadingMore = true);
    try {
      final reportages = await _service.getReportages(
        page: _currentPage + 1,
        limit: 10,
        category: widget.categoryName,
      );
      setState(() {
        _reportages.addAll(reportages);
        _currentPage++;
        _isLoadingMore = false;
        _hasMore = reportages.length >= 10;
      });
    } catch (e) {
      setState(() => _isLoadingMore = false);
    }
  }

  Future<void> _refresh() async {
    setState(() {
      _currentPage = 1;
      _hasMore = true;
    });
    await _loadReportages();
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.categoryName ?? 'Reportages'),
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: () {
              // TODO: Filtres
            },
          ),
        ],
      ),
      body: _isLoading
          ? _buildLoadingState()
          : _reportages.isEmpty
              ? _buildEmptyState()
              : RefreshIndicator(
                  onRefresh: _refresh,
                  child: ListView.builder(
                    controller: _scrollController,
                    padding: const EdgeInsets.all(AppSpacing.paddingScreen),
                    itemCount: _reportages.length + (_isLoadingMore ? 1 : 0),
                    itemBuilder: (context, index) {
                      if (index == _reportages.length) {
                        return const Center(
                          child: Padding(
                            padding: EdgeInsets.all(AppSpacing.md),
                            child: CircularProgressIndicator(),
                          ),
                        );
                      }
                      final reportage = _reportages[index];
                      return Padding(
                        padding: const EdgeInsets.only(
                            bottom: AppSpacing.marginBetweenCards),
                        child: ArticleCard(
                          title: reportage.title,
                          subtitle: reportage.summary,
                          imageUrl: reportage.coverImage,
                          category: reportage.categoryName,
                          timeAgo: _formatTimeAgo(reportage.publishedAt),
                          isFeatured: reportage.isFeatured,
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) =>
                                    ReportageDetailScreen(reportage: reportage),
                              ),
                            );
                          },
                        ),
                      );
                    },
                  ),
                ),
    );
  }

  Widget _buildLoadingState() {
    return ListView.builder(
      padding: const EdgeInsets.all(AppSpacing.paddingScreen),
      itemCount: 5,
      itemBuilder: (context, index) {
        return const Padding(
          padding: EdgeInsets.only(bottom: AppSpacing.marginBetweenCards),
          child: ArticleCardShimmer(),
        );
      },
    );
  }

  Widget _buildEmptyState() {
    return EmptyState(
      icon: Icons.article_outlined,
      title: 'Aucun reportage',
      message: 'Il n\'y a pas encore de reportages dans cette catégorie.',
      actionLabel: 'Actualiser',
      onAction: _refresh,
    );
  }

  String _formatTimeAgo(DateTime? date) {
    if (date == null) return '';
    final difference = DateTime.now().difference(date);
    if (difference.inDays > 0) return 'Il y a ${difference.inDays}j';
    if (difference.inHours > 0) return 'Il y a ${difference.inHours}h';
    if (difference.inMinutes > 0) return 'Il y a ${difference.inMinutes}min';
    return 'À l\'instant';
  }
}
