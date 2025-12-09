const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  article: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['approved', 'pending', 'rejected'],
    default: 'pending'
  },
  replyCount: {
    type: Number,
    default: 0
  },
  metadata: {
    ip: String,
    device: String,
    browser: String
  }
}, {
  timestamps: true
});

// Update reply count when a comment is saved
commentSchema.post('save', async function(doc) {
  if (doc.parent) {
    await mongoose.model('Comment').findOneAndUpdate(
      { _id: doc.parent },
      { $inc: { replyCount: 1 } }
    );
  }
});

module.exports = mongoose.model('Comment', commentSchema);
