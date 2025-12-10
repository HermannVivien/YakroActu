import 'package:flutter/material.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_spacing.dart';
import '../../theme/app_text_styles.dart';
import '../../services/api/testimony_service.dart';

class TestimonyFormScreen extends StatefulWidget {
  const TestimonyFormScreen({Key? key}) : super(key: key);

  @override
  State<TestimonyFormScreen> createState() => _TestimonyFormScreenState();
}

class _TestimonyFormScreenState extends State<TestimonyFormScreen> {
  final _formKey = GlobalKey<FormState>();
  final TestimonyService _service = TestimonyService();

  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _organizationController = TextEditingController();
  final _positionController = TextEditingController();
  final _contentController = TextEditingController();

  int _rating = 5;
  bool _isSubmitting = false;

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _organizationController.dispose();
    _positionController.dispose();
    _contentController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSubmitting = true);

    try {
      await _service.createTestimony(
        name: _nameController.text.trim(),
        email: _emailController.text.trim(),
        organization: _organizationController.text.trim().isNotEmpty
            ? _organizationController.text.trim()
            : null,
        position: _positionController.text.trim().isNotEmpty
            ? _positionController.text.trim()
            : null,
        content: _contentController.text.trim(),
        photo: null, // TODO: Add photo upload
        rating: _rating,
      );

      if (mounted) {
        Navigator.pop(context, true);
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
        title: const Text('Nouveau témoignage'),
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
              child: const Text('Envoyer'),
            ),
        ],
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(AppSpacing.paddingScreen),
          children: [
            // Info
            Container(
              padding: const EdgeInsets.all(AppSpacing.paddingCard),
              decoration: BoxDecoration(
                color: AppColors.info.withOpacity(0.1),
                borderRadius: BorderRadius.circular(AppSpacing.radiusMedium),
                border: Border.all(
                  color: AppColors.info.withOpacity(0.3),
                ),
              ),
              child: Row(
                children: [
                  const Icon(Icons.info, color: AppColors.info),
                  const SizedBox(width: AppSpacing.sm),
                  const Expanded(
                    child: Text(
                      'Votre témoignage sera publié après validation',
                      style: TextStyle(
                        color: AppColors.info,
                        fontSize: 13,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppSpacing.xl),

            // Note
            const Text('Votre évaluation', style: AppTextStyles.h6),
            const SizedBox(height: AppSpacing.md),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(5, (index) {
                return IconButton(
                  icon: Icon(
                    index < _rating ? Icons.star : Icons.star_border,
                    size: 36,
                    color: AppColors.featured,
                  ),
                  onPressed: () {
                    setState(() => _rating = index + 1);
                  },
                );
              }),
            ),
            const SizedBox(height: AppSpacing.xl),

            // Nom
            const Text('Nom complet *', style: AppTextStyles.h6),
            const SizedBox(height: AppSpacing.sm),
            TextFormField(
              controller: _nameController,
              decoration: const InputDecoration(
                hintText: 'Votre nom',
                border: OutlineInputBorder(),
              ),
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return 'Le nom est requis';
                }
                return null;
              },
            ),
            const SizedBox(height: AppSpacing.lg),

            // Email
            const Text('Email *', style: AppTextStyles.h6),
            const SizedBox(height: AppSpacing.sm),
            TextFormField(
              controller: _emailController,
              decoration: const InputDecoration(
                hintText: 'votre@email.com',
                border: OutlineInputBorder(),
              ),
              keyboardType: TextInputType.emailAddress,
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return 'L\'email est requis';
                }
                if (!value.contains('@')) {
                  return 'Email invalide';
                }
                return null;
              },
            ),
            const SizedBox(height: AppSpacing.lg),

            // Organisation
            const Text('Organisation (optionnel)', style: AppTextStyles.h6),
            const SizedBox(height: AppSpacing.sm),
            TextFormField(
              controller: _organizationController,
              decoration: const InputDecoration(
                hintText: 'Nom de votre organisation',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: AppSpacing.lg),

            // Poste
            const Text('Poste (optionnel)', style: AppTextStyles.h6),
            const SizedBox(height: AppSpacing.sm),
            TextFormField(
              controller: _positionController,
              decoration: const InputDecoration(
                hintText: 'Votre poste',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: AppSpacing.xl),

            // Témoignage
            const Text('Votre témoignage *', style: AppTextStyles.h6),
            const SizedBox(height: AppSpacing.sm),
            TextFormField(
              controller: _contentController,
              decoration: const InputDecoration(
                hintText: 'Partagez votre expérience...',
                border: OutlineInputBorder(),
                alignLabelWithHint: true,
              ),
              maxLines: 8,
              maxLength: 1000,
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return 'Le témoignage est requis';
                }
                if (value.trim().length < 20) {
                  return 'Le témoignage doit contenir au moins 20 caractères';
                }
                return null;
              },
            ),
            const SizedBox(height: AppSpacing.xl),

            // Bouton submit
            ElevatedButton(
              onPressed: _isSubmitting ? null : _submit,
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: AppSpacing.md),
              ),
              child: _isSubmitting
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Text('Envoyer le témoignage'),
            ),
          ],
        ),
      ),
    );
  }
}
