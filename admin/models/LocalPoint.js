const mongoose = require('mongoose');

const localPointSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: [
      'pharmacy', 'hospital', 'clinic', 'vaccination_center',
      'emergency_service', 'police', 'fire_station', 'school',
      'university', 'library', 'community_center', 'market',
      'park', 'museum', 'restaurant', 'hotel'
    ],
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  address: {
    street: String,
    city: String,
    district: String,
    postalCode: String,
    country: String
  },
  contact: {
    phone: String,
    email: String,
    website: String,
    whatsapp: String
  },
  operatingHours: {
    regular: {
      open: String,
      close: String
    },
    weekend: {
      open: String,
      close: String
    },
    holidays: [{
      date: Date,
      open: String,
      close: String
    }]
  },
  services: [{
    name: String,
    description: String,
    availability: {
      type: String,
      enum: ['24h', 'regular', 'appointment', 'emergency']
    }
  }],
  media: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Media'
  }],
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    date: Date
  }],
  analytics: {
    visits: Number,
    reviews: Number,
    averageRating: Number,
    lastUpdated: Date
  },
  metadata: {
    emergencyContact: {
      name: String,
      phone: String,
      email: String
    },
    capacity: Number,
    accessibility: {
      wheelchair: Boolean,
      parking: Boolean,
      publicTransport: Boolean
    }
  },
  tags: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance', 'closed'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Index pour les requêtes fréquentes
localPointSchema.index({ category: 1, status: 1 });
localPointSchema.index({ location: '2dsphere' });
localPointSchema.index({ 'analytics.averageRating': -1 });

// Méthode pour calculer la distance
localPointSchema.methods.calculateDistance = function(lat, lng) {
  const R = 6371; // Rayon de la Terre en km
  const dLat = this.location.coordinates[1] * Math.PI / 180 - lat * Math.PI / 180;
  const dLon = this.location.coordinates[0] * Math.PI / 180 - lng * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat * Math.PI / 180) * Math.cos(this.location.coordinates[1] * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance en km
};

module.exports = mongoose.model('LocalPoint', localPointSchema);
