const prisma = require('../config/prisma');

/**
 * Obtenir mes favoris
 */
const getMyFavorites = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    const skip = (page - 1) * limit;

    const [favorites, total] = await Promise.all([
      prisma.favorite.findMany({
        where: { userId },
        include: {
          article: {
            include: {
              category: true,
              author: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatar: true
                }
              },
              _count: {
                select: {
                  comments: true,
                  favorites: true
                }
              }
            }
          }
        },
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.favorite.count({ where: { userId } })
    ]);

    res.json({
      success: true,
      data: {
        favorites,
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

/**
 * Ajouter un favori
 */
const addFavorite = async (req, res, next) => {
  try {
    const { articleId } = req.body;
    const userId = req.user.id;

    // Vérifier que l'article existe
    const article = await prisma.article.findUnique({
      where: { id: parseInt(articleId) }
    });

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article non trouvé'
      });
    }

    // Vérifier si déjà en favori
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_articleId: {
          userId,
          articleId: parseInt(articleId)
        }
      }
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Article déjà en favori'
      });
    }

    const favorite = await prisma.favorite.create({
      data: {
        userId,
        articleId: parseInt(articleId)
      },
      include: {
        article: {
          include: {
            category: true,
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true
              }
            }
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: favorite,
      message: 'Article ajouté aux favoris'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retirer un favori
 */
const removeFavorite = async (req, res, next) => {
  try {
    const { articleId } = req.params;
    const userId = req.user.id;

    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_articleId: {
          userId,
          articleId: parseInt(articleId)
        }
      }
    });

    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: 'Favori non trouvé'
      });
    }

    await prisma.favorite.delete({
      where: {
        userId_articleId: {
          userId,
          articleId: parseInt(articleId)
        }
      }
    });

    res.json({
      success: true,
      message: 'Article retiré des favoris'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Vérifier si un article est en favori
 */
const checkFavorite = async (req, res, next) => {
  try {
    const { articleId } = req.params;
    const userId = req.user.id;

    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_articleId: {
          userId,
          articleId: parseInt(articleId)
        }
      }
    });

    res.json({
      success: true,
      data: {
        isFavorite: !!favorite
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyFavorites,
  addFavorite,
  removeFavorite,
  checkFavorite
};
