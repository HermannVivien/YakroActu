const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  content: {
    type: String,
    required: true
  },
  template: {
    type: String,
    enum: ['default', 'about', 'contact', 'terms', 'privacy'],
    default: 'default'
  },
  meta: {
    title: String,
    description: String,
    keywords: [String],
    robots: {
      type: String,
      enum: ['index', 'noindex', 'follow', 'nofollow']
    }
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Page'
  },
  order: {
    type: Number,
    default: 0
  },
  settings: {
    showInMenu: {
      type: Boolean,
      default: true
    },
    menuOrder: {
      type: Number,
      default: 0
    },
    menuTitle: String
  }
}, {
  timestamps: true
});

// Generate slug before saving
pageSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = this.title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
  next();
});

// Index pour les requêtes fréquentes
pageSchema.index({ slug: 1, status: 1 });

module.exports = mongoose.model('Page', pageSchema);
