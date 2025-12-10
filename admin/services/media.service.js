const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

/**
 * Service de gestion des médias
 */
class MediaService {
  constructor() {
    this.uploadDir = path.join(__dirname, '..', 'uploads');
    this.allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    this.maxSize = parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024; // 5MB
  }

  /**
   * Configuration du stockage
   */
  getStorage() {
    return multer.diskStorage({
      destination: async (req, file, cb) => {
        const uploadPath = path.join(this.uploadDir, this.getUploadFolder());
        await fs.mkdir(uploadPath, { recursive: true });
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
      }
    });
  }

  /**
   * Dossier d'upload par date
   */
  getUploadFolder() {
    const now = new Date();
    return `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  /**
   * Filtrer les fichiers
   */
  fileFilter(req, file, cb) {
    if (this.allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Type de fichier non autorisé. Utilisez JPG, PNG, WEBP ou GIF.'), false);
    }
  }

  /**
   * Configuration Multer
   */
  getMulterConfig() {
    return multer({
      storage: this.getStorage(),
      fileFilter: this.fileFilter.bind(this),
      limits: {
        fileSize: this.maxSize
      }
    });
  }

  /**
   * Upload simple
   */
  single(fieldName) {
    return this.getMulterConfig().single(fieldName);
  }

  /**
   * Upload multiple
   */
  multiple(fieldName, maxCount = 10) {
    return this.getMulterConfig().array(fieldName, maxCount);
  }

  /**
   * Supprimer un fichier
   */
  async deleteFile(filePath) {
    try {
      const fullPath = path.join(this.uploadDir, filePath);
      await fs.unlink(fullPath);
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      return false;
    }
  }

  /**
   * Obtenir l'URL publique
   */
  getPublicUrl(req, filePath) {
    return `${req.protocol}://${req.get('host')}/uploads/${filePath}`;
  }
}

module.exports = new MediaService();
