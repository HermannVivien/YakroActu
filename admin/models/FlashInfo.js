const mongoose = require('mongoose');

const flashInfoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['flash', 'ticker', 'banner', 'alert'],
    required: true
  },
  category: {
    type: String,
    enum: ['news', 'emergency', 'promotion', 'health', 'weather'],
    required: true
  },
  priority: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  displaySettings: {
    position: {
      type: String,
      enum: ['top', 'bottom', 'left', 'right', 'center']
    },
    speed: {
      type: Number, // vitesse de défilement en pixels par seconde
      default: 50
    },
    direction: {
      type: String,
      enum: ['left', 'right', 'up', 'down']
    },
    backgroundColor: String,
    textColor: String,
    fontSize: {
      type: Number,
      default: 16
    },
    animation: {
      type: String,
      enum: ['slide', 'fade', 'scroll']
    }
  },
  schedule: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    repeat: {
      type: String,
      enum: ['none', 'daily', 'weekly', 'monthly']
    },
    days: [String],
    times: [{
      start: String,
      end: String
    }]
  },
  location: {
    cities: [String],
    areas: [String],
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        default: [0, 0]
      }
    }
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
flashInfoSchema.index({ type: 1, category: 1, priority: -1 });
flashInfoSchema.index({ schedule: 1 });
flashInfoSchema.index({ location: '2dsphere' });

// Hook pour mettre à jour le statut en fonction du schedule
flashInfoSchema.pre('save', function(next) {
  const now = new Date();
  if (now >= this.schedule.startDate && now <= this.schedule.endDate) {
    this.status = 'active';
  } else {
    this.status = 'inactive';
  }
  next();
});

module.exports = mongoose.model('FlashInfo', flashInfoSchema);
