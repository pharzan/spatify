import { FastifyError, FastifyInstance } from 'fastify';
import { FastifyZodOpenApiTypeProvider } from 'fastify-zod-openapi';
import { z } from 'zod';
import { AmenityInputSchema, AmenitySchema } from '../models/api.js';
import { AmenityAdminService } from '../services/amenityAdminService.js';
import { AmenityNotFoundError } from '../services/errors.js';
import { registerSchema } from '../utils/schema.js';

const amenityIdParamSchema = z.object({
  id: z.string().min(1).describe('Amenity identifier'),
});

const amenityListSchema = z.array(AmenitySchema);

const adminTags = ['Amenities Admin'];

const notFoundHandler = (error: unknown): never => {
  if (error instanceof AmenityNotFoundError) {
    const notFoundError = new Error(error.message) as FastifyError;
    notFoundError.statusCode = 404;
    throw notFoundError;
  }

  throw error;
};

export const registerAdminAmenityRoutes = (
  fastify: FastifyInstance,
  service: AmenityAdminService,
): void => {
  const app = fastify.withTypeProvider<FastifyZodOpenApiTypeProvider>();
  const amenitySchemaRef = registerSchema(AmenitySchema, 'AdminAmenity');
  const amenityInputSchemaRef = registerSchema(AmenityInputSchema, 'AdminAmenityInput');
  const amenityIdParamSchemaRef = registerSchema(amenityIdParamSchema, 'AdminAmenityIdParams');
  const amenityListSchemaRef = registerSchema(amenityListSchema, 'AdminAmenitiesResponse');

  app.get(
    '/admin/amenities',
    {
      schema: {
        tags: adminTags,
        summary: 'List amenities',
        response: {
          200: amenityListSchemaRef,
        },
      },
    },
    async () => service.listAmenities(),
  );

  app.post(
    '/admin/amenities',
    {
      schema: {
        tags: adminTags,
        summary: 'Create an amenity',
        body: amenityInputSchemaRef,
        response: {
          201: amenitySchemaRef,
        },
      },
    },
    async (request, reply) => {
      const amenity = await service.createAmenity(request.body);
      return reply.code(201).send(amenity);
    },
  );

  app.put(
    '/admin/amenities/:id',
    {
      schema: {
        tags: adminTags,
        summary: 'Update an amenity',
        params: amenityIdParamSchemaRef,
        body: amenityInputSchemaRef,
        response: {
          200: amenitySchemaRef,
        },
      },
    },
    async (request) => {
      const { id } = request.params;
      const body = request.body;

      try {
        return await service.updateAmenity(id, body);
      } catch (error) {
        return notFoundHandler(error);
      }
    },
  );

  app.delete(
    '/admin/amenities/:id',
    {
      schema: {
        tags: adminTags,
        summary: 'Delete an amenity',
        params: amenityIdParamSchemaRef,
        response: {
          204: z.null().describe('Amenity deleted'),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;

      try {
        await service.deleteAmenity(id);
        return reply.status(204).send();
      } catch (error) {
        return notFoundHandler(error);
      }
    },
  );
};
