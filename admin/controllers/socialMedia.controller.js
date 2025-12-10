const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllSocialMedia = async (req, res) => {
  try {
    const { isActive } = req.query;
    const where = {};
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const socialMedia = await prisma.socialMedia.findMany({
      where,
      orderBy: { order: 'asc' }
    });

    res.json({ success: true, data: socialMedia });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createSocialMedia = async (req, res) => {
  try {
    const { platform, name, url, icon, order, isActive } = req.body;
    
    if (!platform || !name || !url) {
      return res.status(400).json({ success: false, message: 'Données manquantes' });
    }

    const socialMedia = await prisma.socialMedia.create({
      data: { platform, name, url, icon, order: order || 0, isActive: isActive !== undefined ? isActive : true }
    });

    res.status(201).json({ success: true, message: 'Réseau social ajouté', data: socialMedia });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateSocialMedia = async (req, res) => {
  try {
    const { platform, name, url, icon, order, isActive } = req.body;

    const socialMedia = await prisma.socialMedia.update({
      where: { id: parseInt(req.params.id) },
      data: {
        ...(platform && { platform }),
        ...(name && { name }),
        ...(url && { url }),
        ...(icon !== undefined && { icon }),
        ...(order !== undefined && { order }),
        ...(isActive !== undefined && { isActive })
      }
    });

    res.json({ success: true, message: 'Réseau social mis à jour', data: socialMedia });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteSocialMedia = async (req, res) => {
  try {
    await prisma.socialMedia.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ success: true, message: 'Réseau social supprimé' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
