import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class NotificationCard extends StatelessWidget {
  final String title;
  final String message;
  final DateTime? timestamp;
  final bool isRead;
  final VoidCallback? onTap;

  const NotificationCard({
    Key? key,
    required this.title,
    required this.message,
    this.timestamp,
    this.isRead = false,
    this.onTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      color: isRead ? null : Colors.blue[50],
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: isRead ? Colors.grey : Theme.of(context).primaryColor,
          child: Icon(
            Icons.notifications,
            color: Colors.white,
          ),
        ),
        title: Text(
          title,
          style: GoogleFonts.poppins(
            fontWeight: isRead ? FontWeight.normal : FontWeight.w600,
          ),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 4),
            Text(
              message,
              style: GoogleFonts.poppins(fontSize: 14),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            if (timestamp != null) ...[
              const SizedBox(height: 4),
              Text(
                _formatTimestamp(timestamp!),
                style: GoogleFonts.poppins(
                  fontSize: 12,
                  color: Colors.grey,
                ),
              ),
            ],
          ],
        ),
        onTap: onTap,
      ),
    );
  }

  String _formatTimestamp(DateTime timestamp) {
    final now = DateTime.now();
    final difference = now.difference(timestamp);

    if (difference.inMinutes < 1) {
      return 'À l\'instant';
    } else if (difference.inHours < 1) {
      return 'Il y a ${difference.inMinutes} min';
    } else if (difference.inDays < 1) {
      return 'Il y a ${difference.inHours}h';
    } else {
      return 'Il y a ${difference.inDays}j';
    }
  }
}
