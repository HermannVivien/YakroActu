const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all announcements
const getAllAnnouncements = async (req, res) => {
  try {
    const { page = 1, limit = 10, type, priority, isPublished } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (type) where.type = type;
    if (priority) where.priority = priority;
    if (isPublished !== undefined) where.isPublished = isPublished === 'true';

    const [announcements, total] = await Promise.all([
      prisma.announcement.findMany({
        where,
        include: {
          author: { select: { id: true, firstName: true, lastName: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.announcement.count({ where })
    ]);

    res.json({
      success: true,
      data: announcements,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};

// Get announcement by ID
const getAnnouncementById = async (req, res) => {
  try {
    const { id } = req.params;
    const announcement = await prisma.announcement.findUnique({
      where: { id: parseInt(id) },
      include: {
        author: { select: { id: true, firstName: true, lastName: true, avatar: true } }
      }
    });

    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Annonce non trouvée' });
    }

    res.json({ success: true, data: announcement });
  } catch (error) {
    console.error('Error fetching announcement:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};

// Create announcement
const createAnnouncement = async (req, res) => {
  try {
    const {
      title,
      slug,
      content,
      type,
      priority,
      authorId,
      attachments,
      isPublished,
      publishedAt,
      expiresAt
    } = req.body;

    const announcement = await prisma.announcement.create({
      data: {
        title,
        slug,
        content,
        type: type || 'OFFICIAL',
        priority: priority || 'MEDIUM',
        authorId: authorId ? parseInt(authorId) : null,
        attachments,
        isPublished: isPublished || false,
        publishedAt: publishedAt ? new Date(publishedAt) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null
      },
      include: {
        author: { select: { id: true, firstName: true, lastName: true } }
      }
    });

    res.status(201).json({ success: true, data: announcement });
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};

// Update announcement
const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.authorId) updateData.authorId = parseInt(updateData.authorId);
    if (updateData.publishedAt) updateData.publishedAt = new Date(updateData.publishedAt);
    if (updateData.expiresAt) updateData.expiresAt = new Date(updateData.expiresAt);

    const announcement = await prisma.announcement.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        author: { select: { id: true, firstName: true, lastName: true } }
      }
    });

    res.json({ success: true, data: announcement });
  } catch (error) {
    console.error('Error updating announcement:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};

// Delete announcement
const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.announcement.delete({ where: { id: parseInt(id) } });
    res.json({ success: true, message: 'Annonce supprimée' });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};

// Increment view count
const incrementViewCount = async (req, res) => {
  try {
    const { id } = req.params;
    const announcement = await prisma.announcement.update({
      where: { id: parseInt(id) },
      data: { viewCount: { increment: 1 } }
    });
    res.json({ success: true, data: announcement });
  } catch (error) {
    console.error('Error incrementing view count:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};

module.exports = {
  getAllAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  incrementViewCount
};
