const Chat = require('../models/Chat');
const Message = require('../models/Message');
const User = require('../models/User');
const io = require('socket.io')(5001, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS.split(','),
    methods: ['GET', 'POST']
  }
});

const chatController = {
  // Créer une nouvelle conversation
  createChat: async (req, res) => {
    try {
      const { participants } = req.body;
      
      // Vérifier si une conversation existe déjà
      const existingChat = await Chat.findOne({
        participants: { $all: participants }
      });

      if (existingChat) {
        return res.status(400).json({ error: 'Chat already exists' });
      }

      const chat = new Chat({
        participants,
        lastMessage: null,
        unreadCount: new Map(participants.map(id => [id, 0]))
      });

      await chat.save();

      // Émettre l'événement de création de chat
      io.emit('chatCreated', chat);

      res.status(201).json(chat);
    } catch (error) {
      handleErrors(res, error);
    }
  },

  // Obtenir les conversations d'un utilisateur
  getUserChats: async (req, res) => {
    try {
      const chats = await Chat.find({
        participants: req.user._id
      })
      .populate('participants', 'name profilePicture')
      .sort({ updatedAt: -1 })
      .exec();

      res.json(chats);
    } catch (error) {
      handleErrors(res, error);
    }
  },

  // Envoyer un message
  sendMessage: async (req, res) => {
    try {
      const { chatId, content, type = 'text' } = req.body;

      const message = new Message({
        chat: chatId,
        sender: req.user._id,
        content,
        type
      });

      await message.save();

      // Mettre à jour le chat
      const chat = await Chat.findById(chatId);
      chat.lastMessage = message;
      chat.updatedAt = new Date();

      // Mettre à jour le compteur de messages non lus
      chat.participants.forEach(participant => {
        if (participant.toString() !== req.user._id.toString()) {
          chat.unreadCount.set(participant.toString(), 
            (chat.unreadCount.get(participant.toString()) || 0) + 1
          );
        }
      });

      await chat.save();

      // Émettre l'événement de message
      io.to(chatId).emit('message', {
        message,
        chat
      });

      res.json(message);
    } catch (error) {
      handleErrors(res, error);
    }
  },

  // Marquer les messages comme lus
  markMessagesAsRead: async (req, res) => {
    try {
      const { chatId } = req.body;
      const chat = await Chat.findById(chatId);

      if (!chat) {
        return res.status(404).json({ error: 'Chat not found' });
      }

      chat.unreadCount.set(req.user._id.toString(), 0);
      await chat.save();

      // Émettre l'événement de mise à jour du chat
      io.to(chatId).emit('chatUpdated', chat);

      res.json(chat);
    } catch (error) {
      handleErrors(res, error);
    }
  },

  // Obtenir les messages d'une conversation
  getChatMessages: async (req, res) => {
    try {
      const { chatId, page = 1, limit = 20 } = req.query;
      const messages = await Message.find({ chat: chatId })
        .populate('sender', 'name profilePicture')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

      const count = await Message.countDocuments({ chat: chatId });

      res.json({
        messages,
        totalPages: Math.ceil(count / limit),
        currentPage: page
      });
    } catch (error) {
      handleErrors(res, error);
    }
  }
};

// Socket.IO middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return next(new Error('Authentication error'));
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return next(new Error('User not found'));
    }

    socket.user = user;
    next();
  });
});

// Socket.IO events
io.on('connection', (socket) => {
  console.log('User connected:', socket.user._id);

  // Join chat rooms
  socket.on('joinChat', (chatId) => {
    socket.join(chatId);
  });

  // Leave chat rooms
  socket.on('leaveChat', (chatId) => {
    socket.leave(chatId);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.user._id);
  });
});

module.exports = {
  chatController,
  io
};
