const prisma = require('../config/prisma');
const { generateSlug } = require('../utils/helpers');
const cacheService = require('./cache.service');

/**
 * Service de gestion des articles
 */
class ArticleService {
  /**
   * Obtenir tous les articles avec filtres
   */
  async getAll(filters = {}) {
    const {
      page = 1,
      limit = 10,
      status = 'PUBLISHED',
      categoryId,
      search,
      authorId,
      sortBy = 'createdAt',
      order = 'desc'
    } = filters;

    const skip = (page - 1) * limit;
    const where = { status };

    if (categoryId) where.categoryId = parseInt(categoryId);
    if (authorId) where.authorId = parseInt(authorId);
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Vérifier le cache
    const cacheKey = cacheService.generateKey('articles', filters);
    const cached = await cacheService.getCachedArticles(cacheKey);
    if (cached) return cached;

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
            include: { tag: true }
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

    const result = {
      articles,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    };

    // Mettre en cache
    await cacheService.cacheArticles(cacheKey, result);

    return result;
  }

  /**
   * Obtenir un article par ID
   */
  async getById(id) {
    const article = await prisma.article.findUnique({
      where: { id: parseInt(id) },
      include: {
        category: true,
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            email: true
          }
        },
        tags: {
          include: { tag: true }
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
        },
        _count: {
          select: {
            comments: true,
            favorites: true
          }
        }
      }
    });

    if (!article) {
      throw new Error('Article non trouvé');
    }

    // Incrémenter les vues
    await prisma.article.update({
      where: { id: parseInt(id) },
      data: { viewCount: { increment: 1 } }
    });

    return article;
  }

  /**
   * Créer un article
   */
  async create(articleData, authorId) {
    const { title, content, excerpt, coverImage, categoryId, tags, status } = articleData;

    // Générer le slug
    const slug = await generateSlug(title);

    const article = await prisma.article.create({
      data: {
        title,
        slug,
        content,
        excerpt,
        coverImage,
        status: status || 'DRAFT',
        categoryId: parseInt(categoryId),
        authorId: parseInt(authorId),
        publishedAt: status === 'PUBLISHED' ? new Date() : null,
        tags: tags ? {
          create: tags.map(tagId => ({
            tag: { connect: { id: parseInt(tagId) } }
          }))
        } : undefined
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
          include: { tag: true }
        }
      }
    });

    // Invalider le cache
    await cacheService.invalidate('articles:*');

    return article;
  }

  /**
   * Mettre à jour un article
   */
  async update(id, articleData, userId, userRole) {
    const article = await prisma.article.findUnique({
      where: { id: parseInt(id) }
    });

    if (!article) {
      throw new Error('Article non trouvé');
    }

    // Vérifier les permissions
    if (userRole !== 'ADMIN' && article.authorId !== userId) {
      throw new Error('Non autorisé à modifier cet article');
    }

    const { title, content, excerpt, coverImage, categoryId, tags, status } = articleData;

    const updatedArticle = await prisma.article.update({
      where: { id: parseInt(id) },
      data: {
        title,
        slug: title ? await generateSlug(title) : undefined,
        content,
        excerpt,
        coverImage,
        status,
        categoryId: categoryId ? parseInt(categoryId) : undefined,
        publishedAt: status === 'PUBLISHED' && !article.publishedAt ? new Date() : undefined,
        tags: tags ? {
          deleteMany: {},
          create: tags.map(tagId => ({
            tag: { connect: { id: parseInt(tagId) } }
          }))
        } : undefined
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
          include: { tag: true }
        }
      }
    });

    // Invalider le cache
    await cacheService.invalidate('articles:*');

    return updatedArticle;
  }

  /**
   * Supprimer un article
   */
  async delete(id, userId, userRole) {
    const article = await prisma.article.findUnique({
      where: { id: parseInt(id) }
    });

    if (!article) {
      throw new Error('Article non trouvé');
    }

    // Seul l'admin peut supprimer
    if (userRole !== 'ADMIN') {
      throw new Error('Seul un administrateur peut supprimer des articles');
    }

    await prisma.article.delete({
      where: { id: parseInt(id) }
    });

    // Invalider le cache
    await cacheService.invalidate('articles:*');

    return { message: 'Article supprimé avec succès' };
  }

  /**
   * Articles tendance (plus de vues)
   */
  async getTrending(limit = 10) {
    return await prisma.article.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { viewCount: 'desc' },
      take: limit,
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
    });
  }

  /**
   * Articles à la une (breaking news)
   */
  async getBreaking() {
    return await prisma.article.findMany({
      where: {
        status: 'PUBLISHED',
        isBreaking: true
      },
      orderBy: { publishedAt: 'desc' },
      take: 5,
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
    });
  }
}

module.exports = new ArticleService();
