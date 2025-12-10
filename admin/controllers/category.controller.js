const prisma = require('../config/prisma');

const getAll = async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { articles: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: { articles: true }
        }
      }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Catégorie non trouvée'
      });
    }

    res.json({
      success: true,
      data: { category }
    });
  } catch (error) {
    next(error);
  }
};

const getArticles = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where: {
          categoryId: parseInt(id),
          status: 'PUBLISHED'
        },
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true
            }
          }
        },
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.article.count({
        where: {
          categoryId: parseInt(id),
          status: 'PUBLISHED'
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        articles,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const { name, slug, description, icon, color } = req.body;

    const category = await prisma.category.create({
      data: {
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
        description,
        icon,
        color
      }
    });

    res.status(201).json({
      success: true,
      message: 'Catégorie créée',
      data: { category }
    });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, slug, description, icon, color } = req.body;

    const category = await prisma.category.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(description && { description }),
        ...(icon && { icon }),
        ...(color && { color })
      }
    });

    res.json({
      success: true,
      message: 'Catégorie mise à jour',
      data: { category }
    });
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.category.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Catégorie supprimée'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAll,
  getById,
  getArticles,
  create,
  update,
  delete: deleteCategory
};
