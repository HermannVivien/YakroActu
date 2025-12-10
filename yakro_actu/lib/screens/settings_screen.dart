import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../services/theme_service.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Paramètres',
          style: GoogleFonts.poppins(fontWeight: FontWeight.w600),
        ),
      ),
      body: ListView(
        children: [
          _buildSection(
            context,
            title: 'Apparence',
            children: [
              Consumer<ThemeService>(
                builder: (context, themeService, child) {
                  return SwitchListTile(
                    title: const Text('Mode sombre'),
                    subtitle: const Text('Activer le thème sombre'),
                    value: themeService.isDarkMode,
                    onChanged: (value) {
                      themeService.toggleTheme();
                    },
                    secondary: Icon(
                      themeService.isDarkMode
                          ? Icons.dark_mode
                          : Icons.light_mode,
                    ),
                  );
                },
              ),
            ],
          ),
          
          _buildSection(
            context,
            title: 'Notifications',
            children: [
              SwitchListTile(
                title: const Text('Notifications push'),
                subtitle: const Text('Recevoir des notifications'),
                value: true,
                onChanged: (value) {
                  // TODO: Implémenter
                },
                secondary: const Icon(Icons.notifications),
              ),
              SwitchListTile(
                title: const Text('Flash infos'),
                subtitle: const Text('Alertes d\'actualités urgentes'),
                value: true,
                onChanged: (value) {
                  // TODO: Implémenter
                },
                secondary: const Icon(Icons.bolt),
              ),
            ],
          ),

          _buildSection(
            context,
            title: 'Compte',
            children: [
              ListTile(
                leading: const Icon(Icons.person),
                title: const Text('Profil'),
                subtitle: const Text('Gérer votre profil'),
                trailing: const Icon(Icons.chevron_right),
                onTap: () {
                  // TODO: Naviguer vers le profil
                },
              ),
              ListTile(
                leading: const Icon(Icons.lock),
                title: const Text('Confidentialité'),
                subtitle: const Text('Paramètres de confidentialité'),
                trailing: const Icon(Icons.chevron_right),
                onTap: () {
                  // TODO: Naviguer vers confidentialité
                },
              ),
            ],
          ),

          _buildSection(
            context,
            title: 'À propos',
            children: [
              ListTile(
                leading: const Icon(Icons.info),
                title: const Text('À propos de l\'application'),
                subtitle: const Text('Version 1.0.0'),
                trailing: const Icon(Icons.chevron_right),
                onTap: () {
                  // TODO: Afficher À propos
                },
              ),
              ListTile(
                leading: const Icon(Icons.privacy_tip),
                title: const Text('Politique de confidentialité'),
                trailing: const Icon(Icons.chevron_right),
                onTap: () {
                  // TODO: Afficher politique
                },
              ),
              ListTile(
                leading: const Icon(Icons.description),
                title: const Text('Conditions d\'utilisation'),
                trailing: const Icon(Icons.chevron_right),
                onTap: () {
                  // TODO: Afficher conditions
                },
              ),
            ],
          ),

          const SizedBox(height: 16),
          
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: ElevatedButton.icon(
              onPressed: () {
                // TODO: Implémenter la déconnexion
                showDialog(
                  context: context,
                  builder: (context) => AlertDialog(
                    title: const Text('Déconnexion'),
                    content: const Text('Voulez-vous vraiment vous déconnecter ?'),
                    actions: [
                      TextButton(
                        onPressed: () => Navigator.pop(context),
                        child: const Text('Annuler'),
                      ),
                      ElevatedButton(
                        onPressed: () {
                          Navigator.pop(context);
                          // TODO: Déconnexion
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.red,
                        ),
                        child: const Text('Déconnexion'),
                      ),
                    ],
                  ),
                );
              },
              icon: const Icon(Icons.logout),
              label: const Text('Se déconnecter'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red,
                minimumSize: const Size(double.infinity, 50),
              ),
            ),
          ),
          const SizedBox(height: 32),
        ],
      ),
    );
  }

  Widget _buildSection(
    BuildContext context, {
    required String title,
    required List<Widget> children,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
          child: Text(
            title,
            style: GoogleFonts.poppins(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: Theme.of(context).primaryColor,
            ),
          ),
        ),
        ...children,
        const Divider(),
      ],
    );
  }
}
