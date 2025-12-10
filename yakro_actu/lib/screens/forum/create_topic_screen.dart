import 'package:flutter/material.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_spacing.dart';
import '../../theme/app_text_styles.dart';
import '../../models/forum.dart';
import '../../services/api/forum_service.dart';

class CreateTopicScreen extends StatefulWidget {
  final ForumCategory category;

  const CreateTopicScreen({
    Key? key,
    required this.category,
  }) : super(key: key);

  @override
  State<CreateTopicScreen> createState() => _CreateTopicScreenState();
}

class _CreateTopicScreenState extends State<CreateTopicScreen> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _contentController = TextEditingController();
  final ForumService _service = ForumService();
  bool _isSubmitting = false;

  @override
  void dispose() {
    _titleController.dispose();
    _contentController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSubmitting = true);

    try {
      await _service.createTopic(
        title: _titleController.text.trim(),
        content: _contentController.text.trim(),
        categoryId: widget.category.id,
        token: 'user_token_here', // TODO: Get from auth service
      );

      if (mounted) {
        Navigator.pop(context, true); // Return true to indicate success
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Sujet créé avec succès')),
        );
      }
    } catch (e) {
      setState(() => _isSubmitting = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erreur: ${e.toString()}')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Nouveau sujet'),
        actions: [
          if (_isSubmitting)
            const Center(
              child: Padding(
                padding: EdgeInsets.symmetric(horizontal: AppSpacing.md),
                child: SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(strokeWidth: 2),
                ),
              ),
            )
          else
            TextButton(
              onPressed: _submit,
              child: const Text('Publier'),
            ),
        ],
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(AppSpacing.paddingScreen),
          children: [
            // Catégorie sélectionnée
            Container(
              padding: const EdgeInsets.all(AppSpacing.paddingCard),
              decoration: BoxDecoration(
                color: AppColors.surfaceVariant,
                borderRadius: BorderRadius.circular(AppSpacing.radiusMedium),
              ),
              child: Row(
                children: [
                  const Icon(Icons.folder, color: AppColors.primary),
                  const SizedBox(width: AppSpacing.sm),
                  Text(
                    'Catégorie: ',
                    style: AppTextStyles.bodyMedium.copyWith(
                      color: AppColors.textSecondary,
                    ),
                  ),
                  Text(
                    widget.category.name,
                    style: AppTextStyles.bodyMedium.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppSpacing.xl),

            // Titre
            const Text(
              'Titre du sujet',
              style: AppTextStyles.h6,
            ),
            const SizedBox(height: AppSpacing.sm),
            TextFormField(
              controller: _titleController,
              decoration: const InputDecoration(
                hintText: 'Entrez un titre clair et descriptif',
                border: OutlineInputBorder(),
                contentPadding: EdgeInsets.all(AppSpacing.md),
              ),
              maxLength: 200,
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return 'Le titre est requis';
                }
                if (value.trim().length < 5) {
                  return 'Le titre doit contenir au moins 5 caractères';
                }
                return null;
              },
            ),
            const SizedBox(height: AppSpacing.xl),

            // Contenu
            const Text(
              'Contenu',
              style: AppTextStyles.h6,
            ),
            const SizedBox(height: AppSpacing.sm),
            TextFormField(
              controller: _contentController,
              decoration: const InputDecoration(
                hintText: 'Décrivez votre sujet en détail...',
                border: OutlineInputBorder(),
                contentPadding: EdgeInsets.all(AppSpacing.md),
                alignLabelWithHint: true,
              ),
              maxLines: 10,
              maxLength: 5000,
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return 'Le contenu est requis';
                }
                if (value.trim().length < 20) {
                  return 'Le contenu doit contenir au moins 20 caractères';
                }
                return null;
              },
            ),
            const SizedBox(height: AppSpacing.xl),

            // Conseils
            Container(
              padding: const EdgeInsets.all(AppSpacing.paddingCard),
              decoration: BoxDecoration(
                color: AppColors.info.withOpacity(0.1),
                borderRadius: BorderRadius.circular(AppSpacing.radiusMedium),
                border: Border.all(
                  color: AppColors.info.withOpacity(0.3),
                  width: 1,
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: const [
                      Icon(Icons.lightbulb, size: 20, color: AppColors.info),
                      SizedBox(width: AppSpacing.sm),
                      Text(
                        'Conseils',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          color: AppColors.info,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  Text(
                    '• Utilisez un titre clair et descriptif\n'
                    '• Développez votre question ou sujet\n'
                    '• Soyez respectueux envers les autres\n'
                    '• Évitez le langage offensant',
                    style: AppTextStyles.bodySmall.copyWith(
                      color: AppColors.info,
                      height: 1.6,
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
}
