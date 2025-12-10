const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllSubscribers = async (req, res) => {
  try {
    const { isActive, isVerified, page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (isVerified !== undefined) where.isVerified = isVerified === 'true';

    const [subscribers, total] = await Promise.all([
      prisma.newsletter.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.newsletter.count({ where })
    ]);

    res.json({
      success: true,
      data: subscribers,
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

exports.subscribe = async (req, res) => {
  try {
    const { email, name } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email requis' });
    }

    const existing = await prisma.newsletter.findUnique({
      where: { email }
    });

    if (existing) {
      if (existing.unsubscribedAt) {
        const updated = await prisma.newsletter.update({
          where: { email },
          data: { isActive: true, unsubscribedAt: null }
        });
        return res.json({ success: true, message: 'Réabonnement réussi', data: updated });
      }
      return res.status(400).json({ success: false, message: 'Email déjà inscrit' });
    }

    const subscriber = await prisma.newsletter.create({
      data: { email, name }
    });

    res.status(201).json({ success: true, message: 'Inscription réussie', data: subscriber });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.unsubscribe = async (req, res) => {
  try {
    const { email } = req.params;

    const subscriber = await prisma.newsletter.update({
      where: { email },
      data: {
        isActive: false,
        unsubscribedAt: new Date()
      }
    });

    res.json({ success: true, message: 'Désabonnement réussi', data: subscriber });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.verifySubscriber = async (req, res) => {
  try {
    const subscriber = await prisma.newsletter.update({
      where: { id: parseInt(req.params.id) },
      data: {
        isVerified: true,
        verifiedAt: new Date()
      }
    });

    res.json({ success: true, message: 'Email vérifié', data: subscriber });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteSubscriber = async (req, res) => {
  try {
    await prisma.newsletter.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ success: true, message: 'Abonné supprimé' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
