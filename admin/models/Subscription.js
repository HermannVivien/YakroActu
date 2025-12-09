const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plan: {
    type: String,
    enum: ['basic', 'premium', 'enterprise'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled', 'pending'],
    default: 'pending'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  payment: {
    provider: String,
    transactionId: String,
    amount: Number,
    currency: String,
    status: String
  },
  features: {
    type: Map,
    of: Boolean,
    default: {
      unlimitedAccess: false,
      premiumContent: false,
      noAds: false,
      offlineReading: false
    }
  },
  metadata: {
    renewalDate: Date,
    autoRenew: Boolean,
    trialPeriod: Boolean,
    trialEndDate: Date
  }
}, {
  timestamps: true
});

// Index pour les requêtes fréquentes
subscriptionSchema.index({ user: 1, status: 1, endDate: 1 });

// Hook pour mettre à jour l'accès utilisateur
subscriptionSchema.post('save', async function(doc) {
  if (doc.status === 'active') {
    await mongoose.model('User').findByIdAndUpdate(
      doc.user,
      { $set: { subscriptionStatus: 'active' } }
    );
  }
});

module.exports = mongoose.model('Subscription', subscriptionSchema);
