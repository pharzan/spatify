import { z } from 'zod';

export const AmenitySchema = z.object({
  id: z.string().describe('Unique identifier of the amenity'),
  name: z.string().describe('Human readable amenity name'),
});

export const AmenityInputSchema = AmenitySchema.omit({ id: true });

const baseSpatiSchema = z.object({
  name: z.string(),
  description: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  address: z.string(),
  hours: z.string(),
  type: z.string(),
  rating: z.number(),
});

export const SpatiLocationSchema = baseSpatiSchema.extend({
  id: z.string().describe('Unique identifier of the Späti'),
  amenities: z.array(AmenitySchema).describe('Amenities available at the Späti'),
});

export type SpatiLocation = z.infer<typeof SpatiLocationSchema>;

export const SpatiLocationInputSchema = baseSpatiSchema.extend({
  amenityIds: z
    .array(z.string().min(1).describe('Amenity identifier'))
    .default([])
    .describe('Amenities assigned to this Späti'),
});

export type SpatiLocationInput = z.infer<typeof SpatiLocationInputSchema>;
export type Amenity = z.infer<typeof AmenitySchema>;
export type AmenityInput = z.infer<typeof AmenityInputSchema>;
