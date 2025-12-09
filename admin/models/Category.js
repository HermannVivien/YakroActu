const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 2
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
  icon: {
    type: String,
    default: ''
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  order: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  articlesCount: {
    type: Number,
    default: 0
  },
  meta: {
    keywords: [String],
    description: String
  },
  settings: {
    showInMenu: {
      type: Boolean,
      default: true
    },
    showInHomepage: {
      type: Boolean,
      default: true
    },
    articlesLimit: {
      type: Number,
      default: 10
    }
  }
}, {
  timestamps: true
});

// Generate slug before saving
categorySchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
  next();
});

// Update articles count when a category is saved
categorySchema.post('save', async function(doc) {
  if (doc.parent) {
    await mongoose.model('Category').findOneAndUpdate(
      { _id: doc.parent },
      { $inc: { articlesCount: 1 } }
    );
  }
});

module.exports = mongoose.model('Category', categorySchema);
