const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ==================== FORUM CATEGORIES ====================

const getAllForumCategories = async (req, res) => {
  try {
    const categories = await prisma.forumCategory.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      include: {
        _count: { select: { topics: true } }
      }
    });
    res.json({ success: true, data: categories });
  } catch (error) {
    console.error('Error fetching forum categories:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};

const createForumCategory = async (req, res) => {
  try {
    const { name, slug, description, icon, order, isActive } = req.body;

    const category = await prisma.forumCategory.create({
      data: { name, slug, description, icon, order: order || 0, isActive: isActive !== false }
    });

    res.status(201).json({ success: true, data: category });
  } catch (error) {
    console.error('Error creating forum category:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};

const updateForumCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await prisma.forumCategory.update({
      where: { id: parseInt(id) },
      data: req.body
    });
    res.json({ success: true, data: category });
  } catch (error) {
    console.error('Error updating forum category:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};

const deleteForumCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.forumCategory.delete({ where: { id: parseInt(id) } });
    res.json({ success: true, message: 'Catégorie supprimée' });
  } catch (error) {
    console.error('Error deleting forum category:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};

// ==================== FORUM TOPICS ====================

const getAllForumTopics = async (req, res) => {
  try {
    const { page = 1, limit = 20, categoryId } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (categoryId) where.categoryId = parseInt(categoryId);

    const [topics, total] = await Promise.all([
      prisma.forumTopic.findMany({
        where,
        include: {
          category: true,
          user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
          lastPoster: { select: { id: true, firstName: true, lastName: true } },
          _count: { select: { posts: true } }
        },
        orderBy: [
          { isPinned: 'desc' },
          { lastPostAt: 'desc' }
        ],
        skip,
        take: parseInt(limit)
      }),
      prisma.forumTopic.count({ where })
    ]);

    res.json({
      success: true,
      data: topics,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching forum topics:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};

const getForumTopicById = async (req, res) => {
  try {
    const { id } = req.params;

    // Increment view count
    await prisma.forumTopic.update({
      where: { id: parseInt(id) },
      data: { viewCount: { increment: 1 } }
    });

    const topic = await prisma.forumTopic.findUnique({
      where: { id: parseInt(id) },
      include: {
        category: true,
        user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        posts: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
            replies: {
              include: {
                user: { select: { id: true, firstName: true, lastName: true, avatar: true } }
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!topic) {
      return res.status(404).json({ success: false, message: 'Sujet non trouvé' });
    }

    res.json({ success: true, data: topic });
  } catch (error) {
    console.error('Error fetching forum topic:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};

const createForumTopic = async (req, res) => {
  try {
    const { categoryId, title, slug, userId, firstPostContent } = req.body;

    const topic = await prisma.forumTopic.create({
      data: {
        categoryId: parseInt(categoryId),
        title,
        slug,
        userId: parseInt(userId),
        postCount: 1,
        lastPostAt: new Date(),
        lastPostBy: parseInt(userId),
        posts: {
          create: {
            userId: parseInt(userId),
            content: firstPostContent
          }
        }
      },
      include: {
        category: true,
        user: { select: { id: true, firstName: true, lastName: true } }
      }
    });

    res.status(201).json({ success: true, data: topic });
  } catch (error) {
    console.error('Error creating forum topic:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};

const updateForumTopic = async (req, res) => {
  try {
    const { id } = req.params;
    const topic = await prisma.forumTopic.update({
      where: { id: parseInt(id) },
      data: req.body
    });
    res.json({ success: true, data: topic });
  } catch (error) {
    console.error('Error updating forum topic:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};

const deleteForumTopic = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.forumTopic.delete({ where: { id: parseInt(id) } });
    res.json({ success: true, message: 'Sujet supprimé' });
  } catch (error) {
    console.error('Error deleting forum topic:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};

// ==================== FORUM POSTS ====================

const createForumPost = async (req, res) => {
  try {
    const { topicId, userId, content, parentId } = req.body;

    const post = await prisma.forumPost.create({
      data: {
        topicId: parseInt(topicId),
        userId: parseInt(userId),
        content,
        parentId: parentId ? parseInt(parentId) : null
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatar: true } }
      }
    });

    // Update topic post count and last post info
    await prisma.forumTopic.update({
      where: { id: parseInt(topicId) },
      data: {
        postCount: { increment: 1 },
        lastPostAt: new Date(),
        lastPostBy: parseInt(userId)
      }
    });

    res.status(201).json({ success: true, data: post });
  } catch (error) {
    console.error('Error creating forum post:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};

const updateForumPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const post = await prisma.forumPost.update({
      where: { id: parseInt(id) },
      data: {
        content,
        isEdited: true,
        editedAt: new Date()
      }
    });

    res.json({ success: true, data: post });
  } catch (error) {
    console.error('Error updating forum post:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};

const deleteForumPost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await prisma.forumPost.findUnique({ where: { id: parseInt(id) } });

    if (post) {
      await prisma.forumPost.delete({ where: { id: parseInt(id) } });

      // Decrement topic post count
      await prisma.forumTopic.update({
        where: { id: post.topicId },
        data: { postCount: { decrement: 1 } }
      });
    }

    res.json({ success: true, message: 'Message supprimé' });
  } catch (error) {
    console.error('Error deleting forum post:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};

const voteForumPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.body; // 'upvote' or 'downvote'

    const updateData = type === 'upvote' 
      ? { upvotes: { increment: 1 } }
      : { downvotes: { increment: 1 } };

    const post = await prisma.forumPost.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    res.json({ success: true, data: post });
  } catch (error) {
    console.error('Error voting forum post:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};

module.exports = {
  // Categories
  getAllForumCategories,
  createForumCategory,
  updateForumCategory,
  deleteForumCategory,
  // Topics
  getAllForumTopics,
  getForumTopicById,
  createForumTopic,
  updateForumTopic,
  deleteForumTopic,
  // Posts
  createForumPost,
  updateForumPost,
  deleteForumPost,
  voteForumPost
};
