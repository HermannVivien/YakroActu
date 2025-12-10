const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Obtenir toutes les breaking news
exports.getAllBreakingNews = async (req, res) => {
  try {
    const { page = 1, limit = 10, isActive } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const [news, total] = await Promise.all([
      prisma.breakingNews.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' }
        ]
      }),
      prisma.breakingNews.count({ where })
    ]);

    res.json({
      success: true,
      data: news,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching breaking news:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des breaking news',
      error: error.message
    });
  }
};

// Créer une breaking news
exports.createBreakingNews = async (req, res) => {
  try {
    const { title, content, priority, link, isActive, expiresAt } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Le titre et le contenu sont requis'
      });
    }

    const news = await prisma.breakingNews.create({
      data: {
        title,
        content,
        priority: priority || 'MEDIUM',
        link,
        isActive: isActive !== undefined ? isActive : true,
        expiresAt: expiresAt ? new Date(expiresAt) : null
      }
    });

    res.status(201).json({
      success: true,
      message: 'Breaking news créée avec succès',
      data: news
    });
  } catch (error) {
    console.error('Error creating breaking news:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la breaking news',
      error: error.message
    });
  }
};

// Mettre à jour une breaking news
exports.updateBreakingNews = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, priority, link, isActive, expiresAt } = req.body;

    const news = await prisma.breakingNews.update({
      where: { id: parseInt(id) },
      data: {
        ...(title && { title }),
        ...(content && { content }),
        ...(priority && { priority }),
        ...(link !== undefined && { link }),
        ...(isActive !== undefined && { isActive }),
        ...(expiresAt !== undefined && { expiresAt: expiresAt ? new Date(expiresAt) : null })
      }
    });

    res.json({
      success: true,
      message: 'Breaking news mise à jour avec succès',
      data: news
    });
  } catch (error) {
    console.error('Error updating breaking news:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la breaking news',
      error: error.message
    });
  }
};

// Supprimer une breaking news
exports.deleteBreakingNews = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.breakingNews.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Breaking news supprimée avec succès'
    });
  } catch (error) {
    console.error('Error deleting breaking news:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la breaking news',
      error: error.message
    });
  }
};
