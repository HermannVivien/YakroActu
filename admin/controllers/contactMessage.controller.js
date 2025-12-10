const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllMessages = async (req, res) => {
  try {
    const { isRead, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    if (isRead !== undefined) where.isRead = isRead === 'true';

    const [messages, total] = await Promise.all([
      prisma.contactMessage.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.contactMessage.count({ where })
    ]);

    res.json({
      success: true,
      data: messages,
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

exports.createMessage = async (req, res) => {
  try {
    const { name, email, subject, message, phone } = req.body;
    
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: 'Données manquantes' });
    }

    const contactMessage = await prisma.contactMessage.create({
      data: { name, email, subject, message, phone }
    });

    res.status(201).json({ success: true, message: 'Message envoyé', data: contactMessage });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const message = await prisma.contactMessage.update({
      where: { id: parseInt(req.params.id) },
      data: { isRead: true }
    });

    res.json({ success: true, message: 'Message marqué comme lu', data: message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.markAsReplied = async (req, res) => {
  try {
    const message = await prisma.contactMessage.update({
      where: { id: parseInt(req.params.id) },
      data: { repliedAt: new Date(), isRead: true }
    });

    res.json({ success: true, message: 'Message marqué comme répondu', data: message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    await prisma.contactMessage.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ success: true, message: 'Message supprimé' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
