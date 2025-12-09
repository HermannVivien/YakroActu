const Article = require('../models/Article');
const Pharmacy = require('../models/Pharmacy');
const FlashInfo = require('../models/FlashInfo');
const User = require('../models/User');
const { handleErrors } = require('./errorHandler');

const searchController = {
  // Recherche globale
  globalSearch: async (req, res) => {
    try {
      const { query, type, page = 1, limit = 10 } = req.query;
      const results = [];

      // Recherche dans les articles
      if (!type || type === 'article') {
        const articles = await Article.find({
          $text: { $search: query }
        })
        .sort({ score: { $meta: 'textScore' } })
        .limit(limit)
        .skip((page - 1) * limit)
        .select('title content category createdAt')
        .exec();

        results.push(...articles.map(article => ({
          type: 'article',
          ...article.toObject()
        })));
      }

      // Recherche dans les pharmacies
      if (!type || type === 'pharmacy') {
        const pharmacies = await Pharmacy.find({
          $text: { $search: query }
        })
        .sort({ score: { $meta: 'textScore' } })
        .limit(limit)
        .skip((page - 1) * limit)
        .select('name address services rating')
        .exec();

        results.push(...pharmacies.map(pharmacy => ({
          type: 'pharmacy',
          ...pharmacy.toObject()
        })));
      }

      // Recherche dans les flash info
      if (!type || type === 'flash-info') {
        const flashInfo = await FlashInfo.find({
          $text: { $search: query },
          active: true
        })
        .sort({ score: { $meta: 'textScore' } })
        .limit(limit)
        .skip((page - 1) * limit)
        .select('title content type priority')
        .exec();

        results.push(...flashInfo.map(info => ({
          type: 'flash-info',
          ...info.toObject()
        })));
      }

      // Recherche dans les utilisateurs (pour l'admin)
      if (req.user && req.user.isAdmin && (!type || type === 'user')) {
        const users = await User.find({
          $text: { $search: query }
        })
        .sort({ score: { $meta: 'textScore' } })
        .limit(limit)
        .skip((page - 1) * limit)
        .select('name email role status')
        .exec();

        results.push(...users.map(user => ({
          type: 'user',
          ...user.toObject()
        })));
      }

      res.json({
        results,
        total: results.length,
        page,
        limit
      });
    } catch (error) {
      handleErrors(res, error);
    }
  },

  // Recherche géolocalisée
  searchNearby: async (req, res) => {
    try {
      const { lat, lng, radius = 10000, type } = req.query;
      const query = {
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [parseFloat(lng), parseFloat(lat)]
            },
            $maxDistance: parseInt(radius)
          }
        }
      };

      let results = [];

      if (!type || type === 'pharmacy') {
        const pharmacies = await Pharmacy.find(query)
          .sort({ rating: -1 })
          .select('name address location rating services')
          .exec();

        results.push(...pharmacies.map(pharmacy => ({
          type: 'pharmacy',
          ...pharmacy.toObject()
        })));
      }

      if (!type || type === 'flash-info') {
        const flashInfo = await FlashInfo.find({
          ...query,
          active: true
        })
        .sort({ priority: -1, createdAt: -1 })
        .select('title content type location priority')
        .exec();

        results.push(...flashInfo.map(info => ({
          type: 'flash-info',
          ...info.toObject()
        })));
      }

      res.json(results);
    } catch (error) {
      handleErrors(res, error);
    }
  },

  // Recherche par catégories
  searchByCategory: async (req, res) => {
    try {
      const { category, type, page = 1, limit = 10 } = req.query;
      let results = [];

      if (!type || type === 'article') {
        const articles = await Article.find({ category })
          .sort({ createdAt: -1 })
          .limit(limit)
          .skip((page - 1) * limit)
          .select('title content category createdAt')
          .exec();

        results.push(...articles.map(article => ({
          type: 'article',
          ...article.toObject()
        })));
      }

      if (!type || type === 'pharmacy') {
        const pharmacies = await Pharmacy.find({ category })
          .sort({ rating: -1 })
          .limit(limit)
          .skip((page - 1) * limit)
          .select('name address category rating')
          .exec();

        results.push(...pharmacies.map(pharmacy => ({
          type: 'pharmacy',
          ...pharmacy.toObject()
        })));
      }

      res.json({
        results,
        total: results.length,
        page,
        limit
      });
    } catch (error) {
      handleErrors(res, error);
    }
  },

  // Suggestions de recherche
  searchSuggestions: async (req, res) => {
    try {
      const { query, type } = req.query;
      const suggestions = new Set();

      if (!type || type === 'article') {
        const articles = await Article.find({
          title: { $regex: query, $options: 'i' }
        })
        .limit(5)
        .select('title')
        .exec();

        articles.forEach(article => suggestions.add(article.title));
      }

      if (!type || type === 'pharmacy') {
        const pharmacies = await Pharmacy.find({
          name: { $regex: query, $options: 'i' }
        })
        .limit(5)
        .select('name')
        .exec();

        pharmacies.forEach(pharmacy => suggestions.add(pharmacy.name));
      }

      if (!type || type === 'flash-info') {
        const flashInfo = await FlashInfo.find({
          title: { $regex: query, $options: 'i' }
        })
        .limit(5)
        .select('title')
        .exec();

        flashInfo.forEach(info => suggestions.add(info.title));
      }

      res.json(Array.from(suggestions));
    } catch (error) {
      handleErrors(res, error);
    }
  }
};

module.exports = searchController;
