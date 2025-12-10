const prisma = require('../config/prisma');
const path = require('path');

const upload = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier fourni'
      });
    }

    const { originalname, filename, mimetype, size, path: filepath } = req.file;

    let type = 'DOCUMENT';
    if (mimetype.startsWith('image/')) type = 'IMAGE';
    else if (mimetype.startsWith('video/')) type = 'VIDEO';
    else if (mimetype.startsWith('audio/')) type = 'AUDIO';

    const media = await prisma.media.create({
      data: {
        filename: originalname,
        url: `/uploads/${type.toLowerCase()}s/${filename}`,
        type,
        mimeType: mimetype,
        size
      }
    });

    res.status(201).json({
      success: true,
      message: 'Fichier uploadé',
      data: { media }
    });
  } catch (error) {
    next(error);
  }
};

const uploadMultiple = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier fourni'
      });
    }

    const mediaPromises = req.files.map(file => {
      const { originalname, filename, mimetype, size } = file;

      let type = 'DOCUMENT';
      if (mimetype.startsWith('image/')) type = 'IMAGE';
      else if (mimetype.startsWith('video/')) type = 'VIDEO';
      else if (mimetype.startsWith('audio/')) type = 'AUDIO';

      return prisma.media.create({
        data: {
          filename: originalname,
          url: `/uploads/${type.toLowerCase()}s/${filename}`,
          type,
          mimeType: mimetype,
          size
        }
      });
    });

    const media = await Promise.all(mediaPromises);

    res.status(201).json({
      success: true,
      message: `${media.length} fichiers uploadés`,
      data: { media }
    });
  } catch (error) {
    next(error);
  }
};

const getAll = async (req, res, next) => {
  try {
    const { type, page = 1, limit = 20 } = req.query;

    const skip = (page - 1) * limit;
    const where = type ? { type } : {};

    const [media, total] = await Promise.all([
      prisma.media.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.media.count({ where })
    ]);

    res.json({
      success: true,
      data: media,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const media = await prisma.media.findUnique({
      where: { id: parseInt(id) }
    });

    if (!media) {
      return res.status(404).json({
        success: false,
        message: 'Media non trouvé'
      });
    }

    res.json({
      success: true,
      data: { media }
    });
  } catch (error) {
    next(error);
  }
};

const deleteMedia = async (req, res, next) => {
  try {
    const { id } = req.params;
    const fs = require('fs');

    const media = await prisma.media.findUnique({
      where: { id: parseInt(id) }
    });

    if (!media) {
      return res.status(404).json({
        success: false,
        message: 'Media non trouvé'
      });
    }

    // Supprimer le fichier physique
    const filepath = path.join(__dirname, '../', media.url);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }

    // Supprimer de la base de données
    await prisma.media.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Media supprimé'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  upload,
  uploadMultiple,
  getAll,
  getById,
  delete: deleteMedia
};
