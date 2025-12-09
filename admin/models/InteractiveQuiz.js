const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['multiple_choice', 'true_false', 'open_ended', 'image', 'audio'],
    required: true
  },
  options: [{
    text: String,
    correct: Boolean,
    image: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Media'
    },
    feedback: String
  }],
  points: Number,
  timeLimit: Number,
  media: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Media'
  }
});

const interactiveQuizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['knowledge', 'entertainment', 'health', 'society'],
    required: true
  },
  questions: [questionSchema],
  settings: {
    timeLimit: Number,
    shuffleQuestions: Boolean,
    showResults: Boolean,
    allowRetake: Boolean,
    showCorrectAnswers: Boolean
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  analytics: {
    totalAttempts: Number,
    averageScore: Number,
    completionRate: Number,
    timeSpent: Number,
    mostChallenging: {
      question: mongoose.Schema.Types.ObjectId,
      difficultyIndex: Number
    }
  },
  rewards: {
    points: Number,
    badges: [{
      type: String,
      name: String,
      description: String,
      image: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Media'
      }
    }]
  }
}, {
  timestamps: true
});

// Index pour les requêtes fréquentes
interactiveQuizSchema.index({ category: 1, status: 1, difficulty: 1 });
interactiveQuizSchema.index({ 'analytics.averageScore': -1 });

module.exports = mongoose.model('InteractiveQuiz', interactiveQuizSchema);
