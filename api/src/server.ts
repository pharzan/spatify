import Fastify, { FastifyInstance } from 'fastify';
import { config } from './config/environment.js';
import { registerSwagger } from './plugins/swagger.js';
import { InMemorySpatiRepository } from './repositories/spatiRepository.js';
import { SpatiService } from './services/spatiService.js';
import { registerSpatiRoutes } from './routes/spatiRoutes.js';

export const buildServer = async (): Promise<FastifyInstance> => {
  const app = Fastify({
    logger: true,
  });

  await registerSwagger(app);

  const repository = new InMemorySpatiRepository();
  const spatiService = new SpatiService(repository);
  registerSpatiRoutes(app, spatiService);

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
