import { z } from 'zod';

export const registerSchema = <T extends z.ZodTypeAny>(schema: T, id: string): T => {
  const existing = z.globalRegistry.get(schema);
  if (existing?.id === id) {
    return schema;
  }
  z.globalRegistry.add(schema, { id });
  return schema;
};
