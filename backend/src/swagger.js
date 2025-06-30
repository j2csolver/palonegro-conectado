import swaggerJSDoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'API Palonegro Conectado',
    version: '1.0.0',
    description: 'Documentación de la API para la plataforma comunitaria',
  },
  servers: [
    {
      url: 'http://localhost:4000/api',
      description: 'Servidor local',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [{ bearerAuth: [] }],
};

const options = {
  swaggerDefinition,
  apis: ['./src/routes/*.js'], // Documenta tus rutas aquí con JSDoc
};

export default swaggerJSDoc(options);