const mongoose = require('mongoose');

const communitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['news', 'health', 'education', 'society', 'entertainment'],
    required: true
  },
  type: {
    type: String,
    enum: ['public', 'private', 'closed'],
    default: 'public'
  },
  avatar: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Media'
  },
  banner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Media'
  },
  settings: {
    joinRequest: Boolean,
    postApproval: Boolean,
    commentApproval: Boolean,
    mediaRestrictions: {
      maxImages: Number,
      maxVideoLength: Number
    }
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['admin', 'moderator', 'member'],
      default: 'member'
    },
    joinedAt: Date,
    status: {
      type: String,
      enum: ['active', 'pending', 'banned'],
      default: 'pending'
    }
  }],
  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  }],
  analytics: {
    memberCount: Number,
    postCount: Number,
    engagementRate: Number,
    activeMembers: Number,
    lastActive: Date
  },
  rules: [{
    text: String,
    order: Number
  }],
  tags: [{
    type: String,
    trim: true
  }],
  location: {
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
}, {
  timestamps: true
});

// Index pour les requêtes fréquentes
communitySchema.index({ slug: 1, type: 1 });
communitySchema.index({ category: 1, status: 1 });
communitySchema.index({ 'analytics.memberCount': -1 });
communitySchema.index({ location: '2dsphere' });

// Hook pour générer le slug
communitySchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
  next();
});

module.exports = mongoose.model('Community', communitySchema);
