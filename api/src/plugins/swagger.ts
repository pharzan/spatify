import { FastifyInstance } from 'fastify';
import fastifySwagger, { FastifyDynamicSwaggerOptions } from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';

export const registerSwagger = async (app: FastifyInstance): Promise<void> => {
  const swaggerOptions: FastifyDynamicSwaggerOptions = {
    openapi: {
      info: {
        title: 'Spatify API',
        description: 'API to explore Berlin Spätis',
        version: '0.1.0',
      },
      servers: [{ url: '/' }],
      tags: [{ name: 'Spatis', description: 'Operations about Späti locations' }],
    },
  };

  await app.register(fastifySwagger, swaggerOptions);
  await app.register(fastifySwaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
  });
};
