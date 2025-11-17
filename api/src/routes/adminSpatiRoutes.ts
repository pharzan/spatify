import { FastifyError, FastifyInstance, RouteShorthandOptions } from 'fastify';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { SpatiLocationInputSchema, SpatiLocationSchema } from '../models/api.js';
import { SpatiAdminService } from '../services/spatiAdminService.js';
import { SpatiNotFoundError } from '../services/errors.js';
import { cloneJsonSchema } from '../utils/schema.js';

const spatiLocationJsonSchema = zodToJsonSchema(SpatiLocationSchema, {
  target: 'openApi3',
});

const spatiLocationInputJsonSchema = zodToJsonSchema(SpatiLocationInputSchema, {
  target: 'openApi3',
});

const spatiIdParamSchema = z.object({
  id: z.string().min(1).describe('Späti identifier'),
});

const spatiIdParamJsonSchema = zodToJsonSchema(spatiIdParamSchema, {
  target: 'openApi3',
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
  const createOptions: RouteShorthandOptions = {
    schema: {
      tags: adminTags,
      summary: 'Create a Späti location',
      body: cloneJsonSchema(spatiLocationInputJsonSchema),
      response: {
        201: cloneJsonSchema(spatiLocationJsonSchema),
      },
    },
  };

  fastify.post('/admin/spatis', createOptions, async (request, reply) => {
    const body = SpatiLocationInputSchema.parse(request.body);
    const spati = await service.createSpati(body);
    return reply.code(201).send(spati);
  });

  const updateOptions: RouteShorthandOptions = {
    schema: {
      tags: adminTags,
      summary: 'Update a Späti location',
      params: cloneJsonSchema(spatiIdParamJsonSchema),
      body: cloneJsonSchema(spatiLocationInputJsonSchema),
      response: {
        200: cloneJsonSchema(spatiLocationJsonSchema),
      },
    },
  };

  fastify.put('/admin/spatis/:id', updateOptions, async (request) => {
    const { id } = spatiIdParamSchema.parse(request.params);
    const body = SpatiLocationInputSchema.parse(request.body);

    try {
      return await service.updateSpati(id, body);
    } catch (error) {
      return notFoundHandler(error);
    }
  });

  const deleteOptions: RouteShorthandOptions = {
    schema: {
      tags: adminTags,
      summary: 'Delete a Späti location',
      params: cloneJsonSchema(spatiIdParamJsonSchema),
      response: {
        204: {
          description: 'Späti deleted',
          type: 'null',
        },
      },
    },
  };

  fastify.delete('/admin/spatis/:id', deleteOptions, async (request, reply) => {
    const { id } = spatiIdParamSchema.parse(request.params);

    try {
      await service.deleteSpati(id);
      return reply.status(204).send();
    } catch (error) {
      return notFoundHandler(error);
    }
  });
};
