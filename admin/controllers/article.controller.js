const prisma = require('../config/prisma');
const { generateSlug } = require('../utils/helpers');

/**
 * Obtenir tous les articles
 */
const getAll = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      categoryId,
      search,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    const skip = (page - 1) * limit;
    const where = {};

    if (status) where.status = status;
    if (categoryId) where.categoryId = parseInt(categoryId);
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
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
          tags: {
            include: {
              tag: true
            }
          },
          _count: {
            select: {
              comments: true,
              favorites: true
            }
          }
        },
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { [sortBy]: order }
      }),
      prisma.article.count({ where })
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

/**
 * Obtenir un article par ID
 */
const getById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const article = await prisma.article.findUnique({
      where: { id: parseInt(id) },
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
        tags: {
          include: {
            tag: true
          }
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article non trouvé'
      });
    }

    res.json({
      success: true,
      data: { article }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtenir un article par slug
 */
const getBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const article = await prisma.article.findUnique({
      where: { slug },
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
        tags: {
          include: {
            tag: true
          }
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article non trouvé'
      });
    }

    res.json({
      success: true,
      data: { article }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Créer un article
 */
const create = async (req, res, next) => {
  try {
    const { title, content, categoryId, coverImage, tags = [], slug } = req.body;

    const articleData = {
      title,
      content,
      categoryId: parseInt(categoryId),
      authorId: req.user.id,
      slug: slug || generateSlug(title),
      coverImage,
      status: 'DRAFT'
    };

    const article = await prisma.article.create({
      data: {
        ...articleData,
        ...(tags.length > 0 && {
          tags: {
            create: tags.map(tagId => ({
              tag: { connect: { id: parseInt(tagId) } }
            }))
          }
        })
      },
      include: {
        category: true,
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        tags: {
          include: {
            tag: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Article créé avec succès',
      data: { article }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mettre à jour un article
 */
const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content, categoryId, coverImage, tags, slug } = req.body;

    const article = await prisma.article.update({
      where: { id: parseInt(id) },
      data: {
        ...(title && { title }),
        ...(content && { content }),
        ...(categoryId && { categoryId: parseInt(categoryId) }),
        ...(coverImage && { coverImage }),
        ...(slug && { slug }),
        ...(tags && {
          tags: {
            deleteMany: {},
            create: tags.map(tagId => ({
              tag: { connect: { id: parseInt(tagId) } }
            }))
          }
        })
      },
      include: {
        category: true,
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        tags: {
          include: {
            tag: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Article mis à jour',
      data: { article }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Supprimer un article
 */
const deleteArticle = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.article.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Article supprimé'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Publier un article
 */
const publish = async (req, res, next) => {
  try {
    const { id } = req.params;

    const article = await prisma.article.update({
      where: { id: parseInt(id) },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Article publié',
      data: { article }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Épingler/Désépingler un article
 */
const togglePin = async (req, res, next) => {
  try {
    const { id } = req.params;

    const article = await prisma.article.findUnique({
      where: { id: parseInt(id) }
    });

    const updated = await prisma.article.update({
      where: { id: parseInt(id) },
      data: { isPinned: !article.isPinned }
    });

    res.json({
      success: true,
      message: updated.isPinned ? 'Article épinglé' : 'Article désépinglé',
      data: { article: updated }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Incrémenter le nombre de vues
 */
const incrementView = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.article.update({
      where: { id: parseInt(id) },
      data: {
        viewCount: {
          increment: 1
        }
      }
    });

    res.json({
      success: true,
      message: 'Vue enregistrée'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Ajouter aux favoris
 */
const toggleFavorite = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existing = await prisma.favorite.findUnique({
      where: {
        userId_articleId: {
          userId,
          articleId: parseInt(id)
        }
      }
    });

    if (existing) {
      await prisma.favorite.delete({
        where: {
          userId_articleId: {
            userId,
            articleId: parseInt(id)
          }
        }
      });

      res.json({
        success: true,
        message: 'Retiré des favoris'
      });
    } else {
      await prisma.favorite.create({
        data: {
          userId,
          articleId: parseInt(id)
        }
      });

      res.json({
        success: true,
        message: 'Ajouté aux favoris'
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Obtenir mes favoris
 */
const getMyFavorites = async (req, res, next) => {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: req.user.id },
      include: {
        article: {
          include: {
            category: true,
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: { favorites }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Ajouter un commentaire
 */
const addComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const comment = await prisma.comment.create({
      data: {
        content,
        userId: req.user.id,
        articleId: parseInt(id)
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Commentaire ajouté',
      data: { comment }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtenir les articles tendance
 */
const getTrending = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    const articles = await prisma.article.findMany({
      where: {
        status: 'PUBLISHED'
      },
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
      },
      orderBy: {
        views: 'desc'
      },
      take: parseInt(limit)
    });

    res.json({
      success: true,
      data: articles
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtenir les breaking news
 */
const getBreaking = async (req, res, next) => {
  try {
    const { limit = 5 } = req.query;

    const articles = await prisma.article.findMany({
      where: {
        status: 'PUBLISHED',
        isBreaking: true
      },
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
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: parseInt(limit)
    });

    res.json({
      success: true,
      data: articles
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Rechercher des articles
 */
const search = async (req, res, next) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Le paramètre de recherche "q" est requis'
      });
    }

    const skip = (page - 1) * limit;

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where: {
          status: 'PUBLISHED',
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { content: { contains: q, mode: 'insensitive' } },
            { excerpt: { contains: q, mode: 'insensitive' } }
          ]
        },
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
        },
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.article.count({
        where: {
          status: 'PUBLISHED',
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { content: { contains: q, mode: 'insensitive' } },
            { excerpt: { contains: q, mode: 'insensitive' } }
          ]
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

module.exports = {
  getAll,
  getById,
  getBySlug,
  getTrending,
  getBreaking,
  search,
  create,
  update,
  delete: deleteArticle,
  publish,
  togglePin,
  incrementView,
  toggleFavorite,
  getMyFavorites,
  addComment
};
