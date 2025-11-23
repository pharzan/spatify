import { Readable } from 'node:stream';
import { FastifyError, FastifyInstance, FastifyRequest } from 'fastify';
import { FastifyZodOpenApiTypeProvider } from 'fastify-zod-openapi';
import { z } from 'zod';
import { AmenityInput, AmenityInputSchema, AmenitySchema } from '../models/api.js';
import { AmenityAdminService } from '../services/amenityAdminService.js';
import { AmenityNotFoundError } from '../services/errors.js';
import { AmenityImageUpload } from '../services/storage/amenityImageStorage.js';
import { registerSchema } from '../utils/schema.js';

const amenityIdParamSchema = z.object({
  id: z.string().min(1).describe('Amenity identifier'),
});

const amenityListSchema = z.array(AmenitySchema);
const allowedImageMimeTypes = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/avif',
  'image/svg+xml',
]);
const truthyValues = new Set(['true', '1', 'yes', 'on']);
const amenityMultipartBodySchema = {
  type: 'object',
  required: ['name'],
  properties: {
    name: {
      type: 'string',
      description: 'Human readable amenity name',
    },
    image: {
      type: 'string',
      format: 'binary',
      description:
        'Image file upload (PNG, JPEG, WEBP, AVIF, or SVG). Only used with multipart/form-data.',
    },
    imageUrl: {
      type: ['string', 'null'],
      format: 'uri',
      description:
        'Optional direct URL to reuse instead of uploading a file. Send null to remove the existing image without uploading.',
    },
    removeImage: {
      type: 'boolean',
      description: 'Set to true (multipart/form-data only) to delete the currently stored image.',
    },
  },
};
const amenityJsonBodySchema = {
  type: 'object',
  required: ['name'],
  properties: {
    name: {
      type: 'string',
      description: 'Human readable amenity name',
    },
    imageUrl: {
      type: ['string', 'null'],
      format: 'uri',
      description:
        'Optional URL to reuse instead of uploading a file. Set to null to remove the current image.',
    },
  },
};
const amenityRequestBodySchema = {
  required: true,
  content: {
    'multipart/form-data': {
      schema: amenityMultipartBodySchema,
    },
    'application/json': {
      schema: amenityJsonBodySchema,
    },
  },
};

type AmenityRoutePayload = {
  input: AmenityInput;
  image?: AmenityImageUpload;
  removeImage: boolean;
};

const adminTags = ['Amenities Admin'];
const adminSecurityRequirement = [{ AdminBearerAuth: [] as string[] }];

const notFoundHandler = (error: unknown): never => {
  if (error instanceof AmenityNotFoundError) {
    const notFoundError = new Error(error.message) as FastifyError;
    notFoundError.statusCode = 404;
    throw notFoundError;
  }

  throw error;
};

const badRequest = (message: string): never => {
  const error = new Error(message) as FastifyError;
  error.statusCode = 400;
  throw error;
};

const parseAmenityInputOrFail = (data: unknown): AmenityInput => {
  try {
    return AmenityInputSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const details = error.issues.map((issue) => issue.message).join(', ');
      badRequest(details || 'Invalid amenity payload');
    }

    throw error;
  }
};

const parseAmenityPayload = async (request: FastifyRequest): Promise<AmenityRoutePayload> => {
  if (!request.isMultipart()) {
    const input = parseAmenityInputOrFail(request.body);
    return { input, removeImage: false };
  }

  const fields: Record<string, string> = {};
  let imageUpload: AmenityImageUpload | undefined;

  const parts = request.parts();
  for await (const part of parts) {
    if (part.type === 'file') {
      if (part.fieldname !== 'image') {
        part.file.resume();
        continue;
      }

      if (imageUpload) {
        part.file.resume();
        continue;
      }

      if (!allowedImageMimeTypes.has(part.mimetype)) {
        part.file.resume();
        badRequest('Unsupported image format. Use PNG, JPEG, WEBP, AVIF, or SVG files.');
      }

      const buffer = await part.toBuffer();
      imageUpload = {
        filename: part.filename,
        mimetype: part.mimetype,
        stream: Readable.from(buffer),
      };
    } else {
      if (typeof part.value === 'string') {
        fields[part.fieldname] = part.value.trim();
      } else if (Buffer.isBuffer(part.value)) {
        fields[part.fieldname] = part.value.toString('utf8').trim();
      } else {
        fields[part.fieldname] = '';
      }
    }
  }

  const name = fields.name;

  if (!name) {
    badRequest('Amenity name is required');
  }

  const input = parseAmenityInputOrFail({
    name,
    imageUrl: fields.imageUrl ? fields.imageUrl : undefined,
  });

  const removeImage = truthyValues.has((fields.removeImage ?? '').toLowerCase());

  return {
    input,
    image: imageUpload,
    removeImage,
  };
};

export const registerAdminAmenityRoutes = (
  fastify: FastifyInstance,
  service: AmenityAdminService,
): void => {
  const app = fastify.withTypeProvider<FastifyZodOpenApiTypeProvider>();
  const amenitySchemaRef = registerSchema(AmenitySchema, 'AdminAmenity');
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
        security: adminSecurityRequirement,
      },
      preHandler: app.authenticate,
    },
    async () => service.listAmenities(),
  );

  app.post(
    '/admin/amenities',
    {
      schema: {
        tags: adminTags,
        summary: 'Create an amenity',
        body: amenityRequestBodySchema,
        response: {
          201: amenitySchemaRef,
        },
        security: adminSecurityRequirement,
      },
      preHandler: app.authenticate,
    },
    async (request, reply) => {
      const payload = await parseAmenityPayload(request);
      const amenity = await service.createAmenity(payload.input, payload.image);
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
        body: amenityRequestBodySchema,
        response: {
          200: amenitySchemaRef,
        },
        security: adminSecurityRequirement,
      },
      preHandler: app.authenticate,
    },
    async (request) => {
      const { id } = request.params;
      const payload = await parseAmenityPayload(request);

      try {
        return await service.updateAmenity(id, payload.input, {
          image: payload.image,
          removeImage: payload.removeImage,
        });
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
        security: adminSecurityRequirement,
      },
      preHandler: app.authenticate,
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
