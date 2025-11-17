export const cloneJsonSchema = <T>(schema: T): T => JSON.parse(JSON.stringify(schema));
