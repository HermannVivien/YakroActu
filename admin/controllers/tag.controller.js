const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Obtenir tous les tags
exports.getAllTags = async (req, res) => {
  try {
    const { search, page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    if (search) {
      where.name = { contains: search };
    }

    const [tags, total] = await Promise.all([
      prisma.tag.findMany({
        where,
        include: {
          _count: {
            select: { articles: true }
          }
        },
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.tag.count({ where })
    ]);

    res.json({
      success: true,
      data: tags,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des tags',
      error: error.message
    });
  }
};

// Créer un tag
exports.createTag = async (req, res) => {
  try {
    const { name, slug } = req.body;

    if (!name || !slug) {
      return res.status(400).json({
        success: false,
        message: 'Le nom et le slug sont requis'
      });
    }

    const tag = await prisma.tag.create({
      data: { name, slug }
    });

    res.status(201).json({
      success: true,
      message: 'Tag créé avec succès',
      data: tag
    });
  } catch (error) {
    console.error('Error creating tag:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'Un tag avec ce slug existe déjà'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du tag',
      error: error.message
    });
  }
};

// Mettre à jour un tag
exports.updateTag = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug } = req.body;

    const tag = await prisma.tag.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(slug && { slug })
      }
    });

    res.json({
      success: true,
      message: 'Tag mis à jour avec succès',
      data: tag
    });
  } catch (error) {
    console.error('Error updating tag:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du tag',
      error: error.message
    });
  }
};

// Supprimer un tag
exports.deleteTag = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.tag.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Tag supprimé avec succès'
    });
  } catch (error) {
    console.error('Error deleting tag:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du tag',
      error: error.message
    });
  }
};
