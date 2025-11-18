import { FastifyError, FastifyInstance } from 'fastify';
import { z } from 'zod';
import { type FastifyZodOpenApiSchema } from 'fastify-zod-openapi';
import { SpatiLocationInputSchema, SpatiLocationSchema } from '../models/api.js';
import { SpatiAdminService } from '../services/spatiAdminService.js';
import { SpatiNotFoundError } from '../services/errors.js';
import { registerSchema } from '../utils/schema.js';

const spatiIdParamSchema = z.object({
  id: z.string().min(1).describe('Späti identifier'),
});

const adminTags = ['Spatis Admin'];

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
  const spatiLocationSchemaRef = registerSchema(SpatiLocationSchema, 'AdminSpatiLocation');
  const spatiLocationInputSchemaRef = registerSchema(
    SpatiLocationInputSchema,
    'AdminSpatiLocationInput',
  );
  const spatiIdParamSchemaRef = registerSchema(spatiIdParamSchema, 'AdminSpatiIdParams');

  const createSchema = {
    tags: adminTags,
    summary: 'Create a Späti location',
    body: spatiLocationInputSchemaRef,
    response: {
      201: spatiLocationSchemaRef,
    },
  } satisfies FastifyZodOpenApiSchema;

  fastify.post(
    '/admin/spatis',
    {
      schema: createSchema,
    },
    async (request, reply) => {
      const body = SpatiLocationInputSchema.parse(request.body);
      const spati = await service.createSpati(body);
      return reply.code(201).send(spati);
    },
  );

  const updateSchema = {
    tags: adminTags,
    summary: 'Update a Späti location',
    params: spatiIdParamSchemaRef,
    body: spatiLocationInputSchemaRef,
    response: {
      200: spatiLocationSchemaRef,
    },
  } satisfies FastifyZodOpenApiSchema;

  fastify.put(
    '/admin/spatis/:id',
    {
      schema: updateSchema,
    },
    async (request) => {
      const { id } = spatiIdParamSchema.parse(request.params);
      const body = SpatiLocationInputSchema.parse(request.body);

      try {
        return await service.updateSpati(id, body);
      } catch (error) {
        return notFoundHandler(error);
      }
    },
  );

  const deleteSchema = {
    tags: adminTags,
    summary: 'Delete a Späti location',
    params: spatiIdParamSchemaRef,
    response: {
      204: z
        .null()
        .meta({
          description: 'Späti deleted',
        }),
    },
  } satisfies FastifyZodOpenApiSchema;

  fastify.delete(
    '/admin/spatis/:id',
    {
      schema: deleteSchema,
    },
    async (request, reply) => {
      const { id } = spatiIdParamSchema.parse(request.params);

      try {
        await service.deleteSpati(id);
        return reply.status(204).send();
      } catch (error) {
        return notFoundHandler(error);
      }
    },
  );
};
