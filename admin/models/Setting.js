const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  type: {
    type: String,
    enum: ['string', 'number', 'boolean', 'object', 'array'],
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  group: {
    type: String,
    enum: [
      'app',
      'theme',
      'notifications',
      'security',
      'analytics',
      'social',
      'seo'
    ],
    default: 'app'
  },
  isEditable: {
    type: Boolean,
    default: true
  },
  metadata: {
    defaultValue: mongoose.Schema.Types.Mixed,
    validation: {
      type: String,
      pattern: String
    }
  }
}, {
  timestamps: true
});

// Index pour les requêtes fréquentes
settingSchema.index({ key: 1, group: 1 });

module.exports = mongoose.model('Setting', settingSchema);
