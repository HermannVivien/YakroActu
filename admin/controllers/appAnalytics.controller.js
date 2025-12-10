const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.trackEvent = async (req, res) => {
  try {
    const { platform, event, screen, userId, sessionId, data, deviceInfo } = req.body;
    
    if (!platform || !event) {
      return res.status(400).json({ success: false, message: 'Platform et event requis' });
    }

    const analytics = await prisma.appAnalytics.create({
      data: {
        platform,
        event,
        screen,
        userId: userId ? parseInt(userId) : null,
        sessionId,
        data,
        deviceInfo
      }
    });

    res.status(201).json({ success: true, data: analytics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAnalyticsByPlatform = async (req, res) => {
  try {
    const { platform } = req.params;
    const { startDate, endDate, event, limit = 100 } = req.query;

    const where = { platform: platform.toUpperCase() };
    if (event) where.event = event;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const analytics = await prisma.appAnalytics.findMany({
      where,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: analytics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getEventStats = async (req, res) => {
  try {
    const { platform, startDate, endDate } = req.query;

    const where = {};
    if (platform) where.platform = platform.toUpperCase();
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const stats = await prisma.appAnalytics.groupBy({
      by: ['event'],
      where,
      _count: { event: true }
    });

    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
