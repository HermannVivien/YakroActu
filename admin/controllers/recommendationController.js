const Article = require('../models/Article');
const User = require('../models/User');
const Analytics = require('../models/Analytics');
const { handleErrors } = require('./errorHandler');

const recommendationController = {
  // Générer des recommandations pour un utilisateur
  generateRecommendations: async (req, res) => {
    try {
      const { userId, limit = 10 } = req.query;
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // 1. Analyser l'historique de l'utilisateur
      const userHistory = await Analytics.find({
        userId,
        type: 'article_view'
      })
      .sort({ createdAt: -1 })
      .limit(50)
      .exec();

      // 2. Extraire les catégories préférées
      const categories = userHistory.reduce((acc, item) => {
        const article = item.data.article;
        if (article.category) {
          acc[article.category] = (acc[article.category] || 0) + 1;
        }
        return acc;
      }, {});

      // 3. Trier les catégories par popularité
      const sortedCategories = Object.entries(categories)
        .sort((a, b) => b[1] - a[1])
        .map(([category]) => category);

      // 4. Rechercher les articles recommandés
      const recommendations = await Article.find({
        category: { $in: sortedCategories },
        status: 'published',
        _id: { $nin: userHistory.map(h => h.data.article._id) }
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();

      // 5. Ajouter des articles populaires
      const popularArticles = await Article.find({
        status: 'published'
      })
      .sort({ views: -1, likes: -1 })
      .limit(5)
      .exec();

      // 6. Combiner les résultats
      const combinedResults = [...recommendations, ...popularArticles]
        .filter(article => article._id.toString() !== userHistory.map(h => h.data.article._id).toString())
        .slice(0, limit);

      res.json(combinedResults);
    } catch (error) {
      handleErrors(res, error);
    }
  },

  // Générer des recommandations basées sur l'emplacement
  generateLocationBasedRecommendations: async (req, res) => {
    try {
      const { lat, lng, radius = 10000, limit = 10 } = req.query;
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

      // Rechercher les pharmacies proches
      const nearbyPharmacies = await Pharmacy.find(query)
        .sort({ rating: -1 })
        .limit(limit)
        .exec();

      // Rechercher les flash info proches
      const nearbyFlashInfo = await FlashInfo.find({
        ...query,
        active: true
      })
      .sort({ priority: -1, createdAt: -1 })
      .limit(limit)
      .exec();

      res.json({
        pharmacies: nearbyPharmacies,
        flashInfo: nearbyFlashInfo
      });
    } catch (error) {
      handleErrors(res, error);
    }
  },

  // Générer des recommandations basées sur les intérêts
  generateInterestBasedRecommendations: async (req, res) => {
    try {
      const { userId, interests, limit = 10 } = req.body;
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Rechercher les articles correspondant aux intérêts
      const articles = await Article.find({
        $or: interests.map(interest => ({
          $text: { $search: interest }
        }))
      })
      .sort({ score: { $meta: 'textScore' } })
      .limit(limit)
      .exec();

      // Rechercher les flash info correspondant aux intérêts
      const flashInfo = await FlashInfo.find({
        $or: interests.map(interest => ({
          $text: { $search: interest }
        })),
        active: true
      })
      .sort({ score: { $meta: 'textScore' } })
      .limit(limit)
      .exec();

      res.json({
        articles,
        flashInfo
      });
    } catch (error) {
      handleErrors(res, error);
    }
  },

  // Générer des recommandations basées sur l'historique des likes
  generateLikeBasedRecommendations: async (req, res) => {
    try {
      const { userId, limit = 10 } = req.query;
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Récupérer les articles likés
      const likedArticles = await Article.find({
        likes: userId
      })
      .select('category tags')
      .exec();

      // Extraire les catégories et tags populaires
      const categories = new Set();
      const tags = new Set();

      likedArticles.forEach(article => {
        if (article.category) categories.add(article.category);
        if (article.tags) article.tags.forEach(tag => tags.add(tag));
      });

      // Rechercher des articles similaires
      const recommendations = await Article.find({
        $or: [
          { category: { $in: Array.from(categories) } },
          { tags: { $in: Array.from(tags) } }
        ],
        status: 'published',
        _id: { $nin: likedArticles.map(a => a._id) }
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();

      res.json(recommendations);
    } catch (error) {
      handleErrors(res, error);
    }
  }
};

module.exports = recommendationController;
