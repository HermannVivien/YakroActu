const prisma = require('../config/prisma');

/**
 * Obtenir toutes les notifications de l'utilisateur
 */
const getMyNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, type, isRead } = req.query;

    const skip = (page - 1) * limit;
    const where = { userId };

    if (type) where.type = type;
    if (isRead !== undefined) where.isRead = isRead === 'true';

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId, isRead: false } })
    ]);

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Marquer une notification comme lue
 */
const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await prisma.notification.findUnique({
      where: { id: parseInt(id) }
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification non trouvée'
      });
    }

    if (notification.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé'
      });
    }

    await prisma.notification.update({
      where: { id: parseInt(id) },
      data: { isRead: true }
    });

    res.json({
      success: true,
      message: 'Notification marquée comme lue'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Marquer toutes les notifications comme lues
 */
const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;

    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    });

    res.json({
      success: true,
      message: 'Toutes les notifications marquées comme lues'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Supprimer une notification
 */
const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await prisma.notification.findUnique({
      where: { id: parseInt(id) }
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification non trouvée'
      });
    }

    if (notification.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé'
      });
    }

    await prisma.notification.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Notification supprimée'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
};
