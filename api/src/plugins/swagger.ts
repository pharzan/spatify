import { FastifyInstance } from 'fastify';
import fastifySwagger, { FastifyDynamicSwaggerOptions } from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import type { OpenAPIV3 } from 'openapi-types';
import {
  fastifyZodOpenApiPlugin,
  fastifyZodOpenApiTransformers,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-zod-openapi';

const ADMIN_REGEX = /admin/i;

const OPERATION_HTTP_METHODS = [
  'get',
  'put',
  'post',
  'delete',
  'options',
  'head',
  'patch',
  'trace',
] as const;

const filterAdminSpec = (document: OpenAPIV3.Document): OpenAPIV3.Document => {
  const filteredDoc = JSON.parse(JSON.stringify(document)) as OpenAPIV3.Document;

  if (filteredDoc.paths) {
    Object.keys(filteredDoc.paths).forEach((pathKey) => {
      if (pathKey.includes('/admin')) {
        delete filteredDoc.paths?.[pathKey];
        return;
      }

      const pathItem = filteredDoc.paths?.[pathKey];
      if (!pathItem) {
        return;
      }

      OPERATION_HTTP_METHODS.forEach((method) => {
        const operation = pathItem[method as keyof OpenAPIV3.PathItemObject] as
          | OpenAPIV3.OperationObject
          | undefined;
        if (operation?.tags) {
          const nonAdminTags = operation.tags.filter((tag) => !ADMIN_REGEX.test(tag));
          if (nonAdminTags.length === 0) {
            delete operation.tags;
          } else {
            operation.tags = nonAdminTags;
          }
        }
      });
    });
  }

  if (Array.isArray(filteredDoc.tags)) {
    filteredDoc.tags = filteredDoc.tags.filter((tag) => !tag?.name || !ADMIN_REGEX.test(tag.name));
  }

  const pruneComponentGroup = (components?: Record<string, unknown>): void => {
    if (!components) {
      return;
    }
    Object.keys(components).forEach((key) => {
      if (ADMIN_REGEX.test(key)) {
        delete components[key];
      }
    });
  };

  pruneComponentGroup(filteredDoc.components?.schemas);
  pruneComponentGroup(filteredDoc.components?.requestBodies);
  pruneComponentGroup(filteredDoc.components?.parameters);
  pruneComponentGroup(filteredDoc.components?.responses);

  return filteredDoc;
};

export const registerSwagger = async (app: FastifyInstance): Promise<void> => {
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  const swaggerOptions: FastifyDynamicSwaggerOptions = {
    openapi: {
      info: {
        title: 'Spatify API',
        description: 'API to explore Berlin Spätis',
        version: '0.1.0',
      },
      servers: [{ url: '/' }],
      tags: [{ name: 'Spatis', description: 'Operations about Späti locations' }],
    },
    ...fastifyZodOpenApiTransformers,
  };

  await app.register(fastifyZodOpenApiPlugin);
  await app.register(fastifySwagger, swaggerOptions);

  app.get(
    '/docs/json-app',
    {
      schema: {
        hide: true,
      },
    },
    async (_request, reply) => {
      const document = app.swagger() as OpenAPIV3.Document;
      return reply.send(filterAdminSpec(document));
    },
  );

  await app.register(fastifySwaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
  });
};
