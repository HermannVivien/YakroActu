const mongoose = require('mongoose');

const liveEventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['news', 'conference', 'workshop', 'debate', 'interview'],
    required: true
  },
  category: {
    type: String,
    enum: ['politics', 'economy', 'health', 'society', 'education'],
    required: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'live', 'ended', 'cancelled'],
    default: 'scheduled'
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
    timezone: String
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    },
    address: String,
    capacity: Number
  },
  media: {
    thumbnail: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Media'
    },
    streamUrl: String,
    archiveUrl: String,
    quality: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    }
  },
  speakers: [{
    name: String,
    title: String,
    bio: String,
    photo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Media'
    }
  }],
  interactions: {
    liveChat: Boolean,
    questions: Boolean,
    polls: Boolean,
    comments: Boolean
  },
  analytics: {
    viewers: Number,
    peakViewers: Number,
    engagementRate: Number,
    comments: Number,
    questions: Number,
    duration: Number
  },
  settings: {
    record: Boolean,
    allowReplay: Boolean,
    allowComments: Boolean,
    requireRegistration: Boolean
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Index pour les requêtes fréquentes
liveEventSchema.index({ status: 1, schedule: 1 });
liveEventSchema.index({ type: 1, category: 1 });
liveEventSchema.index({ location: '2dsphere' });

// Hook pour mettre à jour le statut
liveEventSchema.pre('save', function(next) {
  const now = new Date();
  if (now >= this.schedule.startDate && now <= this.schedule.endDate) {
    this.status = 'live';
  } else if (now > this.schedule.endDate) {
    this.status = 'ended';
  }
  next();
});

module.exports = mongoose.model('LiveEvent', liveEventSchema);
