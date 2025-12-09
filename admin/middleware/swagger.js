const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('../config/swagger');

const swaggerMiddleware = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
};

module.exports = swaggerMiddleware;
