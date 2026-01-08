import Fastify, { FastifyInstance } from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifyJwt from '@fastify/jwt';
import fastifyMultipart from '@fastify/multipart';
import { config } from './config/environment.js';
import { registerSwagger } from './plugins/swagger.js';
import { db } from './db/client.js';
import { registerAdminSpatiRoutes } from './routes/adminSpatiRoutes.js';
import { registerAdminAmenityRoutes } from './routes/adminAmenityRoutes.js';
import { registerAdminMoodRoutes } from './routes/adminMoodRoutes.js';
import { registerAdminAuthRoutes } from './routes/adminAuthRoutes.js';
import { registerSpatiRoutes } from './routes/spatiRoutes.js';
import { PostgresSpatiRepository } from './repositories/spatiRepository.js';
import { PostgresAmenityRepository } from './repositories/amenityRepository.js';
import { PostgresMoodRepository } from './repositories/moodRepository.js';
import { PostgresAdminRepository } from './repositories/adminRepository.js';
import { SpatiAdminService } from './services/spatiAdminService.js';
import { SpatiService } from './services/spatiService.js';
import { AmenityAdminService } from './services/amenityAdminService.js';
import { MoodAdminService } from './services/moodAdminService.js';
import { AdminAuthService } from './services/adminAuthService.js';
import { FastifyZodOpenApiTypeProvider } from 'fastify-zod-openapi';
import { Storage as GoogleCloudStorage } from '@google-cloud/storage';
import { GcsAmenityImageStorage } from './services/storage/amenityImageStorage.js';
import { GcsSpatiImageStorage } from './services/storage/spatiImageStorage.js';
import { GcsMoodImageStorage } from './services/storage/moodImageStorage.js';
import { PostgresNewsletterRepository } from './repositories/newsletterRepository.js';
import { NewsletterService } from './services/newsletterService.js';
import { registerNewsletterRoutes } from './routes/newsletterRoutes.js';

export const buildServer = async (): Promise<FastifyInstance> => {
  const app = Fastify({
    logger: true,
  }).withTypeProvider<FastifyZodOpenApiTypeProvider>();

  await app.register(fastifyCors, {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });
  await app.register(fastifyJwt, {
    secret: config.auth.jwtSecret,
  });
  await app.register(fastifyMultipart, {
    limits: {
      fileSize: config.uploads.amenityImageMaxBytes,
    },
  });
  await registerSwagger(app);

  app.decorate('authenticate', async (request, _reply) => {
    void _reply;
    const payload = await request.jwtVerify<{
      id: string;
      email: string;
    }>();

    request.admin = {
      id: payload.id,
      email: payload.email,
    };
  });

  const spatiRepository = new PostgresSpatiRepository(db);
  const amenityRepository = new PostgresAmenityRepository(db);
  const moodRepository = new PostgresMoodRepository(db);
  const adminRepository = new PostgresAdminRepository(db);

  const spatiService = new SpatiService(spatiRepository, amenityRepository, moodRepository);
  const storage = new GoogleCloudStorage();
  const spatiImageStorage = new GcsSpatiImageStorage(storage, config.storage.amenityBucket);
  const spatiAdminService = new SpatiAdminService(spatiRepository, spatiImageStorage);
  const amenityImageStorage = new GcsAmenityImageStorage(storage, config.storage.amenityBucket);
  const amenityAdminService = new AmenityAdminService(amenityRepository, amenityImageStorage);

  const moodImageStorage = new GcsMoodImageStorage(storage, config.storage.amenityBucket);
  const moodAdminService = new MoodAdminService(moodRepository, moodImageStorage);

  const adminAuthService = new AdminAuthService(adminRepository);

  registerSpatiRoutes(app, spatiService);
  registerAdminSpatiRoutes(app, spatiAdminService);
  registerAdminAmenityRoutes(app, amenityAdminService);
  registerAdminMoodRoutes(app, moodAdminService);
  registerAdminAuthRoutes(app, adminAuthService);

  const newsletterRepository = new PostgresNewsletterRepository(db);
  const newsletterService = new NewsletterService(newsletterRepository);
  registerNewsletterRoutes(app, newsletterService);

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
