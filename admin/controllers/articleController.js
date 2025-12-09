const Article = require('../models/Article');
const User = require('../models/User');
const { handleErrors } = require('./errorHandler');

// Validation des articles
const validateArticle = (article) => {
  const schema = {
    title: {
      required: true,
      type: 'string',
      max: 100
    },
    content: {
      required: true,
      type: 'string'
    },
    category: {
      required: true,
      type: 'string',
      allowed: ['actualites', 'sante', 'education', 'economie', 'politique']
    },
    featuredImage: {
      required: true,
      type: 'string'
    },
    status: {
      required: true,
      type: 'string',
      allowed: ['draft', 'published', 'archived']
    }
  };

  const errors = {};
  Object.keys(schema).forEach(field => {
    const fieldSchema = schema[field];
    const value = article[field];

    if (fieldSchema.required && !value) {
      errors[field] = `${field} is required`;
    }

    if (value && fieldSchema.type === 'string' && value.length > (fieldSchema.max || 1000)) {
      errors[field] = `${field} must be less than ${fieldSchema.max} characters`;
    }

    if (value && fieldSchema.allowed && !fieldSchema.allowed.includes(value)) {
      errors[field] = `${value} is not a valid ${field}`;
    }
  });

  return errors;
};

// Contrôleur principal
const articleController = {
  // Créer un nouvel article
  createArticle: async (req, res) => {
    try {
      const errors = validateArticle(req.body);
      if (Object.keys(errors).length > 0) {
        return res.status(400).json({ errors });
      }

      const article = new Article({
        ...req.body,
        author: req.user._id
      });

      await article.save();
      res.status(201).json(article);
    } catch (error) {
      handleErrors(res, error);
    }
  },

  // Obtenir tous les articles
  getArticles: async (req, res) => {
    try {
      const { page = 1, limit = 10, category, search } = req.query;
      const query = {};

      if (category) {
        query.category = category;
      }

      if (search) {
        query.$text = { $search: search };
      }

      const articles = await Article.find(query)
        .sort({ createdAt: -1 })
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
      handleErrors(res, error);
    }
  },

  // Obtenir un article spécifique
  getArticle: async (req, res) => {
    try {
      const article = await Article.findById(req.params.id)
        .populate('author', 'name email')
        .populate('likes', 'name')
        .exec();

      if (!article) {
        return res.status(404).json({ error: 'Article not found' });
      }

      // Increment views
      await Article.findByIdAndUpdate(req.params.id, {
        $inc: { views: 1 }
      });

      res.json(article);
    } catch (error) {
      handleErrors(res, error);
    }
  },

  // Mettre à jour un article
  updateArticle: async (req, res) => {
    try {
      const errors = validateArticle(req.body);
      if (Object.keys(errors).length > 0) {
        return res.status(400).json({ errors });
      }

      const article = await Article.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true }
      );

      if (!article) {
        return res.status(404).json({ error: 'Article not found' });
      }

      res.json(article);
    } catch (error) {
      handleErrors(res, error);
    }
  },

  // Supprimer un article
  deleteArticle: async (req, res) => {
    try {
      const article = await Article.findByIdAndDelete(req.params.id);

      if (!article) {
        return res.status(404).json({ error: 'Article not found' });
      }

      res.json({ message: 'Article removed' });
    } catch (error) {
      handleErrors(res, error);
    }
  },

  // Like un article
  likeArticle: async (req, res) => {
    try {
      const article = await Article.findById(req.params.id);

      if (!article) {
        return res.status(404).json({ error: 'Article not found' });
      }

      if (article.likes.includes(req.user._id)) {
        return res.status(400).json({ error: 'Article already liked' });
      }

      article.likes.push(req.user._id);
      await article.save();

      res.json(article.likes);
    } catch (error) {
      handleErrors(res, error);
    }
  },

  // Unlike un article
  unlikeArticle: async (req, res) => {
    try {
      const article = await Article.findById(req.params.id);

      if (!article) {
        return res.status(404).json({ error: 'Article not found' });
      }

      article.likes = article.likes.filter(
        like => like.toString() !== req.user._id.toString()
      );

      await article.save();
      res.json(article.likes);
    } catch (error) {
      handleErrors(res, error);
    }
  }
};

module.exports = {
  articleController,
  validateArticle
};
