# Script PowerShell pour installer les dépendances Flutter

# Liste des dépendances à installer
$dependencies = @(
    "provider:^6.0.5",
    "firebase_core:^2.24.2",
    "firebase_auth:^4.15.3",
    "cloud_firestore:^4.13.6",
    "firebase_storage:^11.5.6",
    "firebase_messaging:^14.7.10",
    "google_sign_in:^6.1.6",
    "google_maps_flutter:^2.5.0",
    "shared_preferences:^2.2.2",
    "http:^1.1.2",
    "intl:^0.19.0"
)

# Installer chaque dépendance
foreach ($dep in $dependencies) {
    Write-Host "Installing $dep..."
    flutter pub add $dep
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Success" -ForegroundColor Green
    } else {
        Write-Host "Failed" -ForegroundColor Red
    }
}

Write-Host "Installation complete" -ForegroundColor Green
