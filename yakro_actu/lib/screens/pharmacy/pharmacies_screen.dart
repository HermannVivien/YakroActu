import 'package:flutter/material.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_text_styles.dart';
import '../../theme/app_spacing.dart';
import '../../models/pharmacy.dart';
import '../../services/mock/mock_data_service.dart';

class PharmaciesScreen extends StatefulWidget {
  const PharmaciesScreen({Key? key}) : super(key: key);

  @override
  State<PharmaciesScreen> createState() => _PharmaciesScreenState();
}

class _PharmaciesScreenState extends State<PharmaciesScreen> with SingleTickerProviderStateMixin {
  bool _isLoading = true;
  List<Pharmacy> _pharmacies = [];
  late AnimationController _animationController;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );
    _loadPharmacies();
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  Future<void> _loadPharmacies() async {
    setState(() => _isLoading = true);
    
    // Simulate API delay
    await Future.delayed(const Duration(milliseconds: 800));
    
    // Use mock data
    setState(() {
      _pharmacies = MockDataService.getMockPharmacies();
      _isLoading = false;
    });
    _animationController.forward();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        elevation: 0,
        backgroundColor: Colors.transparent,
        title: Text('Pharmacies de garde', style: AppTextStyles.h5.copyWith(color: AppColors.textPrimary)),
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: AppColors.textPrimary),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          IconButton(
            icon: Icon(Icons.map, color: AppColors.pharmacieColor),
            onPressed: () {
              // TODO: Open map view
            },
          ),
        ],
      ),
      body: _isLoading 
        ? _buildLoadingState()
        : RefreshIndicator(
            onRefresh: _loadPharmacies,
            child: _pharmacies.isEmpty 
              ? _buildEmptyState() 
              : _buildPharmacyList(),
          ),
    );
  }

  Widget _buildLoadingState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          SizedBox(
            width: 50,
            height: 50,
            child: CircularProgressIndicator(
              strokeWidth: 3,
              valueColor: AlwaysStoppedAnimation<Color>(AppColors.pharmacieColor),
            ),
          ),
          const SizedBox(height: 16),
          Text('Chargement...', style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary)),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.local_pharmacy, size: 80, color: AppColors.textTertiary),
          const SizedBox(height: 16),
          Text('Aucune pharmacie de garde', style: AppTextStyles.h6.copyWith(color: AppColors.textSecondary)),
          const SizedBox(height: 8),
          Text('Tirez pour actualiser', style: AppTextStyles.bodySmall.copyWith(color: AppColors.textTertiary)),
        ],
      ),
    );
  }

  Widget _buildPharmacyList() {
    return ListView.builder(
      padding: const EdgeInsets.all(AppSpacing.paddingScreen),
      itemCount: _pharmacies.length,
      itemBuilder: (context, index) {
        final pharmacy = _pharmacies[index];
        return FadeTransition(
          opacity: Tween<double>(begin: 0.0, end: 1.0).animate(
            CurvedAnimation(
              parent: _animationController,
              curve: Interval(
                index * 0.1,
                1.0,
                curve: Curves.easeOut,
              ),
            ),
          ),
          child: _buildPharmacyCard(pharmacy),
        );
      },
    );
  }

  Widget _buildPharmacyCard(Pharmacy pharmacy) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () => _showPharmacyDetails(pharmacy),
          borderRadius: BorderRadius.circular(12),
          child: Ink(
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.surfaceVariant, width: 1),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.03),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  Container(
                    width: 56,
                    height: 56,
                    decoration: BoxDecoration(
                      color: pharmacy.isOnDuty 
                        ? AppColors.pharmacieColor.withOpacity(0.1)
                        : AppColors.surfaceVariant,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(
                      Icons.local_pharmacy,
                      color: pharmacy.isOnDuty ? AppColors.pharmacieColor : AppColors.textTertiary,
                      size: 28,
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: Text(
                                pharmacy.name,
                                style: AppTextStyles.bodyMedium.copyWith(
                                  fontWeight: FontWeight.w600,
                                  fontSize: 15,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                            if (pharmacy.isOnDuty)
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(
                                  color: AppColors.success.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Text(
                                  'DE GARDE',
                                  style: AppTextStyles.caption.copyWith(
                                    color: AppColors.success,
                                    fontWeight: FontWeight.w600,
                                    fontSize: 10,
                                  ),
                                ),
                              ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Row(
                          children: [
                            Icon(Icons.location_on, size: 14, color: AppColors.textTertiary),
                            const SizedBox(width: 4),
                            Expanded(
                              child: Text(
                                pharmacy.address,
                                style: AppTextStyles.caption.copyWith(
                                  color: AppColors.textSecondary,
                                  fontSize: 12,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        if (pharmacy.openingHours != null)
                          Row(
                            children: [
                              Icon(Icons.access_time, size: 14, color: AppColors.textTertiary),
                              const SizedBox(width: 4),
                              Text(
                                pharmacy.openingHours!,
                                style: AppTextStyles.caption.copyWith(
                                  color: AppColors.textSecondary,
                                  fontSize: 12,
                                ),
                              ),
                            ],
                          ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  Column(
                    children: [
                      IconButton(
                        icon: Icon(Icons.phone, color: AppColors.pharmacieColor, size: 22),
                        onPressed: () => _callPharmacy(pharmacy),
                        padding: EdgeInsets.zero,
                        constraints: const BoxConstraints(),
                      ),
                      const SizedBox(height: 8),
                      IconButton(
                        icon: Icon(Icons.directions, color: AppColors.pharmacieColor, size: 22),
                        onPressed: () => _getDirections(pharmacy),
                        padding: EdgeInsets.zero,
                        constraints: const BoxConstraints(),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  void _showPharmacyDetails(Pharmacy pharmacy) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => Container(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: AppColors.pharmacieColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(Icons.local_pharmacy, color: AppColors.pharmacieColor),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(pharmacy.name, style: AppTextStyles.h6),
                      Text(
                        pharmacy.isOnDuty ? 'De garde' : 'Pas de garde',
                        style: AppTextStyles.caption.copyWith(
                          color: pharmacy.isOnDuty ? AppColors.success : AppColors.error,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            _buildDetailRow(Icons.location_on, pharmacy.address),
            _buildDetailRow(Icons.phone, pharmacy.phone),
            if (pharmacy.openingHours != null)
              _buildDetailRow(Icons.access_time, pharmacy.openingHours!),
            const SizedBox(height: 20),
            Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () {
                      Navigator.pop(context);
                      _callPharmacy(pharmacy);
                    },
                    icon: const Icon(Icons.phone),
                    label: const Text('Appeler'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.pharmacieColor,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () {
                      Navigator.pop(context);
                      _getDirections(pharmacy);
                    },
                    icon: const Icon(Icons.directions),
                    label: const Text('Itinéraire'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.pharmacieColor,
                      side: BorderSide(color: AppColors.pharmacieColor),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailRow(IconData icon, String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        children: [
          Icon(icon, size: 18, color: AppColors.textTertiary),
          const SizedBox(width: 12),
          Expanded(
            child: Text(text, style: AppTextStyles.bodyMedium),
          ),
        ],
      ),
    );
  }

  void _callPharmacy(Pharmacy pharmacy) {
    // TODO: Implement phone call
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Appel: ${pharmacy.phone}')),
    );
  }

  void _getDirections(Pharmacy pharmacy) {
    // TODO: Implement navigation
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Ouverture de l\'itinéraire...')),
    );
  }
}
