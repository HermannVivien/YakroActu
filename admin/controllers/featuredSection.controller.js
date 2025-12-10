const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllFeaturedSections = async (req, res) => {
  try {
    const sections = await prisma.featuredSection.findMany({
      orderBy: { order: 'asc' }
    });
    res.json({ success: true, data: sections });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getFeaturedSectionById = async (req, res) => {
  try {
    const section = await prisma.featuredSection.findUnique({
      where: { id: parseInt(req.params.id) }
    });
    if (!section) {
      return res.status(404).json({ success: false, message: 'Section non trouvée' });
    }
    res.json({ success: true, data: section });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createFeaturedSection = async (req, res) => {
  try {
    const { title, description, articleIds, order, isActive } = req.body;
    
    if (!title || !articleIds) {
      return res.status(400).json({ success: false, message: 'Titre et articles requis' });
    }

    const section = await prisma.featuredSection.create({
      data: { title, description, articleIds, order: order || 0, isActive: isActive !== undefined ? isActive : true }
    });

    res.status(201).json({ success: true, message: 'Section créée', data: section });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateFeaturedSection = async (req, res) => {
  try {
    const { title, description, articleIds, order, isActive } = req.body;

    const section = await prisma.featuredSection.update({
      where: { id: parseInt(req.params.id) },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(articleIds && { articleIds }),
        ...(order !== undefined && { order }),
        ...(isActive !== undefined && { isActive })
      }
    });

    res.json({ success: true, message: 'Section mise à jour', data: section });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteFeaturedSection = async (req, res) => {
  try {
    await prisma.featuredSection.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ success: true, message: 'Section supprimée' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
