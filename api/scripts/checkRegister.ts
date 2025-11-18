import Fastify from 'fastify';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { SpatiLocationSchema } from '../src/models/api.js';
import { registerSchema } from '../src/utils/schema.js';

const fastify = Fastify();
const spatiListSchema = z.array(SpatiLocationSchema);
const jsonSchema = zodToJsonSchema(spatiListSchema, { target: 'openApi3' });
const ref = registerSchema(fastify, jsonSchema, 'TestSchema');
console.log('ref', ref, typeof ref);
