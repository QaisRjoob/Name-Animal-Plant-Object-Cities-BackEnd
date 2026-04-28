const swaggerJsdoc = require('swagger-jsdoc');

const PORT = process.env.PORT || 3000;

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Name-Animal-Plant-Object-Cities API',
      version: '1.0.0',
      description: 'Backend API documentation for the multiplayer game server.',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Local server',
      },
    ],
    tags: [
      { name: 'System', description: 'Server status endpoints' },
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Rooms', description: 'Room listing endpoints' },
      { name: 'Leaderboard', description: 'Leaderboard endpoints' },
      { name: 'Validation', description: 'Word validation endpoint' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        RegisterRequest: {
          type: 'object',
          required: ['username', 'email', 'password'],
          properties: {
            username: { type: 'string', minLength: 3, maxLength: 20, example: 'player01' },
            email: { type: 'string', format: 'email', example: 'player@example.com' },
            password: { type: 'string', minLength: 6, example: 'secret123' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'player@example.com' },
            password: { type: 'string', example: 'secret123' },
          },
        },
        ValidateWordRequest: {
          type: 'object',
          required: ['word', 'letter'],
          properties: {
            word: { type: 'string', example: 'Apple' },
            letter: { type: 'string', minLength: 1, maxLength: 1, example: 'A' },
          },
        },
      },
    },
    paths: {
      '/': {
        get: {
          tags: ['System'],
          summary: 'Get backend status message',
          responses: {
            200: {
              description: 'Backend status',
            },
          },
        },
      },
      '/health': {
        get: {
          tags: ['System'],
          summary: 'Health check',
          responses: {
            200: {
              description: 'Health status',
            },
          },
        },
      },
      '/api': {
        get: {
          tags: ['System'],
          summary: 'API root status',
          responses: {
            200: {
              description: 'API status',
            },
          },
        },
      },
      '/api/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Register a user',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RegisterRequest' },
              },
            },
          },
          responses: {
            201: { description: 'User registered' },
            400: { description: 'Validation error' },
            409: { description: 'Email or username already taken' },
          },
        },
      },
      '/api/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Login a user',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LoginRequest' },
              },
            },
          },
          responses: {
            200: { description: 'Login successful' },
            400: { description: 'Validation error' },
            401: { description: 'Invalid credentials' },
          },
        },
      },
      '/api/rooms': {
        get: {
          tags: ['Rooms'],
          summary: 'List waiting rooms',
          responses: {
            200: { description: 'Rooms list' },
          },
        },
      },
      '/api/leaderboard': {
        get: {
          tags: ['Leaderboard'],
          summary: 'Get global leaderboard',
          responses: {
            200: { description: 'Leaderboard data' },
          },
        },
      },
      '/api/validate-word': {
        post: {
          tags: ['Validation'],
          summary: 'Validate if word starts with selected letter',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ValidateWordRequest' },
              },
            },
          },
          responses: {
            200: { description: 'Validation result' },
            400: { description: 'Missing word or letter' },
          },
        },
      },
    },
  },
  apis: [],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = {
  swaggerSpec,
};
