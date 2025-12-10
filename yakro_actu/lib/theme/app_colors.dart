import 'package:flutter/material.dart';

/// Système de couleurs inspiré de la Côte d'Ivoire (Orange #FF8C00)
class AppColors {
  // Couleur principale unique (brand)
  static const primary = Color(0xFFFF8C00); // Orange Yakro / Côte d'Ivoire
  static const primaryDark = Color(0xFFE67E00);
  static const primaryLight = Color(0xFFFFA726);

  // On garde une secondaire verte mais utilisée avec parcimonie
  static const secondary = Color(0xFF009E60); // Vert ivoirien
  static const secondaryDark = Color(0xFF00854D);
  static const secondaryLight = Color(0xFF00C853);

  static const accent = primary; // Une seule couleur forte

  // Couleurs de fond (light)
  static const background = Color(0xFFFAFAFA);
  static const surface = Color(0xFFFFFFFF);
  static const surfaceVariant = Color(0xFFF4F4F4);

  // Couleurs de texte (light)
  static const textPrimary = Color(0xFF212121);
  static const textSecondary = Color(0xFF757575);
  static const textTertiary = Color(0xFF9E9E9E);
  static const textOnPrimary = Color(0xFFFFFFFF);

  // Couleurs de statut
  static const success = Color(0xFF00C853);
  static const warning = Color(0xFFFFB300);
  static const error = Color(0xFFE53935);
  static const info = Color(0xFF039BE5);

  // Couleurs pour les états éditoriaux
  static const breaking = Color(0xFFE53935);
  static const live = Color(0xFFFF1744);
  static const featured = primary;

  // Couleurs par catégorie (palette cohérente avec le thème orange)
  static const categoryColors = {
    'sport': Color(0xFF1E88E5), // Bleu sport
    'politique': Color(0xFF8E24AA), // Violet politique
    'economie': Color(0xFF00897B), // Vert émeraude
    'culture': Color(0xFFD81B60), // Rose culture
    'sante': Color(0xFF43A047), // Vert santé
    'technologie': Color(0xFF3949AB), // Indigo tech
    'faits-divers': Color(0xFF6D4C41), // Brun faits divers
    'education': Color(0xFF00ACC1), // Cyan éducation
    'environnement': Color(0xFF7CB342), // Vert lime environnement
    'international': Color(0xFF5E35B1), // Violet foncé international
  };

  // Couleurs pour les sections spéciales
  static const videoColor = Color(0xFFE53935); // Rouge vidéo/YouTube
  static const pharmacieColor = Color(0xFF00897B); // Vert croix pharmacie
  static const eventColor = Color(0xFFFB8C00); // Orange événement
  static const meteoColor = Color(0xFF039BE5); // Bleu ciel météo
  static const titrologieColor = Color(0xFF6A1B9A); // Violet titrologie

  // Gradients
  static const primaryGradient = LinearGradient(
    colors: [primary, primaryLight],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const secondaryGradient = LinearGradient(
    colors: [secondary, secondaryLight],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  // Ombres
  static List<BoxShadow> cardShadow = [
    BoxShadow(
      color: Colors.black.withOpacity(0.06),
      blurRadius: 8,
      offset: const Offset(0, 2),
    ),
  ];

  static List<BoxShadow> elevatedShadow = [
    BoxShadow(
      color: Colors.black.withOpacity(0.12),
      blurRadius: 16,
      offset: const Offset(0, 4),
    ),
  ];

  // Dark mode
  static const darkBackground = Color(0xFF121212);
  static const darkSurface = Color(0xFF1E1E1E);
  static const darkSurfaceVariant = Color(0xFF2A2A2A);
  static const darkTextPrimary = Color(0xFFE0E0E0);
  static const darkTextSecondary = Color(0xFFB0B0B0);
  static const darkTextTertiary = Color(0xFF808080);

  // Helper pour obtenir la couleur d'une catégorie
  static Color getCategoryColor(String? categoryName) {
    if (categoryName == null) return primary;
    final key = categoryName.toLowerCase().trim();
    return categoryColors[key] ?? primary;
  }

  // Helper pour parser une couleur depuis une string hex (ex: "#1E88E5")
  static Color parseColor(String? colorHex, {Color? fallback}) {
    if (colorHex == null || colorHex.isEmpty) {
      return fallback ?? primary;
    }
    
    try {
      // Supprimer le # si présent
      String hexColor = colorHex.replaceAll('#', '');
      
      // Ajouter l'opacité FF si non présente
      if (hexColor.length == 6) {
        hexColor = 'FF$hexColor';
      }
      
      return Color(int.parse(hexColor, radix: 16));
    } catch (e) {
      return fallback ?? primary;
    }
  }
}
