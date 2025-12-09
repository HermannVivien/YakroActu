const mongoose = require('mongoose');

const pushNotificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['news', 'emergency', 'promotion', 'event', 'update'],
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'critical'],
    default: 'normal'
  },
  target: {
    type: String,
    enum: ['all', 'segment', 'user'],
    required: true
  },
  segment: {
    platform: {
      type: String,
      enum: ['android', 'ios', 'web'],
      default: 'all'
    },
    location: {
      cities: [String],
      countries: [String]
    },
    tags: [String],
    categories: [String]
  },
  data: {
    contentUrl: String,
    imageUrl: String,
    action: String,
    parameters: Map
  },
  schedule: {
    sendAt: Date,
    timezone: String,
    repeat: {
      type: String,
      enum: ['none', 'daily', 'weekly', 'monthly']
    }
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'sent', 'failed', 'cancelled'],
    default: 'draft'
  },
  analytics: {
    sent: Number,
    delivered: Number,
    opened: Number,
    clicked: Number,
    conversionRate: Number
  },
  relatedTo: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'relatedModel'
  },
  relatedModel: {
    type: String,
    enum: ['Article', 'Event', 'Pharmacy', 'User'],
    default: 'Article'
  }
}, {
  timestamps: true
});

// Index pour les requêtes fréquentes
pushNotificationSchema.index({ type: 1, status: 1, schedule: 1 });
pushNotificationSchema.index({ target: 1, segment: 1 });

module.exports = mongoose.model('PushNotification', pushNotificationSchema);
