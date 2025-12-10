const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all testimonies
const getAllTestimonies = async (req, res) => {
  try {
    const { page = 1, limit = 10, isApproved, isPublished, categoryId } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (isApproved !== undefined) where.isApproved = isApproved === 'true';
    if (isPublished !== undefined) where.isPublished = isPublished === 'true';
    if (categoryId) where.categoryId = parseInt(categoryId);

    const [testimonies, total] = await Promise.all([
      prisma.testimony.findMany({
        where,
        include: {
          category: true,
          moderator: { select: { id: true, firstName: true, lastName: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.testimony.count({ where })
    ]);

    res.json({
      success: true,
      data: testimonies,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching testimonies:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};

// Get testimony by ID
const getTestimonyById = async (req, res) => {
  try {
    const { id } = req.params;
    const testimony = await prisma.testimony.findUnique({
      where: { id: parseInt(id) },
      include: {
        category: true,
        moderator: { select: { id: true, firstName: true, lastName: true } }
      }
    });

    if (!testimony) {
      return res.status(404).json({ success: false, message: 'Témoignage non trouvé' });
    }

    res.json({ success: true, data: testimony });
  } catch (error) {
    console.error('Error fetching testimony:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};

// Create testimony
const createTestimony = async (req, res) => {
  try {
    const {
      title,
      content,
      authorName,
      authorPhoto,
      authorRole,
      location,
      rating,
      categoryId
    } = req.body;

    const testimony = await prisma.testimony.create({
      data: {
        title,
        content,
        authorName,
        authorPhoto,
        authorRole,
        location,
        rating: rating ? parseInt(rating) : 5,
        categoryId: categoryId ? parseInt(categoryId) : null,
        isApproved: false,
        isPublished: false
      },
      include: { category: true }
    });

    res.status(201).json({ success: true, data: testimony });
  } catch (error) {
    console.error('Error creating testimony:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};

// Update testimony
const updateTestimony = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.categoryId) updateData.categoryId = parseInt(updateData.categoryId);
    if (updateData.rating) updateData.rating = parseInt(updateData.rating);

    const testimony = await prisma.testimony.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        category: true,
        moderator: { select: { id: true, firstName: true, lastName: true } }
      }
    });

    res.json({ success: true, data: testimony });
  } catch (error) {
    console.error('Error updating testimony:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};

// Approve testimony
const approveTestimony = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user; // From auth middleware

    const testimony = await prisma.testimony.update({
      where: { id: parseInt(id) },
      data: {
        isApproved: true,
        approvedAt: new Date(),
        approvedBy: userId
      },
      include: {
        category: true,
        moderator: { select: { id: true, firstName: true, lastName: true } }
      }
    });

    res.json({ success: true, data: testimony });
  } catch (error) {
    console.error('Error approving testimony:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};

// Reject testimony
const rejectTestimony = async (req, res) => {
  try {
    const { id } = req.params;

    const testimony = await prisma.testimony.update({
      where: { id: parseInt(id) },
      data: {
        isApproved: false,
        approvedAt: null,
        approvedBy: null,
        isPublished: false
      }
    });

    res.json({ success: true, data: testimony });
  } catch (error) {
    console.error('Error rejecting testimony:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};

// Delete testimony
const deleteTestimony = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.testimony.delete({ where: { id: parseInt(id) } });
    res.json({ success: true, message: 'Témoignage supprimé' });
  } catch (error) {
    console.error('Error deleting testimony:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};

module.exports = {
  getAllTestimonies,
  getTestimonyById,
  createTestimony,
  updateTestimony,
  approveTestimony,
  rejectTestimony,
  deleteTestimony
};
