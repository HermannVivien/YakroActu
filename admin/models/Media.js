const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['image', 'video', 'audio', 'document', 'flash', 'ticker'],
    required: true
  },
  subtype: {
    type: String,
    enum: [
      'reportage', 'interview', 'podcast', 'direct',
      'flash_info', 'ticker_message', 'pharmacy', 'advertisement'
    ]
  },
  url: {
    type: String,
    required: true,
    trim: true
  },
  thumbnail: {
    type: String,
    trim: true
  },
  duration: {
    type: Number, // En secondes
    default: 0
  },
  size: {
    type: Number, // En bytes
    required: true
  },
  metadata: {
    width: Number,
    height: Number,
    format: String,
    resolution: String,
    bitrate: Number,
    frameRate: Number,
    sampleRate: Number,
    channels: Number
  },
  content: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'archived', 'draft'],
    default: 'draft'
  },
  priority: {
    type: Number,
    default: 0
  },
  displaySettings: {
    position: {
      type: String,
      enum: ['top', 'bottom', 'left', 'right', 'center']
    },
    duration: {
      type: Number, // En millisecondes
      default: 5000
    },
    animation: {
      type: String,
      enum: ['slide', 'fade', 'scroll']
    },
    backgroundColor: String,
    textColor: String,
    fontSize: Number
  },
  schedule: {
    startDate: Date,
    endDate: Date,
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
  tags: [{
    type: String,
    trim: true
  }],
  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  relatedTo: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'relatedModel'
  },
  relatedModel: {
    type: String,
    enum: ['Article', 'Event', 'User', 'Pharmacy'],
    default: 'Article'
  },
  analytics: {
    views: Number,
    clicks: Number,
    engagementRate: Number,
    averageDuration: Number
  }
}, {
  timestamps: true
});

// Index pour les requêtes fréquentes
mediaSchema.index({ type: 1, subtype: 1, status: 1, priority: -1 });
mediaSchema.index({ schedule: 1 });
mediaSchema.index({ location: '2dsphere' });

// Hook pour générer le thumbnail si nécessaire
mediaSchema.post('save', async function(doc) {
  if (doc.type === 'video' && !doc.thumbnail) {
    // Logique pour générer le thumbnail
    // À implémenter selon vos besoins
  }
});

module.exports = mongoose.model('Media', mediaSchema);
