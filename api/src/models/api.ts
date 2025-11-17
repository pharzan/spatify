import { z } from 'zod';

export const SpatiLocationSchema = z.object({
  id: z.string().describe('Unique identifier of the Späti'),
  name: z.string(),
  description: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  address: z.string(),
  hours: z.string(),
  type: z.string(),
  rating: z.number(),
});

export type SpatiLocation = z.infer<typeof SpatiLocationSchema>;
