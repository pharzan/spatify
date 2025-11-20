import { z } from 'zod';

type JsonSchema = Record<string, unknown>;

interface SchemaWithComponents extends JsonSchema {
  components?: {
    schemas?: Record<string, JsonSchema>;
  };
}


const replaceComponentRefs = (target: unknown, refMap: Map<string, string>): void => {
  if (target === null || target === undefined) {
    return;
  }

  if (Array.isArray(target)) {
    target.forEach((value) => replaceComponentRefs(value, refMap));
    return;
  }

  if (typeof target !== 'object') {
    return;
  }

  const schemaObject = target as Record<string, unknown>;
  const refValue = schemaObject.$ref;

  if (typeof refValue === 'string') {
    const replacement = refMap.get(refValue);
    if (replacement) {
      schemaObject.$ref = replacement;
    }
  }

  Object.values(schemaObject).forEach((value) => replaceComponentRefs(value, refMap));
};

export const registerSchema = <T extends z.ZodTypeAny>(schema: T, id: string): T => {
  z.globalRegistry.add(schema, { id });
  return schema;
};
