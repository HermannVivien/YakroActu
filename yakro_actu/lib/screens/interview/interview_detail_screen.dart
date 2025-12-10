import 'package:flutter/material.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_spacing.dart';
import '../../theme/app_text_styles.dart';
import '../../models/interview.dart';
import '../../services/api/interview_service.dart';

class InterviewDetailScreen extends StatefulWidget {
  final Interview interview;

  const InterviewDetailScreen({
    Key? key,
    required this.interview,
  }) : super(key: key);

  @override
  State<InterviewDetailScreen> createState() => _InterviewDetailScreenState();
}

class _InterviewDetailScreenState extends State<InterviewDetailScreen> {
  final InterviewService _service = InterviewService();
  final ScrollController _scrollController = ScrollController();
  bool _showTitle = false;

  @override
  void initState() {
    super.initState();
    _service.incrementViewCount(widget.interview.id);
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.offset > 200 && !_showTitle) {
      setState(() => _showTitle = true);
    } else if (_scrollController.offset <= 200 && _showTitle) {
      setState(() => _showTitle = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: CustomScrollView(
        controller: _scrollController,
        slivers: [
          // App Bar
          SliverAppBar(
            expandedHeight: 300,
            pinned: true,
            title: _showTitle
                ? Text(
                    widget.interview.title,
                    style: const TextStyle(fontSize: 16),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  )
                : null,
            flexibleSpace: FlexibleSpaceBar(
              background: Stack(
                fit: StackFit.expand,
                children: [
                  if (widget.interview.coverImage != null)
                    Image.network(
                      widget.interview.coverImage!,
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) {
                        return Container(
                          color: AppColors.surfaceVariant,
                          child: const Icon(
                            Icons.mic_outlined,
                            size: 64,
                            color: AppColors.textTertiary,
                          ),
                        );
                      },
                    )
                  else
                    Container(
                      decoration: const BoxDecoration(
                        gradient: AppColors.primaryGradient,
                      ),
                      child: const Icon(
                        Icons.mic_outlined,
                        size: 64,
                        color: Colors.white,
                      ),
                    ),
                  Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          Colors.transparent,
                          Colors.black.withOpacity(0.7),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
            actions: [
              IconButton(
                icon: const Icon(Icons.share),
                onPressed: () {},
              ),
            ],
          ),

          // Contenu
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(AppSpacing.paddingScreen),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Catégorie
                  if (widget.interview.categoryName != null) ...[
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: AppSpacing.sm,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withOpacity(0.1),
                        borderRadius:
                            BorderRadius.circular(AppSpacing.radiusSmall),
                      ),
                      child: Text(
                        widget.interview.categoryName!.toUpperCase(),
                        style: AppTextStyles.overline.copyWith(
                          color: AppColors.primary,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    const SizedBox(height: AppSpacing.md),
                  ],

                  // Titre
                  Text(
                    widget.interview.title,
                    style: AppTextStyles.h2,
                  ),
                  const SizedBox(height: AppSpacing.md),

                  // Résumé
                  Text(
                    widget.interview.summary,
                    style: AppTextStyles.articleSubtitle,
                  ),
                  const SizedBox(height: AppSpacing.xl),

                  // Carte de l'interviewé
                  _buildIntervieweeCard(),
                  const SizedBox(height: AppSpacing.xl),

                  // Média (vidéo ou audio)
                  if (widget.interview.videoUrl != null) ...[
                    _buildVideoPlayer(),
                    const SizedBox(height: AppSpacing.xl),
                  ] else if (widget.interview.audioUrl != null) ...[
                    _buildAudioPlayer(),
                    const SizedBox(height: AppSpacing.xl),
                  ],

                  const Divider(),
                  const SizedBox(height: AppSpacing.lg),

                  // Questions et réponses
                  const Text(
                    'L\'interview',
                    style: AppTextStyles.sectionTitle,
                  ),
                  const SizedBox(height: AppSpacing.lg),

                  ...widget.interview.questions
                      .asMap()
                      .entries
                      .map((entry) => _buildQA(entry.key + 1, entry.value))
                      .toList(),

                  const SizedBox(height: AppSpacing.xxl),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildIntervieweeCard() {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.paddingCard),
      decoration: BoxDecoration(
        gradient: AppColors.primaryGradient,
        borderRadius: BorderRadius.circular(AppSpacing.radiusMedium),
        boxShadow: AppColors.cardShadow,
      ),
      child: Row(
        children: [
          if (widget.interview.intervieweePhoto != null)
            ClipRRect(
              borderRadius: BorderRadius.circular(AppSpacing.radiusMedium),
              child: Image.network(
                widget.interview.intervieweePhoto!,
                width: 80,
                height: 80,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) {
                  return Container(
                    width: 80,
                    height: 80,
                    color: Colors.white.withOpacity(0.2),
                    child: const Icon(Icons.person, color: Colors.white),
                  );
                },
              ),
            )
          else
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.2),
                borderRadius: BorderRadius.circular(AppSpacing.radiusMedium),
              ),
              child: const Icon(Icons.person, size: 40, color: Colors.white),
            ),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  widget.interview.intervieweeName,
                  style: AppTextStyles.h5.copyWith(color: Colors.white),
                ),
                if (widget.interview.intervieweeTitle != null) ...[
                  const SizedBox(height: 4),
                  Text(
                    widget.interview.intervieweeTitle!,
                    style: AppTextStyles.bodySmall.copyWith(
                      color: Colors.white70,
                    ),
                  ),
                ],
                if (widget.interview.intervieweeBio != null) ...[
                  const SizedBox(height: AppSpacing.sm),
                  Text(
                    widget.interview.intervieweeBio!,
                    style: AppTextStyles.caption.copyWith(
                      color: Colors.white70,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQA(int index, InterviewQuestion qa) {
    return Container(
      margin: const EdgeInsets.only(bottom: AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Question
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: AppColors.primary.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(AppSpacing.radiusSmall),
                ),
                child: Center(
                  child: Text(
                    'Q$index',
                    style: AppTextStyles.bodySmall.copyWith(
                      color: AppColors.primary,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: AppSpacing.sm),
              Expanded(
                child: Text(
                  qa.question,
                  style: AppTextStyles.bodyLarge.copyWith(
                    fontWeight: FontWeight.w600,
                    color: AppColors.primary,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),

          // Réponse
          Padding(
            padding: const EdgeInsets.only(left: 40),
            child: Text(
              qa.answer,
              style: AppTextStyles.bodyLarge.copyWith(height: 1.8),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildVideoPlayer() {
    return Container(
      height: 200,
      decoration: BoxDecoration(
        color: Colors.black,
        borderRadius: BorderRadius.circular(AppSpacing.radiusMedium),
      ),
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.play_circle_outline,
                size: 64, color: Colors.white),
            const SizedBox(height: AppSpacing.sm),
            Text(
              'Regarder l\'interview',
              style: AppTextStyles.bodyMedium.copyWith(color: Colors.white),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAudioPlayer() {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.paddingCard),
      decoration: BoxDecoration(
        color: AppColors.surfaceVariant,
        borderRadius: BorderRadius.circular(AppSpacing.radiusMedium),
      ),
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: const BoxDecoration(
              color: AppColors.primary,
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.play_arrow, color: Colors.white),
          ),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Écouter l\'interview',
                  style: AppTextStyles.bodyMedium.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                Text(
                  '${widget.interview.questions.length} questions',
                  style: AppTextStyles.caption,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
