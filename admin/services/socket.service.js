const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

let io;

/**
 * Initialiser Socket.IO
 */
const initializeSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
      credentials: true
    }
  });

  // Middleware d'authentification
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Récupérer l'utilisateur
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          avatar: true,
          role: true
        }
      });

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  // Gestion des connexions
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.id} - ${socket.user.firstName} ${socket.user.lastName}`);

    // Rejoindre les conversations de l'utilisateur
    socket.on('join_chats', async () => {
      try {
        const chats = await prisma.chat.findMany({
          where: {
            participants: {
              has: socket.user.id
            }
          },
          select: { id: true }
        });

        chats.forEach(chat => {
          socket.join(`chat_${chat.id}`);
        });

        console.log(`User ${socket.user.id} joined ${chats.length} chat rooms`);
      } catch (error) {
        console.error('Error joining chats:', error);
      }
    });

    // Rejoindre une conversation spécifique
    socket.on('join_chat', async (chatId) => {
      try {
        const chat = await prisma.chat.findUnique({
          where: { id: parseInt(chatId) }
        });

        if (!chat) {
          socket.emit('error', { message: 'Chat not found' });
          return;
        }

        // Vérifier que l'utilisateur fait partie de la conversation
        if (!chat.participants.includes(socket.user.id)) {
          socket.emit('error', { message: 'Unauthorized' });
          return;
        }

        socket.join(`chat_${chatId}`);
        console.log(`User ${socket.user.id} joined chat ${chatId}`);
      } catch (error) {
        console.error('Error joining chat:', error);
        socket.emit('error', { message: 'Error joining chat' });
      }
    });

    // Envoyer un message
    socket.on('send_message', async (data) => {
      try {
        const { chatId, content, type = 'text' } = data;

        // Vérifier que l'utilisateur fait partie de la conversation
        const chat = await prisma.chat.findUnique({
          where: { id: parseInt(chatId) }
        });

        if (!chat) {
          socket.emit('error', { message: 'Chat not found' });
          return;
        }

        if (!chat.participants.includes(socket.user.id)) {
          socket.emit('error', { message: 'Unauthorized' });
          return;
        }

        // Créer le message
        const message = await prisma.chatMessage.create({
          data: {
            content,
            type,
            senderId: socket.user.id,
            chatId: parseInt(chatId)
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

        // Mettre à jour la date du chat
        await prisma.chat.update({
          where: { id: parseInt(chatId) },
          data: { updatedAt: new Date() }
        });

        // Envoyer le message à tous les participants
        io.to(`chat_${chatId}`).emit('new_message', message);

        console.log(`Message sent in chat ${chatId} by user ${socket.user.id}`);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Error sending message' });
      }
    });

    // Utilisateur en train d'écrire
    socket.on('typing', (chatId) => {
      socket.to(`chat_${chatId}`).emit('user_typing', {
        chatId,
        user: {
          id: socket.user.id,
          firstName: socket.user.firstName,
          lastName: socket.user.lastName
        }
      });
    });

    // Utilisateur arrête d'écrire
    socket.on('stop_typing', (chatId) => {
      socket.to(`chat_${chatId}`).emit('user_stop_typing', {
        chatId,
        userId: socket.user.id
      });
    });

    // Marquer les messages comme lus
    socket.on('mark_read', async (chatId) => {
      try {
        await prisma.chatMessage.updateMany({
          where: {
            chatId: parseInt(chatId),
            senderId: { not: socket.user.id },
            isRead: false
          },
          data: { isRead: true }
        });

        // Notifier les autres participants
        socket.to(`chat_${chatId}`).emit('messages_read', {
          chatId,
          userId: socket.user.id
        });
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });

    // Déconnexion
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.id}`);
    });
  });

  return io;
};

/**
 * Obtenir l'instance Socket.IO
 */
const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

/**
 * Envoyer une notification à un utilisateur
 */
const sendNotification = (userId, notification) => {
  if (io) {
    io.to(`user_${userId}`).emit('notification', notification);
  }
};

module.exports = {
  initializeSocket,
  getIO,
  sendNotification
};
