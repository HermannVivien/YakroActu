const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all interviews
const getAllInterviews = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, categoryId } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (status) where.status = status;
    if (categoryId) where.categoryId = parseInt(categoryId);

    const [interviews, total] = await Promise.all([
      prisma.interview.findMany({
        where,
        include: {
          author: { select: { id: true, firstName: true, lastName: true } },
          category: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.interview.count({ where })
    ]);

    res.json({
      success: true,
      data: interviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching interviews:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};

// Get interview by ID
const getInterviewById = async (req, res) => {
  try {
    const { id } = req.params;
    const interview = await prisma.interview.findUnique({
      where: { id: parseInt(id) },
      include: {
        author: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        category: true
      }
    });

    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview non trouvée' });
    }

    res.json({ success: true, data: interview });
  } catch (error) {
    console.error('Error fetching interview:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};

// Create interview
const createInterview = async (req, res) => {
  try {
    const {
      title,
      slug,
      intervieweeName,
      intervieweeRole,
      intervieweePhoto,
      introduction,
      questions,
      highlightQuote,
      authorId,
      categoryId,
      coverImage,
      audioUrl,
      videoUrl,
      status,
      isPublished,
      publishedAt
    } = req.body;

    const interview = await prisma.interview.create({
      data: {
        title,
        slug,
        intervieweeName,
        intervieweeRole,
        intervieweePhoto,
        introduction,
        questions,
        highlightQuote,
        authorId: authorId ? parseInt(authorId) : null,
        categoryId: categoryId ? parseInt(categoryId) : null,
        coverImage,
        audioUrl,
        videoUrl,
        status: status || 'DRAFT',
        isPublished: isPublished || false,
        publishedAt: publishedAt ? new Date(publishedAt) : null
      },
      include: {
        author: { select: { id: true, firstName: true, lastName: true } },
        category: true
      }
    });

    res.status(201).json({ success: true, data: interview });
  } catch (error) {
    console.error('Error creating interview:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};

// Update interview
const updateInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.authorId) updateData.authorId = parseInt(updateData.authorId);
    if (updateData.categoryId) updateData.categoryId = parseInt(updateData.categoryId);
    if (updateData.publishedAt) updateData.publishedAt = new Date(updateData.publishedAt);

    const interview = await prisma.interview.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        author: { select: { id: true, firstName: true, lastName: true } },
        category: true
      }
    });

    res.json({ success: true, data: interview });
  } catch (error) {
    console.error('Error updating interview:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};

// Delete interview
const deleteInterview = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.interview.delete({ where: { id: parseInt(id) } });
    res.json({ success: true, message: 'Interview supprimée' });
  } catch (error) {
    console.error('Error deleting interview:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};

// Increment view count
const incrementViewCount = async (req, res) => {
  try {
    const { id } = req.params;
    const interview = await prisma.interview.update({
      where: { id: parseInt(id) },
      data: { viewCount: { increment: 1 } }
    });
    res.json({ success: true, data: interview });
  } catch (error) {
    console.error('Error incrementing view count:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};

module.exports = {
  getAllInterviews,
  getInterviewById,
  createInterview,
  updateInterview,
  deleteInterview,
  incrementViewCount
};
