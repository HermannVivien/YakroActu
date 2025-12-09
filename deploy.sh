#!/bin/bash

echo "Starting deployment process..."

# Backend
echo "Deploying backend..."

cd admin
# Installer les dépendances
npm install

# Créer le fichier .env de production
env_file=".env.production"
cat > "$env_file" << EOL
PORT=3000
MONGODB_URI=mongodb://your_mongodb_uri
JWT_SECRET=your_production_jwt_secret
JWT_EXPIRE=7d
NODE_ENV=production

# Google Maps API
GOOGLE_MAPS_API_KEY=your_production_google_maps_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key

# Redis
REDIS_HOST=your_redis_host
REDIS_PORT=6379

# Rate Limiting
RATE_LIMIT_WINDOW_MS=15 * 60 * 1000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
ALLOWED_ORIGINS=your_production_origin
EOL

# Build et démarrer le backend
npm run build
pm2 start server.js --name "yakro-actu-backend" --watch

# Frontend Flutter
echo "Deploying frontend..."
cd ../mobile

# Build l'application
flutter build web

# Copier les fichiers de build vers le serveur web
rsync -av build/web/ /var/www/yakro-actu/

# Redémarrer le serveur web
sudo systemctl restart nginx

echo "Deployment completed successfully!"
