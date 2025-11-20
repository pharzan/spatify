import { FastifyError, FastifyInstance } from 'fastify';
import { z } from 'zod';
import { FastifyZodOpenApiTypeProvider } from 'fastify-zod-openapi';
import { SpatiLocationInputSchema, SpatiLocationSchema } from '../models/api.js';
import { SpatiAdminService } from '../services/spatiAdminService.js';
import { SpatiNotFoundError } from '../services/errors.js';
import { registerSchema } from '../utils/schema.js';

const spatiIdParamSchema = z.object({
  id: z.string().min(1).describe('Späti identifier'),
});

const adminSpatiLocationSchema = SpatiLocationSchema.clone();
const adminSpatiLocationInputSchema = SpatiLocationInputSchema.clone();
const adminSpatiIdParamSchema = spatiIdParamSchema.clone();

const adminTags = ['Spatis Admin'];
const adminSecurityRequirement = [{ AdminBearerAuth: [] as string[] }];

const notFoundHandler = (error: unknown): never => {
  if (error instanceof SpatiNotFoundError) {
    const notFoundError = new Error(error.message) as FastifyError;
    notFoundError.statusCode = 404;
    throw notFoundError;
  }

  throw error;
};

export const registerAdminSpatiRoutes = (
  fastify: FastifyInstance,
  service: SpatiAdminService,
): void => {
  const app = fastify.withTypeProvider<FastifyZodOpenApiTypeProvider>();
  const spatiLocationSchemaRef = registerSchema(adminSpatiLocationSchema, 'AdminSpatiLocation');
  const spatiLocationInputSchemaRef = registerSchema(
    adminSpatiLocationInputSchema,
    'AdminSpatiLocationInput',
  );
  const spatiIdParamSchemaRef = registerSchema(adminSpatiIdParamSchema, 'AdminSpatiIdParams');

  app.post(
    '/admin/spatis',
    {
      schema: {
        tags: adminTags,
        summary: 'Create a Späti location',
        body: spatiLocationInputSchemaRef,
        response: {
          201: spatiLocationSchemaRef,
        },
        security: adminSecurityRequirement,
      },
      preHandler: app.authenticate,
    },
    async (request, reply) => {
      const spati = await service.createSpati(request.body);
      return reply.code(201).send(spati);
    },
  );

  app.put(
    '/admin/spatis/:id',
    {
      schema: {
        tags: adminTags,
        summary: 'Update a Späti location',
        params: spatiIdParamSchemaRef,
        body: spatiLocationInputSchemaRef,
        response: {
          200: spatiLocationSchemaRef,
        },
        security: adminSecurityRequirement,
      },
      preHandler: app.authenticate,
    },
    async (request) => {
      const { id } = request.params;
      const body = request.body;

      try {
        return await service.updateSpati(id, body);
      } catch (error) {
        return notFoundHandler(error);
      }
    },
  );

  app.delete(
    '/admin/spatis/:id',
    {
      schema: {
        tags: adminTags,
        summary: 'Delete a Späti location',
        params: spatiIdParamSchemaRef,
        response: {
          204: z.null().describe('Späti deleted'),
        },
        security: adminSecurityRequirement,
      },
      preHandler: app.authenticate,
    },
    async (request, reply) => {
      const { id } = request.params;

      try {
        await service.deleteSpati(id);
        return reply.status(204).send();
      } catch (error) {
        return notFoundHandler(error);
      }
    },
  );
};
