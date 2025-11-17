import { FastifyInstance, RouteShorthandOptions } from 'fastify';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { SpatiLocationSchema } from '../models/api.js';
import { SpatiService } from '../services/spatiService.js';
import { cloneJsonSchema } from '../utils/schema.js';

const spatiListSchema = z.array(SpatiLocationSchema);
const spatiListJsonSchema = zodToJsonSchema(spatiListSchema, {
  target: 'openApi3',
});

export const registerSpatiRoutes = (
  fastify: FastifyInstance,
  service: SpatiService,
): void => {
  const listOptions: RouteShorthandOptions = {
    schema: {
      tags: ['Spatis'],
      summary: 'List Späti locations',
      response: {
        200: cloneJsonSchema(spatiListJsonSchema),
      },
    },
  };

  fastify.get('/spatis', listOptions, async () => service.listSpatis());
};
