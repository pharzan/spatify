import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { NewsletterService } from '../services/newsletterService.js';
import { registerSchema } from '../utils/schema.js';
import { FastifyZodOpenApiSchema } from 'fastify-zod-openapi';

const subscribeSchema = z.object({
    email: z.string().email(),
});

export const registerNewsletterRoutes = (fastify: FastifyInstance, service: NewsletterService): void => {
    registerSchema(subscribeSchema, 'NewsletterSubscribeRequest');

    const subscribeRouteSchema = {
        tags: ['Newsletter'],
        summary: 'Subscribe to newsletter',
        body: subscribeSchema,
        response: {
            200: z.object({ success: z.boolean() }),
        },
    } satisfies FastifyZodOpenApiSchema;

    fastify.post(
        '/newsletter/subscribe',
        {
            schema: subscribeRouteSchema,
        },
        async (request, reply) => {
            const { email } = request.body as z.infer<typeof subscribeSchema>;
            await service.subscribe(email);
            return { success: true };
        },
    );
};
