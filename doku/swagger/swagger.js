const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

// Swagger definition
const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Seat Booking API", // Title of the documentation
    version: "1.0.0", // Version of the API
    description: "API for managing seat bookings", // Short description of the API
  },
  servers: [
    {
      url: "http://localhost:4000", 
      description: "Development server",
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ["./routes.js"], // Path to the API docs
};

const swaggerSpec = swaggerJSDoc(options);

const setupSwagger = (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

module.exports = setupSwagger;
