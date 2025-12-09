const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'contentType',
    required: true
  },
  contentType: {
    type: String,
    enum: ['Article', 'Video', 'Audio', 'Event', 'Pharmacy'],
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  tags: [{
    type: String,
    trim: true
  }],
  notes: {
    type: String,
    trim: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  status: {
    type: String,
    enum: ['active', 'archived'],
    default: 'active'
  },
  metadata: {
    lastViewed: Date,
    viewCount: Number,
    shareCount: Number,
    lastShared: Date
  }
}, {
  timestamps: true
});

// Index pour les requêtes fréquentes
favoriteSchema.index({ user: 1, contentType: 1, content: 1 });
favoriteSchema.index({ rating: -1 });

module.exports = mongoose.model('Favorite', favoriteSchema);
