const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['conference', 'workshop', 'webinar', 'meeting', 'festival'],
    default: 'conference'
  },
  location: {
    name: String,
    address: String,
    city: String,
    country: String,
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
  dates: {
    start: {
      type: Date,
      required: true
    },
    end: {
      type: Date,
      required: true
    }
  },
  status: {
    type: String,
    enum: ['upcoming', 'live', 'past', 'cancelled'],
    default: 'upcoming'
  },
  tickets: {
    available: Number,
    sold: Number,
    price: Number,
    currency: String,
    types: [{
      name: String,
      price: Number,
      quantity: Number
    }]
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
  media: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Media'
  }],
  registration: {
    open: Boolean,
    url: String,
    deadline: Date
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Index pour les requêtes fréquentes
eventSchema.index({ dates: 1, status: 1, category: 1 });

module.exports = mongoose.model('Event', eventSchema);
