import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ThemeService with ChangeNotifier {
  static const String _themeKey = 'theme_mode';
  static const String _accentColorKey = 'accent_color';

  ThemeMode _themeMode = ThemeMode.system;
  Color _accentColor = Colors.blue;

  ThemeMode get themeMode => _themeMode;
  Color get accentColor => _accentColor;
  bool get isDarkMode => _themeMode == ThemeMode.dark;

  Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    final themeMode = prefs.getString(_themeKey);
    final accentColor = prefs.getString(_accentColorKey);

    if (themeMode != null) {
      _themeMode = ThemeMode.values.firstWhere(
        (mode) => mode.toString() == themeMode,
        orElse: () => ThemeMode.system,
      );
    }

    if (accentColor != null) {
      try {
        _accentColor = Color(int.parse(accentColor));
      } catch (e) {
        _accentColor = Colors.blue;
      }
    }

    notifyListeners();
  }

  Future<void> toggleTheme() async {
    final prefs = await SharedPreferences.getInstance();
    
    switch (_themeMode) {
      case ThemeMode.system:
        _themeMode = ThemeMode.light;
        break;
      case ThemeMode.light:
        _themeMode = ThemeMode.dark;
        break;
      case ThemeMode.dark:
        _themeMode = ThemeMode.system;
        break;
    }

    await prefs.setString(_themeKey, _themeMode.toString());
    notifyListeners();
  }

  Future<void> setAccentColor(Color color) async {
    final prefs = await SharedPreferences.getInstance();
    _accentColor = color;
    await prefs.setString(_accentColorKey, color.value.toString());
    notifyListeners();
  }

  ThemeData getTheme() {
    return ThemeData(
      colorScheme: ColorScheme.fromSeed(
        seedColor: _accentColor,
        brightness: _themeMode == ThemeMode.dark ? Brightness.dark : Brightness.light,
      ),
      useMaterial3: true,
      appBarTheme: AppBarTheme(
        backgroundColor: _themeMode == ThemeMode.dark ? Colors.black : Colors.white,
        elevation: 0,
        titleTextStyle: TextStyle(
          color: _themeMode == ThemeMode.dark ? Colors.white : Colors.black,
          fontSize: 20,
          fontWeight: FontWeight.w600,
        ),
      ),
      scaffoldBackgroundColor: _themeMode == ThemeMode.dark 
          ? const Color(0xFF121212) 
          : const Color(0xFFF5F5F5),
      cardTheme: CardThemeData(
        color: _themeMode == ThemeMode.dark 
            ? const Color(0xFF212121) 
            : Colors.white,
        elevation: 2,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
      textTheme: TextTheme(
        titleLarge: TextStyle(
          color: _themeMode == ThemeMode.dark ? Colors.white : Colors.black,
          fontSize: 24,
          fontWeight: FontWeight.bold,
        ),
        titleMedium: TextStyle(
          color: _themeMode == ThemeMode.dark ? Colors.white : Colors.black,
          fontSize: 20,
          fontWeight: FontWeight.w600,
        ),
        bodyLarge: TextStyle(
          color: _themeMode == ThemeMode.dark ? Colors.white : Colors.black,
          fontSize: 16,
        ),
      ),
    );
  }
}
