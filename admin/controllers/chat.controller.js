const prisma = require('../config/prisma');

/**
 * Obtenir mes conversations
 */
const getMyChats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    const skip = (page - 1) * limit;

    const [chats, total] = await Promise.all([
      prisma.chat.findMany({
        where: {
          participants: {
            has: userId
          }
        },
        include: {
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            include: {
              sender: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatar: true
                }
              }
            }
          }
        },
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { updatedAt: 'desc' }
      }),
      prisma.chat.count({
        where: {
          participants: {
            has: userId
          }
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        chats,
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
 * Obtenir une conversation par ID
 */
const getChatById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const chat = await prisma.chat.findUnique({
      where: { id: parseInt(id) },
      include: {
        messages: {
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 50
        }
      }
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Conversation non trouvée'
      });
    }

    // Vérifier que l'utilisateur fait partie de la conversation
    if (!chat.participants.includes(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé'
      });
    }

    res.json({
      success: true,
      data: chat
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Créer une conversation
 */
const createChat = async (req, res, next) => {
  try {
    const { participantIds, name, type = 'PRIVATE' } = req.body;
    const userId = req.user.id;

    // Ajouter l'utilisateur actuel aux participants
    const allParticipants = [userId, ...participantIds.filter(id => id !== userId)];

    // Si conversation privée, vérifier qu'il n'y a que 2 participants
    if (type === 'PRIVATE' && allParticipants.length !== 2) {
      return res.status(400).json({
        success: false,
        message: 'Une conversation privée doit avoir exactement 2 participants'
      });
    }

    // Vérifier si une conversation privée existe déjà entre ces utilisateurs
    if (type === 'PRIVATE') {
      const existing = await prisma.chat.findFirst({
        where: {
          type: 'PRIVATE',
          AND: allParticipants.map(id => ({
            participants: { has: id }
          }))
        }
      });

      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'Une conversation existe déjà',
          data: existing
        });
      }
    }

    const chat = await prisma.chat.create({
      data: {
        name,
        type,
        participants: allParticipants
      }
    });

    res.status(201).json({
      success: true,
      data: chat,
      message: 'Conversation créée'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtenir les messages d'une conversation
 */
const getChatMessages = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const userId = req.user.id;

    // Vérifier que l'utilisateur fait partie de la conversation
    const chat = await prisma.chat.findUnique({
      where: { id: parseInt(id) }
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Conversation non trouvée'
      });
    }

    if (!chat.participants.includes(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé'
      });
    }

    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      prisma.chatMessage.findMany({
        where: { chatId: parseInt(id) },
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true
            }
          }
        },
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.chatMessage.count({ where: { chatId: parseInt(id) } })
    ]);

    res.json({
      success: true,
      data: {
        messages: messages.reverse(), // Plus ancien en premier
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
 * Envoyer un message
 */
const sendMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content, type = 'text' } = req.body;
    const userId = req.user.id;

    // Vérifier que l'utilisateur fait partie de la conversation
    const chat = await prisma.chat.findUnique({
      where: { id: parseInt(id) }
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Conversation non trouvée'
      });
    }

    if (!chat.participants.includes(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé'
      });
    }

    const message = await prisma.chatMessage.create({
      data: {
        content,
        type,
        senderId: userId,
        chatId: parseInt(id)
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    });

    // Mettre à jour la date de modification du chat
    await prisma.chat.update({
      where: { id: parseInt(id) },
      data: { updatedAt: new Date() }
    });

    res.status(201).json({
      success: true,
      data: message
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Marquer les messages comme lus
 */
const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Vérifier que l'utilisateur fait partie de la conversation
    const chat = await prisma.chat.findUnique({
      where: { id: parseInt(id) }
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Conversation non trouvée'
      });
    }

    if (!chat.participants.includes(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé'
      });
    }

    await prisma.chatMessage.updateMany({
      where: {
        chatId: parseInt(id),
        senderId: { not: userId },
        isRead: false
      },
      data: { isRead: true }
    });

    res.json({
      success: true,
      message: 'Messages marqués comme lus'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyChats,
  getChatById,
  createChat,
  getChatMessages,
  sendMessage,
  markAsRead
};
