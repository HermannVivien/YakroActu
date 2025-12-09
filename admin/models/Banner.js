const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  image: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Media',
    required: true
  },
  url: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['header', 'sidebar', 'footer', 'interstitial', 'native'],
    required: true
  },
  position: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'expired'],
    default: 'inactive'
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  target: {
    platform: {
      type: String,
      enum: ['all', 'mobile', 'web'],
      default: 'all'
    },
    device: {
      type: String,
      enum: ['all', 'ios', 'android'],
      default: 'all'
    },
    location: {
      countries: [String],
      cities: [String]
    }
  },
  analytics: {
    views: Number,
    clicks: Number,
    ctr: Number,
    revenue: Number
  },
  metadata: {
    advertiser: String,
    campaign: String,
    trackingCode: String
  }
}, {
  timestamps: true
});

// Index pour les requêtes fréquentes
bannerSchema.index({ type: 1, status: 1, startDate: 1, endDate: 1 });

module.exports = mongoose.model('Banner', bannerSchema);
