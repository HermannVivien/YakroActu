const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllBanners = async (req, res) => {
  try {
    const { type, position, isActive, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    if (type) where.type = type;
    if (position) where.position = position;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const [banners, total] = await Promise.all([
      prisma.banner.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }]
      }),
      prisma.banner.count({ where })
    ]);

    res.json({
      success: true,
      data: banners,
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

exports.getActiveBanners = async (req, res) => {
  try {
    const { type, position } = req.query;
    const now = new Date();
    
    const where = {
      isActive: true,
      OR: [
        { startDate: null, endDate: null },
        { startDate: { lte: now }, endDate: null },
        { startDate: null, endDate: { gte: now } },
        { startDate: { lte: now }, endDate: { gte: now } }
      ]
    };
    
    if (type) where.type = type;
    if (position) where.position = position;

    const banners = await prisma.banner.findMany({
      where,
      orderBy: { order: 'asc' }
    });

    res.json({ success: true, data: banners });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createBanner = async (req, res) => {
  try {
    const { title, description, imageUrl, type, position, link, targetId, order, isActive, startDate, endDate } = req.body;
    
    if (!title || !imageUrl || !type) {
      return res.status(400).json({ success: false, message: 'Données manquantes' });
    }

    const banner = await prisma.banner.create({
      data: {
        title,
        description,
        imageUrl,
        type,
        position: position || 'TOP',
        link,
        targetId: targetId ? parseInt(targetId) : null,
        order: order || 0,
        isActive: isActive !== undefined ? isActive : true,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null
      }
    });

    res.status(201).json({ success: true, message: 'Bannière créée', data: banner });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateBanner = async (req, res) => {
  try {
    const { title, description, imageUrl, type, position, link, targetId, order, isActive, startDate, endDate } = req.body;

    const banner = await prisma.banner.update({
      where: { id: parseInt(req.params.id) },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(imageUrl && { imageUrl }),
        ...(type && { type }),
        ...(position && { position }),
        ...(link !== undefined && { link }),
        ...(targetId !== undefined && { targetId: targetId ? parseInt(targetId) : null }),
        ...(order !== undefined && { order }),
        ...(isActive !== undefined && { isActive }),
        ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null })
      }
    });

    res.json({ success: true, message: 'Bannière mise à jour', data: banner });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.incrementView = async (req, res) => {
  try {
    const banner = await prisma.banner.update({
      where: { id: parseInt(req.params.id) },
      data: { viewCount: { increment: 1 } }
    });

    res.json({ success: true, data: banner });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.incrementClick = async (req, res) => {
  try {
    const banner = await prisma.banner.update({
      where: { id: parseInt(req.params.id) },
      data: { clickCount: { increment: 1 } }
    });

    res.json({ success: true, data: banner });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteBanner = async (req, res) => {
  try {
    await prisma.banner.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ success: true, message: 'Bannière supprimée' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
