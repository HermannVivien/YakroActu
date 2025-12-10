const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Obtenir toutes les sous-catégories
exports.getAllSubcategories = async (req, res) => {
  try {
    const { categoryId, search, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    if (categoryId) where.categoryId = parseInt(categoryId);
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } }
      ];
    }

    const [subcategories, total] = await Promise.all([
      prisma.subcategory.findMany({
        where,
        include: {
          category: {
            select: { id: true, name: true, slug: true }
          }
        },
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { order: 'asc' }
      }),
      prisma.subcategory.count({ where })
    ]);

    res.json({
      success: true,
      data: subcategories,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des sous-catégories',
      error: error.message
    });
  }
};

// Obtenir une sous-catégorie par ID
exports.getSubcategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const subcategory = await prisma.subcategory.findUnique({
      where: { id: parseInt(id) },
      include: {
        category: true
      }
    });

    if (!subcategory) {
      return res.status(404).json({
        success: false,
        message: 'Sous-catégorie non trouvée'
      });
    }

    res.json({ success: true, data: subcategory });
  } catch (error) {
    console.error('Error fetching subcategory:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la sous-catégorie',
      error: error.message
    });
  }
};

// Créer une sous-catégorie
exports.createSubcategory = async (req, res) => {
  try {
    const { name, slug, description, icon, categoryId, order, isActive } = req.body;

    if (!name || !slug || !categoryId) {
      return res.status(400).json({
        success: false,
        message: 'Le nom, le slug et la catégorie sont requis'
      });
    }

    const subcategory = await prisma.subcategory.create({
      data: {
        name,
        slug,
        description,
        icon,
        categoryId: parseInt(categoryId),
        order: order || 0,
        isActive: isActive !== undefined ? isActive : true
      },
      include: {
        category: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Sous-catégorie créée avec succès',
      data: subcategory
    });
  } catch (error) {
    console.error('Error creating subcategory:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'Une sous-catégorie avec ce slug existe déjà'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la sous-catégorie',
      error: error.message
    });
  }
};

// Mettre à jour une sous-catégorie
exports.updateSubcategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, description, icon, categoryId, order, isActive } = req.body;

    const subcategory = await prisma.subcategory.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(description !== undefined && { description }),
        ...(icon !== undefined && { icon }),
        ...(categoryId && { categoryId: parseInt(categoryId) }),
        ...(order !== undefined && { order }),
        ...(isActive !== undefined && { isActive })
      },
      include: {
        category: true
      }
    });

    res.json({
      success: true,
      message: 'Sous-catégorie mise à jour avec succès',
      data: subcategory
    });
  } catch (error) {
    console.error('Error updating subcategory:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'Une sous-catégorie avec ce slug existe déjà'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la sous-catégorie',
      error: error.message
    });
  }
};

// Supprimer une sous-catégorie
exports.deleteSubcategory = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.subcategory.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Sous-catégorie supprimée avec succès'
    });
  } catch (error) {
    console.error('Error deleting subcategory:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la sous-catégorie',
      error: error.message
    });
  }
};
