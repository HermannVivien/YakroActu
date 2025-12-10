import 'package:flutter/material.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_text_styles.dart';
import '../../theme/app_spacing.dart';
import '../../models/event.dart';
import '../../services/mock/mock_data_service.dart';

class EventsScreen extends StatefulWidget {
  const EventsScreen({Key? key}) : super(key: key);

  @override
  State<EventsScreen> createState() => _EventsScreenState();
}

class _EventsScreenState extends State<EventsScreen> with SingleTickerProviderStateMixin {
  bool _isLoading = true;
  List<Event> _events = [];
  late AnimationController _animationController;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 400),
    );
    _loadEvents();
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  Future<void> _loadEvents() async {
    setState(() => _isLoading = true);
    
    // Simulate API delay
    await Future.delayed(const Duration(milliseconds: 800));
    
    // Use mock data
    setState(() {
      _events = MockDataService.getMockEvents();
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
        title: Text('Événements', style: AppTextStyles.h5.copyWith(color: AppColors.textPrimary)),
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: AppColors.textPrimary),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          IconButton(
            icon: Icon(Icons.filter_list, color: AppColors.eventColor),
            onPressed: () {
              // TODO: Show filters
            },
          ),
        ],
      ),
      body: _isLoading 
        ? _buildLoadingState()
        : RefreshIndicator(
            onRefresh: _loadEvents,
            child: _events.isEmpty 
              ? _buildEmptyState() 
              : _buildEventsList(),
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
              valueColor: AlwaysStoppedAnimation<Color>(AppColors.eventColor),
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
          Icon(Icons.event, size: 80, color: AppColors.textTertiary),
          const SizedBox(height: 16),
          Text('Aucun événement', style: AppTextStyles.h6.copyWith(color: AppColors.textSecondary)),
          const SizedBox(height: 8),
          Text('Tirez pour actualiser', style: AppTextStyles.bodySmall.copyWith(color: AppColors.textTertiary)),
        ],
      ),
    );
  }

  Widget _buildEventsList() {
    return ListView.builder(
      padding: const EdgeInsets.all(AppSpacing.paddingScreen),
      itemCount: _events.length,
      itemBuilder: (context, index) {
        final event = _events[index];
        return SlideTransition(
          position: Tween<Offset>(
            begin: const Offset(0.3, 0),
            end: Offset.zero,
          ).animate(
            CurvedAnimation(
              parent: _animationController,
              curve: Interval(
                index * 0.15,
                1.0,
                curve: Curves.easeOutCubic,
              ),
            ),
          ),
          child: FadeTransition(
            opacity: Tween<double>(begin: 0.0, end: 1.0).animate(
              CurvedAnimation(
                parent: _animationController,
                curve: Interval(
                  index * 0.15,
                  1.0,
                  curve: Curves.easeOut,
                ),
              ),
            ),
            child: _buildEventCard(event),
          ),
        );
      },
    );
  }

  Widget _buildEventCard(Event event) {
    final eventColor = AppColors.getCategoryColor(event.category);
    final now = DateTime.now();
    final isPast = event.date.isBefore(now);
    final isToday = event.date.day == now.day && 
                    event.date.month == now.month && 
                    event.date.year == now.year;

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () => _showEventDetails(event),
          borderRadius: BorderRadius.circular(16),
          child: Ink(
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: isToday ? eventColor.withOpacity(0.5) : AppColors.surfaceVariant,
                width: isToday ? 2 : 1,
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.04),
                  blurRadius: 10,
                  offset: const Offset(0, 3),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Date Badge & Title
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Date Badge
                      Container(
                        width: 60,
                        height: 70,
                        decoration: BoxDecoration(
                          color: isPast 
                            ? AppColors.surfaceVariant
                            : eventColor.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: isPast ? AppColors.textTertiary : eventColor,
                            width: 1.5,
                          ),
                        ),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              event.date.day.toString(),
                              style: AppTextStyles.h4.copyWith(
                                color: isPast ? AppColors.textTertiary : eventColor,
                                fontWeight: FontWeight.bold,
                                fontSize: 24,
                              ),
                            ),
                            Text(
                              ['JAN', 'FEV', 'MAR', 'AVR', 'MAI', 'JUN', 
                               'JUL', 'AOU', 'SEP', 'OCT', 'NOV', 'DEC'][event.date.month - 1],
                              style: AppTextStyles.caption.copyWith(
                                color: isPast ? AppColors.textTertiary : eventColor,
                                fontWeight: FontWeight.w600,
                                fontSize: 11,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 14),
                      // Title & Category
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            if (isToday)
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                margin: const EdgeInsets.only(bottom: 6),
                                decoration: BoxDecoration(
                                  color: eventColor.withOpacity(0.15),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Text(
                                  'AUJOURD\'HUI',
                                  style: AppTextStyles.caption.copyWith(
                                    color: eventColor,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 10,
                                  ),
                                ),
                              ),
                            Text(
                              event.title,
                              style: AppTextStyles.bodyMedium.copyWith(
                                fontWeight: FontWeight.w600,
                                fontSize: 15,
                                color: isPast ? AppColors.textSecondary : AppColors.textPrimary,
                              ),
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 4),
                            Text(
                              event.category.toUpperCase(),
                              style: AppTextStyles.caption.copyWith(
                                color: eventColor,
                                fontWeight: FontWeight.w600,
                                fontSize: 10,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                
                // Divider
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Container(
                    height: 1,
                    color: AppColors.surfaceVariant,
                  ),
                ),
                
                // Details
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    children: [
                      _buildEventInfoRow(
                        Icons.access_time,
                        event.time,
                        eventColor,
                      ),
                      const SizedBox(height: 10),
                      _buildEventInfoRow(
                        Icons.location_on,
                        event.location,
                        eventColor,
                      ),
                      const SizedBox(height: 10),
                      _buildEventInfoRow(
                        Icons.confirmation_number,
                        event.price,
                        eventColor,
                      ),
                    ],
                  ),
                ),
                
                // Action Button
                if (!isPast)
                  Padding(
                    padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                    child: SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: () => _registerForEvent(event),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: eventColor,
                          foregroundColor: Colors.white,
                          elevation: 0,
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                        ),
                        child: Text(
                          'S\'inscrire',
                          style: AppTextStyles.bodyMedium.copyWith(
                            fontWeight: FontWeight.w600,
                            fontSize: 14,
                          ),
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildEventInfoRow(IconData icon, String text, Color color) {
    return Row(
      children: [
        Icon(icon, size: 16, color: color),
        const SizedBox(width: 10),
        Expanded(
          child: Text(
            text,
            style: AppTextStyles.bodySmall.copyWith(
              fontSize: 13,
              color: AppColors.textSecondary,
            ),
          ),
        ),
      ],
    );
  }

  void _showEventDetails(Event event) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.7,
        minChildSize: 0.5,
        maxChildSize: 0.95,
        expand: false,
        builder: (context, scrollController) => SingleChildScrollView(
          controller: scrollController,
          child: Container(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Container(
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                      color: AppColors.surfaceVariant,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                const SizedBox(height: 20),
                Text(event.title, style: AppTextStyles.h5),
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.getCategoryColor(event.category).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    event.category.toUpperCase(),
                    style: AppTextStyles.caption.copyWith(
                      color: AppColors.getCategoryColor(event.category),
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
                const SizedBox(height: 20),
                Text('Description', style: AppTextStyles.h6),
                const SizedBox(height: 8),
                Text(event.description, style: AppTextStyles.bodyMedium),
                const SizedBox(height: 20),
                _buildDetailRow(Icons.calendar_today, 
                  '${event.date.day}/${event.date.month}/${event.date.year}'),
                _buildDetailRow(Icons.access_time, event.time),
                _buildDetailRow(Icons.location_on, event.location),
                _buildDetailRow(Icons.person, event.organizer),
                _buildDetailRow(Icons.people, '${event.capacity} places'),
                _buildDetailRow(Icons.confirmation_number, event.price),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () {
                      Navigator.pop(context);
                      _registerForEvent(event);
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.eventColor,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                    ),
                    child: const Text('S\'inscrire à l\'événement'),
                  ),
                ),
              ],
            ),
          ),
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

  void _registerForEvent(Event event) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Inscription à ${event.title}')),
    );
  }
}
