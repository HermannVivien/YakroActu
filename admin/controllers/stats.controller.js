const prisma = require('../config/prisma');

/**
 * Obtenir les statistiques du dashboard
 */
exports.getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalArticles,
      publishedArticles,
      draftArticles,
      totalUsers,
      totalCategories,
      totalPharmacies,
      recentArticles
    ] = await Promise.all([
      prisma.article.count(),
      prisma.article.count({ where: { status: 'PUBLISHED' } }),
      prisma.article.count({ where: { status: 'DRAFT' } }),
      prisma.user.count(),
      prisma.category.count(),
      prisma.pharmacy.count(),
      prisma.article.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
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
      })
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalArticles,
          publishedArticles,
          draftArticles,
          totalUsers,
          totalCategories,
          totalPharmacies
        },
        recentArticles
      }
    });
  } catch (error) {
    next(error);
  }
};
