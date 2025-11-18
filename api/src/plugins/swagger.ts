import { FastifyInstance } from 'fastify';
import fastifySwagger, { FastifyDynamicSwaggerOptions } from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import {
  fastifyZodOpenApiPlugin,
  fastifyZodOpenApiTransformers,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-zod-openapi';

export const registerSwagger = async (app: FastifyInstance): Promise<void> => {
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

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
    ...fastifyZodOpenApiTransformers,
  };

  await app.register(fastifyZodOpenApiPlugin);
  await app.register(fastifySwagger, swaggerOptions);
  await app.register(fastifySwaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
  });
};
