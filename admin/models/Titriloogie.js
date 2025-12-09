const mongoose = require('mongoose');

const titriloogieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  subtitle: {
    type: String,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['main', 'secondary', 'highlight', 'breaking'],
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  media: {
    image: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Media'
    },
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Media'
    }
  },
  relatedArticle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article'
  },
  displaySettings: {
    position: {
      type: String,
      enum: ['top', 'bottom', 'left', 'right', 'center']
    },
    size: {
      type: String,
      enum: ['small', 'medium', 'large', 'full']
    },
    animation: {
      type: String,
      enum: ['fade', 'slide', 'zoom']
    },
    duration: {
      type: Number, // en millisecondes
      default: 3000
    }
  },
  schedule: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date
    },
    priority: {
      type: Number,
      default: 0
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'scheduled', 'expired'],
    default: 'inactive'
  },
  analytics: {
    views: Number,
    clicks: Number,
    engagementRate: Number,
    averageDuration: Number
  },
  metadata: {
    source: String,
    author: String,
    tags: [String],
    keywords: [String]
  }
}, {
  timestamps: true
});

// Index pour les requêtes fréquentes
titriloogieSchema.index({ type: 1, status: 1, priority: -1 });
titriloogieSchema.index({ schedule: 1 });
titriloogieSchema.index({ category: 1 });

// Hook pour mettre à jour le statut en fonction du schedule
titriloogieSchema.pre('save', function(next) {
  const now = new Date();
  if (now >= this.schedule.startDate && (!this.schedule.endDate || now <= this.schedule.endDate)) {
    this.status = 'active';
  } else {
    this.status = 'inactive';
  }
  next();
});

module.exports = mongoose.model('Titriloogie', titriloogieSchema);
