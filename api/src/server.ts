import Fastify, { FastifyInstance } from 'fastify';
import fastifyCors from '@fastify/cors';
import { config } from './config/environment.js';
import { registerSwagger } from './plugins/swagger.js';
import { db } from './db/client.js';
import { registerAdminSpatiRoutes } from './routes/adminSpatiRoutes.js';
import { registerSpatiRoutes } from './routes/spatiRoutes.js';
import { PostgresSpatiRepository } from './repositories/spatiRepository.js';
import { SpatiAdminService } from './services/spatiAdminService.js';
import { SpatiService } from './services/spatiService.js';
import { FastifyZodOpenApiTypeProvider } from 'fastify-zod-openapi';
export const buildServer = async (): Promise<FastifyInstance> => {
  const app = Fastify({
    logger: true,
  }).withTypeProvider<FastifyZodOpenApiTypeProvider>();

  await app.register(fastifyCors, {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });
  await registerSwagger(app);

  const repository = new PostgresSpatiRepository(db);
  const spatiService = new SpatiService(repository);
  const spatiAdminService = new SpatiAdminService(repository);
  registerSpatiRoutes(app, spatiService);
  registerAdminSpatiRoutes(app, spatiAdminService);

  return app;
};

const start = async (): Promise<void> => {
  const app = await buildServer();

  try {
    await app.listen({ port: config.port, host: config.host });
    app.log.info(`Spatify API listening on port ${config.port}`);
    app.log.info('OpenAPI schema available at /docs');
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

void start();
