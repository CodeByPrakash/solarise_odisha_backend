import swaggerJsdoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Solarise Odisha API',
            version: '1.0.0',
            description: 'REST API for Solarise Odisha — Solar Energy Project Management Platform',
        },
        servers: [
            {
                url: 'http://localhost:5000',
                description: 'Local Development Server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter your JWT token obtained from /api/auth/login',
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    // Path to the API docs (files containing JSDoc comments)
    apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);
export default swaggerSpec;
