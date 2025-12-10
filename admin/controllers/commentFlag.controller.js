const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllCommentFlags = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;

    const [flags, total] = await Promise.all([
      prisma.commentFlag.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.commentFlag.count({ where })
    ]);

    res.json({
      success: true,
      data: flags,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createCommentFlag = async (req, res) => {
  try {
    const { commentId, userId, reason, description } = req.body;
    
    if (!commentId || !userId || !reason) {
      return res.status(400).json({ success: false, message: 'Données manquantes' });
    }

    const flag = await prisma.commentFlag.create({
      data: { commentId: parseInt(commentId), userId: parseInt(userId), reason, description }
    });

    res.status(201).json({ success: true, message: 'Signalement créé', data: flag });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateCommentFlag = async (req, res) => {
  try {
    const { status } = req.body;

    const flag = await prisma.commentFlag.update({
      where: { id: parseInt(req.params.id) },
      data: { status }
    });

    res.json({ success: true, message: 'Signalement mis à jour', data: flag });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteCommentFlag = async (req, res) => {
  try {
    await prisma.commentFlag.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ success: true, message: 'Signalement supprimé' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
