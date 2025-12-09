const mongoose = require('mongoose');

const statsSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
  },
  responseTime: {
    type: Number,
    required: true,
  },
  errorRate: {
    type: Number,
    required: true,
  },
  successRate: {
    type: Number,
    required: true,
  },
  activeUsers: {
    type: Number,
    required: true,
  },
  apiRequests: {
    type: Number,
    required: true,
  },
  memoryUsage: {
    type: Number,
    required: true,
  },
  cpuUsage: {
    type: Number,
    required: true,
  },
  databaseSize: {
    type: Number,
    required: true,
  },
  cacheHits: {
    type: Number,
    default: 0,
  },
  cacheMisses: {
    type: Number,
    default: 0,
  },
});

statsSchema.index({ timestamp: 1 });

module.exports = mongoose.model('Stats', statsSchema);
