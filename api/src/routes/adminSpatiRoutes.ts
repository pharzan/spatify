import { Readable } from 'node:stream';
import { FastifyError, FastifyInstance, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { FastifyZodOpenApiTypeProvider } from 'fastify-zod-openapi';
import {
  SpatiLocationInput,
  SpatiLocationInputSchema,
  SpatiLocationSchema,
} from '../models/api.js';
import { SpatiAdminService } from '../services/spatiAdminService.js';
import { SpatiNotFoundError } from '../services/errors.js';
import { SpatiImageUpload } from '../services/storage/spatiImageStorage.js';
import { registerSchema } from '../utils/schema.js';

const spatiIdParamSchema = z.object({
  id: z.string().min(1).describe('Späti identifier'),
});

const adminSpatiLocationSchema = SpatiLocationSchema.clone();
const adminSpatiLocationInputSchema = SpatiLocationInputSchema.clone();
const adminSpatiIdParamSchema = spatiIdParamSchema.clone();

const allowedImageMimeTypes = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/avif',
  'image/svg+xml',
]);
const truthyValues = new Set(['true', '1', 'yes', 'on']);

const spatiMultipartBodySchema = {
  type: 'object',
  required: ['name', 'description', 'latitude', 'longitude', 'address', 'hours', 'type', 'rating'],
  properties: {
    name: { type: 'string' },
    description: { type: 'string' },
    latitude: { type: 'number' },
    longitude: { type: 'number' },
    address: { type: 'string' },
    hours: { type: 'string' },
    type: { type: 'string' },
    rating: { type: 'number' },
    amenityIds: { type: 'array', items: { type: 'string' } },
    image: {
      type: 'string',
      format: 'binary',
      description:
        'Image file upload (PNG, JPEG, WEBP, AVIF, or SVG). Only used with multipart/form-data.',
    },
    imageUrl: {
      type: ['string', 'null'],
      format: 'uri',
      description: 'Optional direct URL to reuse instead of uploading a file.',
    },
    removeImage: {
      type: 'boolean',
      description: 'Set to true to delete the currently stored image.',
    },
  },
};

const spatiJsonBodySchema = adminSpatiLocationInputSchema;

const spatiRequestBodySchema = {
  content: {
    'multipart/form-data': {
      schema: spatiMultipartBodySchema,
    },
    'application/json': {
      schema: spatiJsonBodySchema,
    },
  },
};

type SpatiRoutePayload = {
  input: SpatiLocationInput;
  image?: SpatiImageUpload;
  removeImage: boolean;
};

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

const badRequest = (message: string): never => {
  const error = new Error(message) as FastifyError;
  error.statusCode = 400;
  throw error;
};

const parseSpatiInputOrFail = (data: unknown): SpatiLocationInput => {
  try {
    return SpatiLocationInputSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const details = error.issues.map((issue) => issue.message).join(', ');
      badRequest(details || 'Invalid spati payload');
    }
    throw error;
  }
};

const parseSpatiPayload = async (request: FastifyRequest): Promise<SpatiRoutePayload> => {
  if (!request.isMultipart()) {
    const input = parseSpatiInputOrFail(request.body);
    return { input, removeImage: false };
  }

  const fields: Record<string, any> = {};
  let imageUpload: SpatiImageUpload | undefined;
  const amenityIds: string[] = [];

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
      if (part.fieldname === 'amenityIds') {
        if (typeof part.value === 'string' && part.value.length > 0) {
          amenityIds.push(part.value);
        }
      } else {
        if (typeof part.value === 'string') {
          const val = part.value.trim();
          // Try to parse numbers
          if (['latitude', 'longitude', 'rating'].includes(part.fieldname)) {
            const num = parseFloat(val);
            if (!isNaN(num)) {
              fields[part.fieldname] = num;
            } else {
              fields[part.fieldname] = val; // Let validation fail
            }
          } else {
            fields[part.fieldname] = val;
          }
        } else if (Buffer.isBuffer(part.value)) {
          fields[part.fieldname] = part.value.toString('utf8').trim();
        }
      }
    }
  }

  // Handle amenityIds if they came as a single string (e.g. JSON array string) or multiple fields
  // For multipart, usually multiple fields with same name or array notation.
  // Fastify multipart handling might need adjustment if array is sent differently.
  // Let's assume simple multiple fields for now or comma separated?
  // Actually, standard multipart array handling can be tricky.
  // Let's stick to the simple loop above collecting them.

  const input = parseSpatiInputOrFail({
    ...fields,
    amenityIds: amenityIds.length > 0 ? amenityIds : fields.amenityIds || [],
    imageUrl: fields.imageUrl ? fields.imageUrl : undefined,
  });

  const removeImage = truthyValues.has((fields.removeImage ?? '').toString().toLowerCase());

  return {
    input,
    image: imageUpload,
    removeImage,
  };
};

export const registerAdminSpatiRoutes = (
  fastify: FastifyInstance,
  service: SpatiAdminService,
): void => {
  const app = fastify.withTypeProvider<FastifyZodOpenApiTypeProvider>();
  const spatiLocationSchemaRef = registerSchema(adminSpatiLocationSchema, 'AdminSpatiLocation');
  // const spatiLocationInputSchemaRef = registerSchema(
  //   adminSpatiLocationInputSchema,
  //   'AdminSpatiLocationInput',
  // );
  const spatiIdParamSchemaRef = registerSchema(adminSpatiIdParamSchema, 'AdminSpatiIdParams');

  app.post(
    '/admin/spatis',
    {
      schema: {
        tags: adminTags,
        summary: 'Create a Späti location',
        body: spatiRequestBodySchema,
        response: {
          201: spatiLocationSchemaRef,
        },
        security: adminSecurityRequirement,
      },
      preHandler: app.authenticate,
    },
    async (request, reply) => {
      const payload = await parseSpatiPayload(request);
      const spati = await service.createSpati(payload.input, payload.image);
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
        body: spatiRequestBodySchema,
        response: {
          200: spatiLocationSchemaRef,
        },
        security: adminSecurityRequirement,
      },
      preHandler: app.authenticate,
    },
    async (request) => {
      const { id } = request.params;
      const payload = await parseSpatiPayload(request);

      try {
        return await service.updateSpati(id, payload.input, {
          image: payload.image,
          removeImage: payload.removeImage,
        });
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
