const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Créer les dossiers uploads s'ils n'existent pas
const uploadDir = path.join(__dirname, '../uploads');
const imagesDir = path.join(uploadDir, 'images');
const videosDir = path.join(uploadDir, 'videos');
const documentsDir = path.join(uploadDir, 'documents');

[uploadDir, imagesDir, videosDir, documentsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configuration du stockage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'images';
    
    if (file.mimetype.startsWith('video/')) {
      folder = 'videos';
    } else if (file.mimetype.startsWith('application/')) {
      folder = 'documents';
    }
    
    cb(null, path.join(uploadDir, folder));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Filtre des types de fichiers
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/mpeg',
    'application/pdf'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Type de fichier non autorisé'), false);
  }
};

// Configuration de multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB max
  }
});

module.exports = upload;
