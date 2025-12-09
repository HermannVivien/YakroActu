const Notification = require('../models/Notification');
const PushNotification = require('../models/PushNotification');
const { handleErrors } = require('./errorHandler');
const fcmAdmin = require('firebase-admin');

// Initialisation Firebase Admin
fcmAdmin.initializeApp({
  credential: fcmAdmin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
  })
});

const notificationController = {
  // Créer une notification
  createNotification: async (req, res) => {
    try {
      const { title, message, type, userIds, data } = req.body;

      // Créer la notification
      const notification = new Notification({
        title,
        message,
        type,
        sender: req.user._id,
        data
      });

      await notification.save();

      // Envoyer via FCM si userIds fournis
      if (userIds && userIds.length > 0) {
        const devices = await PushNotification.find({ userId: { $in: userIds } });
        const tokens = devices.map(device => device.token);

        if (tokens.length > 0) {
          const message = {
            notification: {
              title,
              body: message
            },
            data,
            tokens
          };

          await fcmAdmin.messaging().sendMulticast(message);
        }
      }

      res.status(201).json(notification);
    } catch (error) {
      handleErrors(res, error);
    }
  },

  // Obtenir les notifications d'un utilisateur
  getUserNotifications: async (req, res) => {
    try {
      const { page = 1, limit = 10, read = false } = req.query;
      const query = { userId: req.user._id };

      if (read !== undefined) {
        query.read = read === 'true';
      }

      const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .populate('sender', 'name')
        .exec();

      const count = await Notification.countDocuments(query);

      res.json({
        notifications,
        totalPages: Math.ceil(count / limit),
        currentPage: page
      });
    } catch (error) {
      handleErrors(res, error);
    }
  },

  // Marquer une notification comme lue
  markAsRead: async (req, res) => {
    try {
      const notification = await Notification.findByIdAndUpdate(
        req.params.id,
        { read: true },
        { new: true }
      );

      if (!notification) {
        return res.status(404).json({ error: 'Notification not found' });
      }

      res.json(notification);
    } catch (error) {
      handleErrors(res, error);
    }
  },

  // Marquer toutes les notifications comme lues
  markAllAsRead: async (req, res) => {
    try {
      const result = await Notification.updateMany(
        { userId: req.user._id },
        { read: true }
      );

      res.json({ message: 'All notifications marked as read', updated: result.nModified });
    } catch (error) {
      handleErrors(res, error);
    }
  },

  // Gérer les tokens FCM
  updateFcmToken: async (req, res) => {
    try {
      const { token } = req.body;
      
      // Vérifier si le token existe déjà
      const existingToken = await PushNotification.findOne({ userId: req.user._id });
      
      if (existingToken) {
        existingToken.token = token;
        await existingToken.save();
      } else {
        const newToken = new PushNotification({
          userId: req.user._id,
          token
        });
        await newToken.save();
      }

      res.json({ message: 'FCM token updated successfully' });
    } catch (error) {
      handleErrors(res, error);
    }
  }
};

module.exports = notificationController;
