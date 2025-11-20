import { FastifyError, FastifyInstance } from 'fastify';
import { FastifyZodOpenApiTypeProvider } from 'fastify-zod-openapi';
import { AdminAuthResponseSchema, AdminLoginSchema } from '../models/api.js';
import { AdminAuthService } from '../services/adminAuthService.js';
import { AdminInvalidCredentialsError } from '../services/errors.js';
import { registerSchema } from '../utils/schema.js';
import { config } from '../config/environment.js';

const adminAuthTags = ['Admin Auth'];

const invalidCredentialsHandler = (error: unknown): never => {
  if (error instanceof AdminInvalidCredentialsError) {
    const authError = new Error(error.message) as FastifyError;
    authError.statusCode = 401;
    throw authError;
  }

  throw error;
};

export const registerAdminAuthRoutes = (
  fastify: FastifyInstance,
  service: AdminAuthService,
): void => {
  const app = fastify.withTypeProvider<FastifyZodOpenApiTypeProvider>();
  const loginSchemaRef = registerSchema(AdminLoginSchema, 'AdminLogin');
  const authResponseSchemaRef = registerSchema(AdminAuthResponseSchema, 'AdminAuthResponse');

  app.post(
    '/admin/auth/login',
    {
      schema: {
        tags: adminAuthTags,
        summary: 'Admin login',
        body: loginSchemaRef,
        response: {
          200: authResponseSchemaRef,
        },
      },
    },
    async (request) => {
      try {
        const admin = await service.verifyCredentials(request.body);
        const token = fastify.jwt.sign(
          {
            id: admin.id,
            email: admin.email,
          },
          {
            expiresIn: config.auth.tokenExpiresIn,
          },
        );

        return { token };
      } catch (error) {
        return invalidCredentialsHandler(error);
      }
    },
  );
};
