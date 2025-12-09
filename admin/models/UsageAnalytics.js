const mongoose = require('mongoose');

const usageAnalyticsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  type: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    required: true
  },
  metrics: {
    users: {
      total: Number,
      new: Number,
      active: Number,
      byPlatform: {
        android: Number,
        ios: Number,
        web: Number
      }
    },
    content: {
      views: Number,
      likes: Number,
      shares: Number,
      comments: Number,
      byType: {
        articles: Number,
        videos: Number,
        audio: Number,
        pharmacy: Number
      }
    },
    engagement: {
      averageSessionDuration: Number,
      bounceRate: Number,
      retentionRate: Number,
      pagesPerSession: Number
    },
    devices: {
      totalSessions: Number,
      uniqueDevices: Number,
      byDevice: {
        mobile: Number,
        tablet: Number,
        desktop: Number
      }
    },
    locations: [{
      country: String,
      city: String,
      views: Number,
      users: Number
    }],
    sources: [{
      name: String,
      views: Number,
      users: Number,
      conversionRate: Number
    }]
  },
  performance: {
    loadTime: {
      average: Number,
      byPage: Map
    },
    errorRate: {
      total: Number,
      byType: Map
    },
    apiCalls: {
      total: Number,
      byEndpoint: Map,
      responseTime: Map
    }
  }
}, {
  timestamps: true
});

// Index pour les requêtes fréquentes
usageAnalyticsSchema.index({ date: 1, type: 1 });
usageAnalyticsSchema.index({ 'metrics.users.total': -1 });

module.exports = mongoose.model('UsageAnalytics', usageAnalyticsSchema);
