const swaggerJSDoc = require('swagger-jsdoc');
const config = require('./index');
const { Schema } = require('mongoose');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: `${config.serviceName} API`,
    version: '1.0.0',
    description: `${config.serviceName} API Documentation`,
    contact: {
      name: 'API Support',
      url: 'https://www.example.com/support',
      email: 'support@example.com',
    },
    license: {
      name: 'Apache 2.0',
      url: 'https://www.apache.org/licenses/LICENSE-2.0.html',
    },
  },
  servers: [
    {
      url: `http://localhost:${config.port}/api`,
      description: 'Local server'
    },
    {
      url: `http://api.example:${config.serviceName}`,
      description: 'Production server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT access token for authentication',
      },
    },
    screens: {
      User: {
        type: 'object',
        properties: {
          userId: {
            type: 'string',
            description: 'The user ID',
          },
          email: {
            type: 'string',
            description: 'The user email',
          },
          firstName: {
            type: 'string',
            description: 'The user first name',
          },
          lastName: {
            type: 'string',
            description: 'The user last name',
          },
          roles: {
            type: 'array',
            description: 'The user roles',
            items: {
              type: 'string',
              description: 'The user role',
            },
          },
          status: {
            type: 'string',
            description: 'The user status',
          },
        },
      },
    }
  },
};

const options = {
  swaggerDefinition,
  apis: ['./src/controllers/*.js', './src/routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;