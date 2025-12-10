import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../models/local_point.dart';
import 'local_point_detail_screen.dart';

class LocalPointsList extends StatefulWidget {
  const LocalPointsList({Key? key}) : super(key: key);

  @override
  State<LocalPointsList> createState() => _LocalPointsListState();
}

class _LocalPointsListState extends State<LocalPointsList> {
  final List<LocalPoint> _localPoints = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadLocalPoints();
  }

  Future<void> _loadLocalPoints() async {
    setState(() => _isLoading = true);
    
    try {
      // TODO: Charger depuis le backend
      await Future.delayed(const Duration(seconds: 1));
      
      // Données de démonstration
      setState(() {
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erreur: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Points d\'intérêt',
          style: GoogleFonts.poppins(fontWeight: FontWeight.w600),
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _localPoints.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.location_off,
                        size: 64,
                        color: Colors.grey[400],
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'Aucun point d\'intérêt disponible',
                        style: GoogleFonts.poppins(
                          fontSize: 16,
                          color: Colors.grey,
                        ),
                      ),
                    ],
                  ),
                )
              : ListView.builder(
                  itemCount: _localPoints.length,
                  padding: const EdgeInsets.all(16),
                  itemBuilder: (context, index) {
                    final point = _localPoints[index];
                    return Card(
                      margin: const EdgeInsets.only(bottom: 16),
                      child: ListTile(
                        leading: CircleAvatar(
                          backgroundImage: point.imageUrl != null
                              ? NetworkImage(point.imageUrl!)
                              : null,
                          child: point.imageUrl == null
                              ? const Icon(Icons.place)
                              : null,
                        ),
                        title: Text(
                          point.name,
                          style: GoogleFonts.poppins(
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        subtitle: Text(
                          point.category,
                          style: GoogleFonts.poppins(),
                        ),
                        trailing: const Icon(Icons.chevron_right),
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => LocalPointDetailScreen(
                                localPoint: point,
                              ),
                            ),
                          );
                        },
                      ),
                    );
                  },
                ),
    );
  }
}
