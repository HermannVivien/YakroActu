const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all reportages
const getAllReportages = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, categoryId } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (status) where.status = status;
    if (categoryId) where.categoryId = parseInt(categoryId);

    const [reportages, total] = await Promise.all([
      prisma.reportage.findMany({
        where,
        include: {
          author: { select: { id: true, firstName: true, lastName: true } },
          photographer: { select: { id: true, firstName: true, lastName: true } },
          category: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.reportage.count({ where })
    ]);

    res.json({
      success: true,
      data: reportages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching reportages:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};

// Get reportage by ID
const getReportageById = async (req, res) => {
  try {
    const { id } = req.params;
    const reportage = await prisma.reportage.findUnique({
      where: { id: parseInt(id) },
      include: {
        author: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        photographer: { select: { id: true, firstName: true, lastName: true } },
        category: true
      }
    });

    if (!reportage) {
      return res.status(404).json({ success: false, message: 'Reportage non trouvé' });
    }

    res.json({ success: true, data: reportage });
  } catch (error) {
    console.error('Error fetching reportage:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};

// Create reportage
const createReportage = async (req, res) => {
  try {
    const {
      title,
      slug,
      summary,
      content,
      coverImage,
      authorId,
      photographerId,
      categoryId,
      status,
      isPublished,
      publishedAt,
      images,
      videos
    } = req.body;

    const reportage = await prisma.reportage.create({
      data: {
        title,
        slug,
        summary,
        content,
        coverImage,
        authorId: authorId ? parseInt(authorId) : null,
        photographerId: photographerId ? parseInt(photographerId) : null,
        categoryId: categoryId ? parseInt(categoryId) : null,
        status: status || 'DRAFT',
        isPublished: isPublished || false,
        publishedAt: publishedAt ? new Date(publishedAt) : null,
        images,
        videos
      },
      include: {
        author: { select: { id: true, firstName: true, lastName: true } },
        category: true
      }
    });

    res.status(201).json({ success: true, data: reportage });
  } catch (error) {
    console.error('Error creating reportage:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};

// Update reportage
const updateReportage = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.authorId) updateData.authorId = parseInt(updateData.authorId);
    if (updateData.photographerId) updateData.photographerId = parseInt(updateData.photographerId);
    if (updateData.categoryId) updateData.categoryId = parseInt(updateData.categoryId);
    if (updateData.publishedAt) updateData.publishedAt = new Date(updateData.publishedAt);

    const reportage = await prisma.reportage.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        author: { select: { id: true, firstName: true, lastName: true } },
        category: true
      }
    });

    res.json({ success: true, data: reportage });
  } catch (error) {
    console.error('Error updating reportage:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};

// Delete reportage
const deleteReportage = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.reportage.delete({ where: { id: parseInt(id) } });
    res.json({ success: true, message: 'Reportage supprimé' });
  } catch (error) {
    console.error('Error deleting reportage:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};

// Increment view count
const incrementViewCount = async (req, res) => {
  try {
    const { id } = req.params;
    const reportage = await prisma.reportage.update({
      where: { id: parseInt(id) },
      data: { viewCount: { increment: 1 } }
    });
    res.json({ success: true, data: reportage });
  } catch (error) {
    console.error('Error incrementing view count:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};

module.exports = {
  getAllReportages,
  getReportageById,
  createReportage,
  updateReportage,
  deleteReportage,
  incrementViewCount
};
