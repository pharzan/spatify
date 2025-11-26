import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { type FastifyZodOpenApiSchema } from 'fastify-zod-openapi';
import { SpatiLocationSchema, MoodSchema, AmenitySchema } from '../models/api.js';
import { SpatiService } from '../services/spatiService.js';
import { registerSchema } from '../utils/schema.js';

const spatiListSchema = z.array(SpatiLocationSchema);
const amenityListSchema = z.array(AmenitySchema);
const moodListSchema = z.array(MoodSchema);

export const registerSpatiRoutes = (fastify: FastifyInstance, service: SpatiService): void => {
  // Register schemas with public names for the public API spec
  registerSchema(MoodSchema, 'Mood');
  registerSchema(AmenitySchema, 'Amenity');
  registerSchema(SpatiLocationSchema, 'PublicSpatiLocation');
  const spatiListSchemaRef = registerSchema(spatiListSchema, 'PublicSpatiLocationsResponse');
  const amenityListSchemaRef = registerSchema(amenityListSchema, 'PublicAmenitiesResponse');
  const moodListSchemaRef = registerSchema(moodListSchema, 'PublicMoodsResponse');

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

  fastify.get(
    '/amenities',
    {
      schema: {
        tags: ['Amenities'],
        summary: 'List amenities',
        response: {
          200: amenityListSchemaRef,
        },
      },
    },
    async () => service.listAmenities(),
  );

  fastify.get(
    '/moods',
    {
      schema: {
        tags: ['Moods'],
        summary: 'List moods',
        response: {
          200: moodListSchemaRef,
        },
      },
    },
    async () => service.listMoods(),
  );
};
