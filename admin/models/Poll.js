const mongoose = require('mongoose');

const pollSchema = new mongoose.Schema({
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
    enum: ['single', 'multiple', 'rating'],
    default: 'single'
  },
  options: [{
    text: {
      type: String,
      required: true,
      trim: true
    },
    image: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Media'
    },
    votes: {
      type: Number,
      default: 0
    }
  }],
  status: {
    type: String,
    enum: ['draft', 'active', 'closed'],
    default: 'draft'
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  settings: {
    allowMultipleVotes: Boolean,
    showResults: {
      type: String,
      enum: ['always', 'after_vote', 'never'],
      default: 'after_vote'
    },
    anonymous: Boolean,
    minAge: Number,
    maxAge: Number
  },
  analytics: {
    totalVotes: Number,
    uniqueVoters: Number,
    demographics: {
      age: Map,
      gender: Map,
      location: Map
    }
  },
  relatedTo: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'relatedModel'
  },
  relatedModel: {
    type: String,
    enum: ['Article', 'Event', 'User'],
    default: 'Article'
  }
}, {
  timestamps: true
});

// Index pour les requêtes fréquentes
pollSchema.index({ status: 1, startDate: 1, endDate: 1 });

// Hook pour mettre à jour les votes
pollSchema.pre('save', function(next) {
  if (this.isModified('options')) {
    this.analytics.totalVotes = this.options.reduce((sum, option) => sum + option.votes, 0);
  }
  next();
});

module.exports = mongoose.model('Poll', pollSchema);
