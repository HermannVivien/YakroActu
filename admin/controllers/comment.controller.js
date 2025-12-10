const prisma = require('../config/prisma');

/**
 * Obtenir tous les commentaires d'un article
 */
const getArticleComments = async (req, res, next) => {
  try {
    const { articleId } = req.params;
    const { page = 1, limit = 20, order = 'desc' } = req.query;

    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: { articleId: parseInt(articleId) },
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
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: order }
      }),
      prisma.comment.count({ where: { articleId: parseInt(articleId) } })
    ]);

    res.json({
      success: true,
      data: {
        comments,
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
 * Ajouter un commentaire
 */
const addComment = async (req, res, next) => {
  try {
    const { articleId } = req.params;
    const { content } = req.body;
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

    const comment = await prisma.comment.create({
      data: {
        content,
        userId,
        articleId: parseInt(articleId)
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
      data: comment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mettre à jour un commentaire
 */
const updateComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    // Vérifier que le commentaire appartient à l'utilisateur
    const comment = await prisma.comment.findUnique({
      where: { id: parseInt(id) }
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Commentaire non trouvé'
      });
    }

    if (comment.userId !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé'
      });
    }

    const updatedComment = await prisma.comment.update({
      where: { id: parseInt(id) },
      data: { content },
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

    res.json({
      success: true,
      data: updatedComment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Supprimer un commentaire
 */
const deleteComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const comment = await prisma.comment.findUnique({
      where: { id: parseInt(id) }
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Commentaire non trouvé'
      });
    }

    if (comment.userId !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé'
      });
    }

    await prisma.comment.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Commentaire supprimé'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getArticleComments,
  addComment,
  updateComment,
  deleteComment,
  getAllComments,
  approveComment,
  rejectComment
};

/**
 * Récupérer tous les commentaires (pour l'admin CMS)
 */
async function getAllComments(req, res, next) {
  try {
    const { status, articleId, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    if (status && status !== 'all') {
      where.status = status;
    }
    if (articleId) {
      where.articleId = parseInt(articleId);
    }

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true
            }
          },
          article: {
            select: {
              id: true,
              title: true,
              slug: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: parseInt(skip),
        take: parseInt(limit)
      }),
      prisma.comment.count({ where })
    ]);

    res.json({
      success: true,
      data: comments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Approuver un commentaire
 */
async function approveComment(req, res, next) {
  try {
    const { id } = req.params;

    const comment = await prisma.comment.update({
      where: { id: parseInt(id) },
      data: { status: 'approved' },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Commentaire approuvé',
      data: comment
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Rejeter un commentaire
 */
async function rejectComment(req, res, next) {
  try {
    const { id } = req.params;

    const comment = await prisma.comment.update({
      where: { id: parseInt(id) },
      data: { status: 'rejected' },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Commentaire rejeté',
      data: comment
    });
  } catch (error) {
    next(error);
  }
}
