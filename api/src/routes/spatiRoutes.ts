import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { type FastifyZodOpenApiSchema } from 'fastify-zod-openapi';
import { SpatiLocationSchema, MoodSchema, AmenitySchema } from '../models/api.js';
import { SpatiService } from '../services/spatiService.js';
import { registerSchema } from '../utils/schema.js';

const spatiListSchema = z.array(SpatiLocationSchema);

export const registerSpatiRoutes = (fastify: FastifyInstance, service: SpatiService): void => {
  // Register schemas with public names for the public API spec
  registerSchema(MoodSchema, 'Mood');
  registerSchema(AmenitySchema, 'Amenity');
  registerSchema(SpatiLocationSchema, 'PublicSpatiLocation');
  const spatiListSchemaRef = registerSchema(spatiListSchema, 'PublicSpatiLocationsResponse');

  const listSchema = {
    tags: ['Spatis'],
    summary: 'List Späti locations',
    response: {
      200: spatiListSchemaRef,
    },
  } satisfies FastifyZodOpenApiSchema;

  fastify.get(
    '/spatis',
    {
      schema: listSchema,
    },
    async () => service.listSpatis(),
  );
};
