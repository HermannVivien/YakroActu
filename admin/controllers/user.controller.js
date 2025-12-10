const prisma = require('../config/prisma');

const getAll = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      role,
      status,
      search
    } = req.query;

    const skip = (page - 1) * limit;
    const where = {};

    if (role) where.role = role;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          avatar: true,
          role: true,
          status: true,
          createdAt: true,
          _count: {
            select: {
              articles: true,
              comments: true
            }
          }
        },
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      success: true,
      data: users,
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

const getById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        role: true,
        status: true,
        createdAt: true,
        articles: {
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true
          },
          take: 5,
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, phone, avatar } = req.body;

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(phone && { phone }),
        ...(avatar && { avatar })
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        role: true,
        status: true
      }
    });

    res.json({
      success: true,
      message: 'Utilisateur mis à jour',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Vous ne pouvez pas supprimer votre propre compte'
      });
    }

    await prisma.user.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Utilisateur supprimé'
    });
  } catch (error) {
    next(error);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { status },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        status: true
      }
    });

    res.json({
      success: true,
      message: 'Statut mis à jour',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

const updateRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { role },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true
      }
    });

    res.json({
      success: true,
      message: 'Rôle mis à jour',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAll,
  getById,
  update,
  delete: deleteUser,
  updateStatus,
  updateRole
};
