const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllPushNotifications = async (req, res) => {
  try {
    const { type, platform, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    if (type) where.type = type;
    if (platform) where.platform = platform;

    const [notifications, total] = await Promise.all([
      prisma.pushNotification.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.pushNotification.count({ where })
    ]);

    res.json({
      success: true,
      data: notifications,
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

exports.createPushNotification = async (req, res) => {
  try {
    console.log('📥 Données reçues:', JSON.stringify(req.body, null, 2));
    
    const { title, body, imageUrl, deepLink, platform, targetUserIds, scheduledFor, data } = req.body;
    
    if (!title || !body) {
      console.log('❌ Validation échouée - title:', title, 'body:', body);
      return res.status(400).json({ success: false, message: 'Titre et message requis' });
    }

    const notificationData = {
      title,
      message: body, // Mapper body -> message
      imageUrl: imageUrl || null,
      link: deepLink || null, // Mapper deepLink -> link
      platform: platform === 'ALL' ? null : platform, // NULL pour ALL
      userIds: targetUserIds || null, // Mapper targetUserIds -> userIds
      scheduledAt: scheduledFor ? new Date(scheduledFor) : null
    };
    
    console.log('💾 Données à créer:', JSON.stringify(notificationData, null, 2));

    const notification = await prisma.pushNotification.create({
      data: notificationData
    });

    console.log('✅ Notification créée:', notification.id);
    res.status(201).json({ success: true, message: 'Notification créée', data: notification });
  } catch (error) {
    console.error('❌ Erreur création notification:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.sendPushNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await prisma.pushNotification.findUnique({
      where: { id: parseInt(id) }
    });

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification non trouvée' });
    }

    // TODO: Implémenter l'envoi réel via Firebase Cloud Messaging
    // Pour l'instant, on marque juste comme envoyé

    const updated = await prisma.pushNotification.update({
      where: { id: parseInt(id) },
      data: {
        sentAt: new Date(),
        sentCount: { increment: 1 }
      }
    });

    res.json({ success: true, message: 'Notification envoyée', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deletePushNotification = async (req, res) => {
  try {
    await prisma.pushNotification.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ success: true, message: 'Notification supprimée' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
