import { FastifyError, FastifyInstance } from 'fastify';
import { FastifyZodOpenApiTypeProvider } from 'fastify-zod-openapi';
import { z } from 'zod';
import { MoodInput, MoodInputSchema, MoodSchema } from '../models/api.js';
import { MoodAdminService } from '../services/moodAdminService.js';
import { MoodNotFoundError } from '../services/errors.js';
import { registerSchema } from '../utils/schema.js';

const moodIdParamSchema = z.object({
  id: z.string().min(1).describe('Mood identifier'),
});

const moodListSchema = z.array(MoodSchema);

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

export const registerAdminMoodRoutes = (
  fastify: FastifyInstance,
  service: MoodAdminService,
): void => {
  const app = fastify.withTypeProvider<FastifyZodOpenApiTypeProvider>();
  const moodSchemaRef = registerSchema(MoodSchema, 'Mood');
  const moodInputSchemaRef = registerSchema(MoodInputSchema, 'MoodInputAdmin');
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
        body: moodInputSchemaRef,
        response: {
          201: moodSchemaRef,
        },
        security: adminSecurityRequirement,
      },
      preHandler: app.authenticate,
    },
    async (request, reply) => {
      const input = parseMoodInputOrFail(request.body);
      const mood = await service.createMood(input);
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
        body: moodInputSchemaRef,
        response: {
          200: moodSchemaRef,
        },
        security: adminSecurityRequirement,
      },
      preHandler: app.authenticate,
    },
    async (request) => {
      const { id } = request.params;
      const input = parseMoodInputOrFail(request.body);

      try {
        return await service.updateMood(id, input);
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
