const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  type: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    required: true
  },
  metrics: {
    users: {
      total: Number,
      new: Number,
      active: Number
    },
    articles: {
      total: Number,
      published: Number,
      views: Number,
      likes: Number,
      comments: Number
    },
    engagement: {
      averageReadTime: Number,
      bounceRate: Number,
      retentionRate: Number
    },
    devices: {
      mobile: Number,
      desktop: Number,
      tablet: Number
    },
    locations: [{
      country: String,
      city: String,
      views: Number
    }],
    sources: [{
      name: String,
      views: Number,
      clicks: Number
    }]
  }
}, {
  timestamps: true
});

// Index pour les requêtes fréquentes
analyticsSchema.index({ date: 1, type: 1 });

// Hook pour calculer les statistiques
analyticsSchema.pre('save', async function(next) {
  if (this.isNew) {
    // Calcul des statistiques
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    
    // Statistiques utilisateurs
    const userStats = await mongoose.model('User').aggregate([
      { $match: { createdAt: { $gte: startOfDay } } },
      { $count: 'newUsers' }
    ]);
    
    // Statistiques articles
    const articleStats = await mongoose.model('Article').aggregate([
      { $match: { publishDate: { $gte: startOfDay } } },
      { $count: 'newArticles' }
    ]);

    // Mettre à jour les métriques
    this.metrics.users.new = userStats[0]?.newUsers || 0;
    this.metrics.articles.total = articleStats[0]?.newArticles || 0;
  }
  next();
});

module.exports = mongoose.model('Analytics', analyticsSchema);
