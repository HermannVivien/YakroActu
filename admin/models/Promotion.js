const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
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
    enum: ['discount', 'bundle', 'subscription', 'event'],
    required: true
  },
  code: {
    type: String,
    unique: true,
    trim: true
  },
  discount: {
    type: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true
    },
    value: Number,
    currency: String
  },
  validity: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'expired'],
    default: 'inactive'
  },
  requirements: {
    minPurchase: Number,
    maxDiscount: Number,
    maxUses: Number,
    usedCount: {
      type: Number,
      default: 0
    }
  },
  target: {
    users: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    categories: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category'
    }],
    products: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }]
  },
  analytics: {
    totalUses: Number,
    revenueGenerated: Number,
    averageSpend: Number,
    conversionRate: Number
  },
  media: {
    banner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Media'
    },
    thumbnail: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Media'
    }
  }
}, {
  timestamps: true
});

// Index pour les requêtes fréquentes
promotionSchema.index({ code: 1, status: 1, startDate: 1, endDate: 1 });

// Hook pour vérifier les limites
promotionSchema.pre('save', function(next) {
  if (this.isModified('requirements')) {
    if (this.requirements.maxUses && this.requirements.usedCount >= this.requirements.maxUses) {
      this.status = 'inactive';
    }
  }
  next();
});

module.exports = mongoose.model('Promotion', promotionSchema);
