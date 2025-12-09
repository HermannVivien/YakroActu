const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const Article = require('../models/Article');
const { validateArticle } = require('../controllers/articleController');

// @route   GET /api/articles
// @desc    Get all articles
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search, sort } = req.query;
    const query = {};

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const articles = await Article.find(query)
      .sort(sort === 'latest' ? { createdAt: -1 } : { views: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('author', 'name email')
      .exec();

    const count = await Article.countDocuments(query);

    res.json({
      articles,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/articles/:id
// @desc    Get article by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const article = await Article.findById(req.params.id)
      .populate('author', 'name email')
      .populate('likes', 'name')
      .exec();

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Increment views
    await Article.findByIdAndUpdate(req.params.id, {
      $inc: { views: 1 }
    });

    res.json(article);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /api/articles
// @desc    Create article
// @access  Private/Admin
router.post('/', [auth, admin], async (req, res) => {
  try {
    const { error } = validateArticle(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const article = new Article({
      ...req.body,
      author: req.user.id
    });

    await article.save();
    res.status(201).json(article);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   PUT /api/articles/:id
// @desc    Update article
// @access  Private/Admin
router.put('/:id', [auth, admin], async (req, res) => {
  try {
    const { error } = validateArticle(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const article = await Article.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    res.json(article);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   DELETE /api/articles/:id
// @desc    Delete article
// @access  Private/Admin
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    res.json({ message: 'Article removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /api/articles/:id/like
// @desc    Like article
// @access  Private
router.post('/:id/like', auth, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Check if user already liked
    if (article.likes.includes(req.user.id)) {
      return res.status(400).json({ message: 'Article already liked' });
    }

    article.likes.push(req.user.id);
    await article.save();

    res.json(article.likes);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /api/articles/:id/unlike
// @desc    Unlike article
// @access  Private
router.post('/:id/unlike', auth, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Remove like if exists
    article.likes = article.likes.filter(
      (like) => like.toString() !== req.user.id.toString()
    );

    await article.save();

    res.json(article.likes);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
