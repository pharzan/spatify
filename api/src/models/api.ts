import { z } from 'zod';

export const AmenitySchema = z.object({
  id: z.string().describe('Unique identifier of the amenity'),
  name: z.string().describe('Human readable amenity name'),
  imageUrl: z.string().url().nullable().describe('Public URL for the amenity image'),
});

export const AmenityInputSchema = z.object({
  name: AmenitySchema.shape.name,
  imageUrl: AmenitySchema.shape.imageUrl.optional(),
});

export const MoodSchema = z.object({
  id: z.string().describe('Unique identifier of the mood'),
  name: z.string().describe('Name of the mood'),
  color: z.string().describe('Color code of the mood'),
  imageUrl: z.string().url().nullable().describe('Public URL for the mood image'),
});

export const MoodInputSchema = z.object({
  name: MoodSchema.shape.name,
  color: MoodSchema.shape.color,
  imageUrl: MoodSchema.shape.imageUrl.optional(),
});

const baseSpatiSchema = z.object({
  name: z.string(),
  description: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  address: z.string(),
  hours: z.string(),
  type: z.string(),
  rating: z.number(),
  imageUrl: z.string().url().nullable().describe('Public URL for the Späti image'),
});

export const SpatiLocationSchema = baseSpatiSchema.extend({
  id: z.string().describe('Unique identifier of the Späti'),
  amenities: z.array(AmenitySchema).describe('Amenities available at the Späti'),
  mood: MoodSchema.nullable().describe('Mood associated with the Späti'),
});

export type SpatiLocation = z.infer<typeof SpatiLocationSchema>;

export const SpatiLocationInputSchema = baseSpatiSchema.extend({
  amenityIds: z
    .array(z.string().min(1).describe('Amenity identifier'))
    .default([])
    .describe('Amenities assigned to this Späti'),
  imageUrl: baseSpatiSchema.shape.imageUrl.optional(),
  moodId: z.string().optional().describe('Mood identifier assigned to this Späti'),
});

export type SpatiLocationInput = z.infer<typeof SpatiLocationInputSchema>;
export type Amenity = z.infer<typeof AmenitySchema>;
export type AmenityInput = z.infer<typeof AmenityInputSchema>;
export type Mood = z.infer<typeof MoodSchema>;
export type MoodInput = z.infer<typeof MoodInputSchema>;

export const AdminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export type AdminLoginInput = z.infer<typeof AdminLoginSchema>;

export const AdminAuthResponseSchema = z.object({
  token: z.string().describe('Bearer token used for admin-only APIs'),
});

export type AdminAuthResponse = z.infer<typeof AdminAuthResponseSchema>;
