import { z } from 'zod';

export const registerSchema = <T extends z.ZodTypeAny>(schema: T, id: string): T => {
  z.globalRegistry.add(schema, { id });
  return schema;
};
