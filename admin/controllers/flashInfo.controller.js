const prisma = require('../config/prisma');

const getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, priority, isActive } = req.query;

    const skip = (page - 1) * limit;
    const where = {};

    if (priority) where.priority = priority;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const [flashInfos, total] = await Promise.all([
      prisma.flashInfo.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' }
        ]
      }),
      prisma.flashInfo.count({ where })
    ]);

    res.json({
      success: true,
      data: flashInfos,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

const getActive = async (req, res, next) => {
  try {
    const flashInfos = await prisma.flashInfo.findMany({
      where: { isActive: true },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ],
      take: 10
    });

    res.json({
      success: true,
      data: { flashInfos }
    });
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const flashInfo = await prisma.flashInfo.findUnique({
      where: { id: parseInt(id) }
    });

    if (!flashInfo) {
      return res.status(404).json({
        success: false,
        message: 'Flash info non trouvé'
      });
    }

    res.json({
      success: true,
      data: { flashInfo }
    });
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const { title, content, priority, link, expiresAt } = req.body;

    const flashInfo = await prisma.flashInfo.create({
      data: {
        title,
        content,
        priority: priority || 'MEDIUM',
        link,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Flash info créé',
      data: { flashInfo }
    });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content, priority, link, expiresAt, isActive } = req.body;

    const flashInfo = await prisma.flashInfo.update({
      where: { id: parseInt(id) },
      data: {
        ...(title && { title }),
        ...(content && { content }),
        ...(priority && { priority }),
        ...(link && { link }),
        ...(expiresAt && { expiresAt: new Date(expiresAt) }),
        ...(isActive !== undefined && { isActive })
      }
    });

    res.json({
      success: true,
      message: 'Flash info mis à jour',
      data: { flashInfo }
    });
  } catch (error) {
    next(error);
  }
};

const deleteFlashInfo = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.flashInfo.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Flash info supprimé'
    });
  } catch (error) {
    next(error);
  }
};

const toggleActive = async (req, res, next) => {
  try {
    const { id } = req.params;

    const flashInfo = await prisma.flashInfo.findUnique({
      where: { id: parseInt(id) }
    });

    const updated = await prisma.flashInfo.update({
      where: { id: parseInt(id) },
      data: { isActive: !flashInfo.isActive }
    });

    res.json({
      success: true,
      message: updated.isActive ? 'Flash info activé' : 'Flash info désactivé',
      data: { flashInfo: updated }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAll,
  getActive,
  getById,
  create,
  update,
  delete: deleteFlashInfo,
  toggleActive
};
