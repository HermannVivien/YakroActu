const mongoose = require('mongoose');

const pharmacySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    street: String,
    city: String,
    district: String,
    postalCode: String,
    country: String
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
  contact: {
    phone: {
      type: String,
      required: true
    },
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
    type: String,
    enum: [
      '24h', 'prescription', 'delivery', 'emergency',
      'medical_advice', 'vaccination', 'medical_tests',
      'online_consultation', 'home_visit'
    ]
  }],
  emergencyContact: {
    name: String,
    phone: String,
    email: String
  },
  schedule: {
    startDate: Date,
    endDate: Date,
    rotation: {
      type: String,
      enum: ['daily', 'weekly', 'monthly']
    },
    days: [String],
    times: [{
      start: String,
      end: String
    }]
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'closed', 'maintenance'],
    default: 'active'
  },
  type: {
    type: String,
    enum: ['public', 'private', 'specialized'],
    default: 'public'
  },
  specializations: [{
    type: String,
    enum: [
      'general', 'pediatric', 'dermatology', 'cardiology',
      'neurology', 'psychiatry', 'oncology', 'pharmacy',
      'vaccination', 'emergency', 'delivery'
    ]
  }],
  media: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Media'
  }],
  qrCode: {
    url: String,
    content: String,
    lastUpdated: Date
  },
  mobileApp: {
    android: {
      package: String,
      version: String,
      downloadUrl: String
    },
    ios: {
      bundleId: String,
      version: String,
      downloadUrl: String
    }
  },
  analytics: {
    visits: Number,
    prescriptions: Number,
    emergencyCalls: Number,
    lastCheck: Date,
    mobileUsers: Number,
    averageRating: Number,
    reviews: Number
  },
  notes: String,
  lastUpdate: Date,
  metadata: {
    rating: Number,
    reviews: Number,
    lastReview: Date,
    mobileFeatures: {
      appointmentBooking: Boolean,
      prescriptionUpload: Boolean,
      onlineConsultation: Boolean,
      deliveryTracking: Boolean
    }
  }
}, {
  timestamps: true
});

// Index pour les requêtes fréquentes
pharmacySchema.index({ location: '2dsphere' });
pharmacySchema.index({ status: 1, type: 1 });
pharmacySchema.index({ 'schedule.startDate': 1, 'schedule.endDate': 1 });
pharmacySchema.index({ 'analytics.rating': -1 });

// Hook pour mettre à jour le statut en fonction du schedule
pharmacySchema.pre('save', function(next) {
  const now = new Date();
  const currentDay = now.getDay();
  const currentTime = now.getHours() + ':' + now.getMinutes();

  if (this.schedule.days.includes(currentDay.toString()) &&
      currentTime >= this.schedule.times[0].start &&
      currentTime <= this.schedule.times[0].end) {
    this.status = 'active';
  } else {
    this.status = 'inactive';
  }

  // Générer QR code si nécessaire
  if (!this.qrCode.url) {
    this.qrCode = {
      url: `https://yakroactu.com/pharmacy/${this._id}`,
      content: `Pharmacy: ${this.name}\nAddress: ${this.address.street}`,
      lastUpdated: new Date()
    };
  }
  next();
});

// Méthode pour calculer la distance avec une position
pharmacySchema.methods.calculateDistance = function(lat, lng) {
  const R = 6371; // Rayon de la Terre en km
  const dLat = this.location.coordinates[1] * Math.PI / 180 - lat * Math.PI / 180;
  const dLon = this.location.coordinates[0] * Math.PI / 180 - lng * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat * Math.PI / 180) * Math.cos(this.location.coordinates[1] * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance en km
};

module.exports = mongoose.model('Pharmacy', pharmacySchema);
