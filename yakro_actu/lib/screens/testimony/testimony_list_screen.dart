import 'package:flutter/material.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_spacing.dart';
import '../../theme/app_text_styles.dart';
import '../../models/testimony.dart';
import '../../services/api/testimony_service.dart';
import 'testimony_form_screen.dart';

class TestimonyListScreen extends StatefulWidget {
  const TestimonyListScreen({Key? key}) : super(key: key);

  @override
  State<TestimonyListScreen> createState() => _TestimonyListScreenState();
}

class _TestimonyListScreenState extends State<TestimonyListScreen> {
  final TestimonyService _service = TestimonyService();
  final ScrollController _scrollController = ScrollController();

  List<Testimony> _testimonies = [];
  bool _isLoading = true;
  bool _isLoadingMore = false;
  int _currentPage = 1;
  bool _hasMore = true;

  @override
  void initState() {
    super.initState();
    _loadTestimonies();
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

  Future<void> _loadTestimonies() async {
    try {
      final testimonies = await _service.getApprovedTestimonies();
      setState(() {
        _testimonies = testimonies;
        _currentPage = 1;
        _hasMore = testimonies.length >= 20;
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
      final testimonies = await _service.getTestimonies(
        page: _currentPage + 1,
        limit: 20,
        isApproved: true,
      );

      setState(() {
        _testimonies.addAll(testimonies);
        _currentPage++;
        _hasMore = testimonies.length >= 20;
        _isLoadingMore = false;
      });
    } catch (e) {
      setState(() => _isLoadingMore = false);
    }
  }

  Future<void> _refresh() async {
    setState(() => _isLoading = true);
    await _loadTestimonies();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Témoignages'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _refresh,
              child: _testimonies.isEmpty
                  ? _buildEmptyState()
                  : ListView.builder(
                      controller: _scrollController,
                      padding: const EdgeInsets.all(AppSpacing.paddingScreen),
                      itemCount: _testimonies.length + (_isLoadingMore ? 1 : 0),
                      itemBuilder: (context, index) {
                        if (index == _testimonies.length) {
                          return const Center(
                            child: Padding(
                              padding: EdgeInsets.all(AppSpacing.md),
                              child: CircularProgressIndicator(),
                            ),
                          );
                        }
                        return _buildTestimonyCard(_testimonies[index]);
                      },
                    ),
            ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => const TestimonyFormScreen(),
            ),
          ).then((submitted) {
            if (submitted == true) {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text(
                      'Témoignage soumis ! Il sera publié après validation.'),
                ),
              );
            }
          });
        },
        icon: const Icon(Icons.add),
        label: const Text('Témoigner'),
      ),
    );
  }

  Widget _buildTestimonyCard(Testimony testimony) {
    return Card(
      margin: const EdgeInsets.only(bottom: AppSpacing.marginBetweenCards),
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.paddingCard),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // En-tête avec photo et info
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Photo
                CircleAvatar(
                  radius: 28,
                  backgroundColor: AppColors.primary.withOpacity(0.1),
                  backgroundImage: testimony.photo != null
                      ? NetworkImage(testimony.photo!)
                      : null,
                  child: testimony.photo == null
                      ? const Icon(Icons.person, color: AppColors.primary)
                      : null,
                ),
                const SizedBox(width: AppSpacing.md),

                // Info
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        testimony.name,
                        style: AppTextStyles.h6,
                      ),
                      const SizedBox(height: 4),
                      if (testimony.displayRole.isNotEmpty)
                        Text(
                          testimony.displayRole,
                          style: AppTextStyles.caption.copyWith(
                            color: AppColors.textSecondary,
                          ),
                        ),
                      const SizedBox(height: AppSpacing.sm),
                      _buildRatingStars(testimony.rating),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),

            // Contenu
            Text(
              testimony.content,
              style: AppTextStyles.bodyMedium.copyWith(
                height: 1.6,
                fontStyle: FontStyle.italic,
              ),
              maxLines: 6,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRatingStars(int rating) {
    return Row(
      children: List.generate(5, (index) {
        return Icon(
          index < rating ? Icons.star : Icons.star_border,
          size: 16,
          color: AppColors.featured,
        );
      }),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.rate_review, size: 64, color: AppColors.textTertiary),
          const SizedBox(height: AppSpacing.md),
          const Text('Aucun témoignage', style: AppTextStyles.h5),
          const SizedBox(height: AppSpacing.sm),
          const Text('Soyez le premier à témoigner',
              style: AppTextStyles.caption),
          const SizedBox(height: AppSpacing.lg),
          ElevatedButton.icon(
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const TestimonyFormScreen(),
                ),
              );
            },
            icon: const Icon(Icons.add),
            label: const Text('Témoigner'),
          ),
        ],
      ),
    );
  }
}
