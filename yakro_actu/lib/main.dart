import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_localizations/flutter_localizations.dart';

import 'screens/splash_screen.dart';
import 'services/theme_service.dart';
import 'services/notification_service.dart';
import 'services/location_service.dart';
import 'services/geolocation_service.dart';
import 'services/recommendation_service.dart';
import 'routes/app_routes.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialisation des services sans attendre (on les initialise dans MyApp)
  final notificationService = NotificationService();
  notificationService.init();

  final locationService = LocationService();
  locationService.init();

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => ThemeService()),
        ChangeNotifierProvider(create: (_) => NotificationService()),
        ChangeNotifierProvider(create: (_) => LocationService()),
        ChangeNotifierProvider(create: (_) => GeolocationService()),
        ChangeNotifierProvider(create: (_) => RecommendationService()),
      ],
      child: Consumer<ThemeService>(
        builder: (context, themeService, child) {
          return MaterialApp(
            title: 'Yakro Actu',
            debugShowCheckedModeBanner: false,
            theme: themeService.getTheme(),
            darkTheme: ThemeData.dark(useMaterial3: true),
            themeMode: themeService.themeMode,
            localizationsDelegates: const [
              GlobalMaterialLocalizations.delegate,
              GlobalWidgetsLocalizations.delegate,
              GlobalCupertinoLocalizations.delegate,
            ],
            supportedLocales: const [
              Locale('fr', ''), // Français
              Locale('en', ''), // Anglais
            ],
            initialRoute: AppRoutes.splash.name,
            onGenerateRoute: AppRoutes.generateRoute,
            home: const SplashScreen(),
          );
        },
      ),
    );
  }
}
