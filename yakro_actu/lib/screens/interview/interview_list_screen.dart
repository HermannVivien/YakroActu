import 'package:flutter/material.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_spacing.dart';
import '../../theme/app_text_styles.dart';
import '../../widgets/common_widgets.dart';
import '../../models/interview.dart';
import '../../services/api/interview_service.dart';
import 'interview_detail_screen.dart';

class InterviewListScreen extends StatefulWidget {
  const InterviewListScreen({Key? key}) : super(key: key);

  @override
  State<InterviewListScreen> createState() => _InterviewListScreenState();
}

class _InterviewListScreenState extends State<InterviewListScreen> {
  final InterviewService _service = InterviewService();
  final ScrollController _scrollController = ScrollController();
  
  List<Interview> _interviews = [];
  bool _isLoading = true;
  bool _isLoadingMore = false;
  int _currentPage = 1;
  bool _hasMore = true;

  @override
  void initState() {
    super.initState();
    _loadInterviews();
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

  Future<void> _loadInterviews() async {
    try {
      final interviews = await _service.getInterviews(page: 1, limit: 10);
      setState(() {
        _interviews = interviews;
        _isLoading = false;
        _hasMore = interviews.length >= 10;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _loadMore() async {
    if (_isLoadingMore) return;
    
    setState(() => _isLoadingMore = true);
    try {
      final interviews = await _service.getInterviews(
        page: _currentPage + 1,
        limit: 10,
      );
      setState(() {
        _interviews.addAll(interviews);
        _currentPage++;
        _isLoadingMore = false;
        _hasMore = interviews.length >= 10;
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
    await _loadInterviews();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Interviews'),
      ),
      body: _isLoading
          ? _buildLoadingState()
          : _interviews.isEmpty
              ? _buildEmptyState()
              : RefreshIndicator(
                  onRefresh: _refresh,
                  child: ListView.builder(
                    controller: _scrollController,
                    padding: const EdgeInsets.all(AppSpacing.paddingScreen),
                    itemCount: _interviews.length + (_isLoadingMore ? 1 : 0),
                    itemBuilder: (context, index) {
                      if (index == _interviews.length) {
                        return const Center(
                          child: Padding(
                            padding: EdgeInsets.all(AppSpacing.md),
                            child: CircularProgressIndicator(),
                          ),
                        );
                      }
                      final interview = _interviews[index];
                      return _buildInterviewCard(interview);
                    },
                  ),
                ),
    );
  }

  Widget _buildInterviewCard(Interview interview) {
    return Card(
      margin: const EdgeInsets.only(bottom: AppSpacing.marginBetweenCards),
      child: InkWell(
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => InterviewDetailScreen(interview: interview),
            ),
          );
        },
        borderRadius: BorderRadius.circular(AppSpacing.radiusMedium),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image
            if (interview.coverImage != null)
              AspectRatio(
                aspectRatio: 16 / 9,
                child: Image.network(
                  interview.coverImage!,
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) {
                    return Container(
                      color: AppColors.surfaceVariant,
                      child: const Icon(
                        Icons.mic_outlined,
                        size: 48,
                        color: AppColors.textTertiary,
                      ),
                    );
                  },
                ),
              ),

            Padding(
              padding: const EdgeInsets.all(AppSpacing.paddingCard),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Catégorie
                  if (interview.categoryName != null)
                    Text(
                      interview.categoryName!.toUpperCase(),
                      style: AppTextStyles.overline.copyWith(
                        color: AppColors.primary,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  const SizedBox(height: AppSpacing.xs),

                  // Titre
                  Text(
                    interview.title,
                    style: AppTextStyles.articleTitle,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: AppSpacing.sm),

                  // Interviewé
                  Row(
                    children: [
                      if (interview.intervieweePhoto != null)
                        CircleAvatar(
                          radius: 20,
                          backgroundImage:
                              NetworkImage(interview.intervieweePhoto!),
                        )
                      else
                        const CircleAvatar(
                          radius: 20,
                          child: Icon(Icons.person),
                        ),
                      const SizedBox(width: AppSpacing.sm),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              interview.intervieweeName,
                              style: AppTextStyles.bodyMedium.copyWith(
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            if (interview.intervieweeTitle != null)
                              Text(
                                interview.intervieweeTitle!,
                                style: AppTextStyles.caption,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.sm),

                  // Nombre de questions
                  Row(
                    children: [
                      const Icon(Icons.question_answer,
                          size: 16, color: AppColors.textSecondary),
                      const SizedBox(width: 4),
                      Text(
                        '${interview.questions.length} questions',
                        style: AppTextStyles.caption,
                      ),
                      const Spacer(),
                      Text(
                        _formatTimeAgo(interview.publishedAt),
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
      icon: Icons.mic_outlined,
      title: 'Aucune interview',
      message: 'Il n\'y a pas encore d\'interviews disponibles.',
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
