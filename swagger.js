// swagger.js
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version: '1.0.0',
      description: 'API for managing bookings and seats',
    },
    servers: [
      {
        url: 'http://localhost:4000', 
      },
    ],
  },
  apis: ['./routes.js'], // Path to your route files
};

const swaggerSpec = swaggerJsdoc(options);

const setupSwaggerDocs = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log('Swagger docs available at http://localhost:4000/api-docs');
};

module.exports = setupSwaggerDocs;
