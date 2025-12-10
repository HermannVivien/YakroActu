const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllAdSpaces = async (req, res) => {
  try {
    const { location, isActive, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    if (location) where.location = location;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const [ads, total] = await Promise.all([
      prisma.adSpace.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.adSpace.count({ where })
    ]);

    res.json({
      success: true,
      data: ads,
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

exports.createAdSpace = async (req, res) => {
  try {
    const { name, location, imageUrl, link, width, height, isActive, startDate, endDate } = req.body;
    
    if (!name || !location) {
      return res.status(400).json({ success: false, message: 'Nom et emplacement requis' });
    }

    const ad = await prisma.adSpace.create({
      data: {
        name,
        location,
        imageUrl,
        link,
        width,
        height,
        isActive: isActive !== undefined ? isActive : true,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null
      }
    });

    res.status(201).json({ success: true, message: 'Espace publicitaire créé', data: ad });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateAdSpace = async (req, res) => {
  try {
    const { name, location, imageUrl, link, width, height, isActive, startDate, endDate } = req.body;

    const ad = await prisma.adSpace.update({
      where: { id: parseInt(req.params.id) },
      data: {
        ...(name && { name }),
        ...(location && { location }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(link !== undefined && { link }),
        ...(width !== undefined && { width }),
        ...(height !== undefined && { height }),
        ...(isActive !== undefined && { isActive }),
        ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null })
      }
    });

    res.json({ success: true, message: 'Espace publicitaire mis à jour', data: ad });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteAdSpace = async (req, res) => {
  try {
    await prisma.adSpace.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ success: true, message: 'Espace publicitaire supprimé' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
