import { Readable } from 'node:stream';
import { FastifyError, FastifyInstance, FastifyRequest } from 'fastify';
import { FastifyZodOpenApiTypeProvider } from 'fastify-zod-openapi';
import { z } from 'zod';
import { MoodInput, MoodInputSchema, MoodSchema } from '../models/api.js';
import { MoodAdminService } from '../services/moodAdminService.js';
import { MoodNotFoundError } from '../services/errors.js';
import { MoodImageUpload } from '../services/storage/moodImageStorage.js';
import { registerSchema } from '../utils/schema.js';

const moodIdParamSchema = z.object({
  id: z.string().min(1).describe('Mood identifier'),
});

const moodListSchema = z.array(MoodSchema);
const allowedImageMimeTypes = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/avif',
  'image/svg+xml',
]);
const truthyValues = new Set(['true', '1', 'yes', 'on']);

const moodMultipartBodySchema = {
  type: 'object',
  required: ['name', 'color'],
  properties: {
    name: {
      type: 'string',
      description: 'Name of the mood',
    },
    color: {
      type: 'string',
      description: 'Color code of the mood',
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

const moodJsonBodySchema = {
  type: 'object',
  required: ['name', 'color'],
  properties: {
    name: {
      type: 'string',
      description: 'Name of the mood',
    },
    color: {
      type: 'string',
      description: 'Color code of the mood',
    },
    imageUrl: {
      type: ['string', 'null'],
      format: 'uri',
      description:
        'Optional URL to reuse instead of uploading a file. Set to null to remove the current image.',
    },
  },
};

const moodRequestBodySchema = {
  required: true,
  content: {
    'multipart/form-data': {
      schema: moodMultipartBodySchema,
    },
    'application/json': {
      schema: moodJsonBodySchema,
    },
  },
};

type MoodRoutePayload = {
  input: MoodInput;
  image?: MoodImageUpload;
  removeImage: boolean;
};

const adminTags = ['Moods Admin'];
const adminSecurityRequirement = [{ AdminBearerAuth: [] as string[] }];

const notFoundHandler = (error: unknown): never => {
  if (error instanceof MoodNotFoundError) {
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

const parseMoodInputOrFail = (data: unknown): MoodInput => {
  try {
    return MoodInputSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const details = error.issues.map((issue) => issue.message).join(', ');
      badRequest(details || 'Invalid mood payload');
    }

    throw error;
  }
};

const parseMoodPayload = async (request: FastifyRequest): Promise<MoodRoutePayload> => {
  if (!request.isMultipart()) {
    const input = parseMoodInputOrFail(request.body);
    return { input, removeImage: false };
  }

  const fields: Record<string, string> = {};
  let imageUpload: MoodImageUpload | undefined;

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
  const color = fields.color;

  if (!name) {
    badRequest('Mood name is required');
  }

  if (!color) {
    badRequest('Mood color is required');
  }

  const input = parseMoodInputOrFail({
    name,
    color,
    imageUrl: fields.imageUrl ? fields.imageUrl : undefined,
  });

  const removeImage = truthyValues.has((fields.removeImage ?? '').toLowerCase());

  return {
    input,
    image: imageUpload,
    removeImage,
  };
};

export const registerAdminMoodRoutes = (
  fastify: FastifyInstance,
  service: MoodAdminService,
): void => {
  const app = fastify.withTypeProvider<FastifyZodOpenApiTypeProvider>();
  const moodSchemaRef = registerSchema(MoodSchema, 'Mood');
  const moodIdParamSchemaRef = registerSchema(moodIdParamSchema, 'AdminMoodIdParams');
  const moodListSchemaRef = registerSchema(moodListSchema, 'AdminMoodsResponse');

  app.get(
    '/admin/moods',
    {
      schema: {
        tags: adminTags,
        summary: 'List moods',
        response: {
          200: moodListSchemaRef,
        },
        security: adminSecurityRequirement,
      },
      preHandler: app.authenticate,
    },
    async () => service.listMoods(),
  );

  app.post(
    '/admin/moods',
    {
      schema: {
        tags: adminTags,
        summary: 'Create a mood',
        body: moodRequestBodySchema,
        response: {
          201: moodSchemaRef,
        },
        security: adminSecurityRequirement,
      },
      preHandler: app.authenticate,
    },
    async (request, reply) => {
      const payload = await parseMoodPayload(request);
      const mood = await service.createMood(payload.input, payload.image);
      return reply.code(201).send(mood);
    },
  );

  app.put(
    '/admin/moods/:id',
    {
      schema: {
        tags: adminTags,
        summary: 'Update a mood',
        params: moodIdParamSchemaRef,
        body: moodRequestBodySchema,
        response: {
          200: moodSchemaRef,
        },
        security: adminSecurityRequirement,
      },
      preHandler: app.authenticate,
    },
    async (request) => {
      const { id } = request.params;
      const payload = await parseMoodPayload(request);

      try {
        return await service.updateMood(id, payload.input, {
          image: payload.image,
          removeImage: payload.removeImage,
        });
      } catch (error) {
        return notFoundHandler(error);
      }
    },
  );

  app.delete(
    '/admin/moods/:id',
    {
      schema: {
        tags: adminTags,
        summary: 'Delete a mood',
        params: moodIdParamSchemaRef,
        response: {
          204: z.null().describe('Mood deleted'),
        },
        security: adminSecurityRequirement,
      },
      preHandler: app.authenticate,
    },
    async (request, reply) => {
      const { id } = request.params;

      try {
        await service.deleteMood(id);
        return reply.status(204).send();
      } catch (error) {
        return notFoundHandler(error);
      }
    },
  );
};
