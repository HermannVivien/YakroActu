const redis = require('redis');
const { promisify } = require('util');

// Configuration Redis
const client = redis.createClient({
  url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
});

// Gestion des erreurs Redis
client.on('error', (error) => {
  console.error('Redis Error:', error);
});

// Promisify les méthodes Redis
const getAsync = promisify(client.get).bind(client);
const setexAsync = promisify(client.setex).bind(client);
const delAsync = promisify(client.del).bind(client);

// Middleware de cache
const cacheMiddleware = (duration) => async (req, res, next) => {
  try {
    const key = `${req.method}:${req.originalUrl}`;
    const cachedData = await getAsync(key);

    if (cachedData) {
      const data = JSON.parse(cachedData);
      res.status(data.status || 200).json(data.body);
    } else {
      // Stocker la réponse dans Redis
      const originalSend = res.send;
      res.send = async (body) => {
        const response = {
          status: res.statusCode,
          body: body
        };
        await setexAsync(key, duration, JSON.stringify(response));
        originalSend.call(res, body);
      };
      next();
    }
  } catch (error) {
    console.error('Redis Cache Error:', error);
    next();
  }
};

// Middleware de cache invalide
const invalidateCache = async (req, res, next) => {
  try {
    const key = `${req.method}:${req.originalUrl}`;
    await delAsync(key);
    next();
  } catch (error) {
    console.error('Redis Cache Invalidation Error:', error);
    next();
  }
};

module.exports = {
  cacheMiddleware,
  invalidateCache,
  client
};
