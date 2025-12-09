const Analytics = require('../models/Analytics');
const UsageAnalytics = require('../models/UsageAnalytics');
const Article = require('../models/Article');
const Pharmacy = require('../models/Pharmacy');
const FlashInfo = require('../models/FlashInfo');
const User = require('../models/User');
const { handleErrors } = require('./errorHandler');

const analyticsController = {
  // Statistiques générales
  getDashboardStats: async (req, res) => {
    try {
      const [totalUsers, totalArticles, totalPharmacies, totalFlashInfo] = await Promise.all([
        User.countDocuments(),
        Article.countDocuments(),
        Pharmacy.countDocuments(),
        FlashInfo.countDocuments()
      ]);

      const activeUsers = await User.countDocuments({ status: 'active' });
      const publishedArticles = await Article.countDocuments({ status: 'published' });
      const activePharmacies = await Pharmacy.countDocuments({ status: 'active' });
      const activeFlashInfo = await FlashInfo.countDocuments({ active: true });

      res.json({
        totalUsers,
        totalArticles,
        totalPharmacies,
        totalFlashInfo,
        activeUsers,
        publishedArticles,
        activePharmacies,
        activeFlashInfo
      });
    } catch (error) {
      handleErrors(res, error);
    }
  },

  // Statistiques d'utilisation
  getUsageStats: async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const query = {};

      if (startDate && endDate) {
        query.date = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }

      const usageStats = await UsageAnalytics.aggregate([
        { $match: query },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
              feature: '$feature'
            },
            count: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: '$_id.date',
            features: {
              $push: {
                feature: '$_id.feature',
                count: '$count'
              }
            }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      res.json(usageStats);
    } catch (error) {
      handleErrors(res, error);
    }
  },

  // Statistiques des articles
  getArticleStats: async (req, res) => {
    try {
      const stats = await Article.aggregate([
        {
          $group: {
            _id: null,
            totalArticles: { $sum: 1 },
            totalViews: { $sum: '$views' },
            totalLikes: { $sum: { $size: '$likes' } }
          }
        }
      ]);

      const categories = await Article.aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]);

      res.json({
        stats: stats[0] || {},
        categories
      });
    } catch (error) {
      handleErrors(res, error);
    }
  },

  // Statistiques des pharmacies
  getPharmacyStats: async (req, res) => {
    try {
      const stats = await Pharmacy.aggregate([
        {
          $group: {
            _id: null,
            totalPharmacies: { $sum: 1 },
            totalReviews: { $sum: { $size: '$reviews' } },
            averageRating: {
              $avg: {
                $cond: {
                  if: { $isArray: '$reviews' },
                  then: {
                    $divide: [
                      { $sum: '$reviews.rating' },
                      { $size: '$reviews' }
                    ]
                  },
                  else: 0
                }
              }
            }
          }
        }
      ]);

      const status = await Pharmacy.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]);

      res.json({
        stats: stats[0] || {},
        status
      });
    } catch (error) {
      handleErrors(res, error);
    }
  },

  // Statistiques des flash info
  getFlashInfoStats: async (req, res) => {
    try {
      const stats = await FlashInfo.aggregate([
        {
          $group: {
            _id: null,
            totalFlashInfo: { $sum: 1 },
            active: { $sum: { $cond: [{ $eq: ['$active', true] }, 1, 0] } }
          }
        }
      ]);

      const types = await FlashInfo.aggregate([
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]);

      res.json({
        stats: stats[0] || {},
        types
      });
    } catch (error) {
      handleErrors(res, error);
    }
  }
};

module.exports = analyticsController;
