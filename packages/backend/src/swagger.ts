import swaggerJSDoc from 'swagger-jsdoc';

const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: process.env.APP_NAME!,
        version: '1.0.0',
    },
};

const options = {
    swaggerDefinition,
    apis: ['src/routes/*.ts', 'src/routes/*.js'],
};

export const swaggerSpec = swaggerJSDoc(options);
