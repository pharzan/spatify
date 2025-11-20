import Fastify, { FastifyInstance } from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifyJwt from '@fastify/jwt';
import { config } from './config/environment.js';
import { registerSwagger } from './plugins/swagger.js';
import { db } from './db/client.js';
import { registerAdminSpatiRoutes } from './routes/adminSpatiRoutes.js';
import { registerAdminAmenityRoutes } from './routes/adminAmenityRoutes.js';
import { registerAdminAuthRoutes } from './routes/adminAuthRoutes.js';
import { registerSpatiRoutes } from './routes/spatiRoutes.js';
import { PostgresSpatiRepository } from './repositories/spatiRepository.js';
import { PostgresAmenityRepository } from './repositories/amenityRepository.js';
import { PostgresAdminRepository } from './repositories/adminRepository.js';
import { SpatiAdminService } from './services/spatiAdminService.js';
import { SpatiService } from './services/spatiService.js';
import { AmenityAdminService } from './services/amenityAdminService.js';
import { AdminAuthService } from './services/adminAuthService.js';
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
  await app.register(fastifyJwt, {
    secret: config.auth.jwtSecret,
  });

  app.decorate('authenticate', async (request, _reply) => {
    void _reply;
    try {
      const payload = await request.jwtVerify<{
        id: string;
        email: string;
      }>();

      request.admin = {
        id: payload.id,
        email: payload.email,
      };
    } catch (error) {
      throw error;
    }
  });

  const spatiRepository = new PostgresSpatiRepository(db);
  const amenityRepository = new PostgresAmenityRepository(db);
  const adminRepository = new PostgresAdminRepository(db);

  const spatiService = new SpatiService(spatiRepository);
  const spatiAdminService = new SpatiAdminService(spatiRepository);
  const amenityAdminService = new AmenityAdminService(amenityRepository);
  const adminAuthService = new AdminAuthService(adminRepository);

  registerSpatiRoutes(app, spatiService);
  registerAdminSpatiRoutes(app, spatiAdminService);
  registerAdminAmenityRoutes(app, amenityAdminService);
  registerAdminAuthRoutes(app, adminAuthService);

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
