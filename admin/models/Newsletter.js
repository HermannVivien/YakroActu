const mongoose = require('mongoose');

const newsletterSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  template: {
    type: String,
    enum: ['default', 'digest', 'event', 'promotion'],
    default: 'default'
  },
  articles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article'
  }],
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'sent', 'cancelled'],
    default: 'draft'
  },
  schedule: {
    type: Date,
    default: null
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'custom'],
    default: 'weekly'
  },
  recipients: {
    total: Number,
    groups: [{
      name: String,
      count: Number
    }]
  },
  analytics: {
    sent: Number,
    delivered: Number,
    opened: Number,
    clicked: Number,
    unsubscribe: Number,
    bounce: Number
  },
  attachments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Media'
  }],
  settings: {
    replyTo: String,
    fromName: String,
    fromEmail: String,
    tracking: {
      open: Boolean,
      click: Boolean
    }
  }
}, {
  timestamps: true
});

// Index pour les requêtes fréquentes
newsletterSchema.index({ status: 1, schedule: 1, frequency: 1 });

module.exports = mongoose.model('Newsletter', newsletterSchema);
