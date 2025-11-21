import { z } from "zod";

import type { components } from "@/generated/api-types";

type AdminSpatiLocationInput =
  components["schemas"]["AdminSpatiLocationInput"];
type AdminAmenityInput = components["schemas"]["AdminAmenityInput"];
type AdminLoginInput = components["schemas"]["AdminLogin"];

const requiredText = (label: string) =>
  z
    .string({
      required_error: `${label} is required`,
      invalid_type_error: `${label} is required`,
    })
    .trim()
    .min(1, `${label} is required`);

const numericField = (
  label: string,
  options: { min?: number; max?: number } = {},
) => {
  let schema = z.coerce.number({
    invalid_type_error: `${label} must be a number`,
    required_error: `${label} is required`,
  });

  if (options.min !== undefined) {
    schema = schema.min(
      options.min,
      `${label} must be at least ${options.min}`,
    );
  }
  if (options.max !== undefined) {
    schema = schema.max(options.max, `${label} must be at most ${options.max}`);
  }

  return schema;
};

export const adminSpatiLocationSchema = z
  .object({
    name: requiredText("Name"),
    description: requiredText("Description"),
    latitude: numericField("Latitude"),
    longitude: numericField("Longitude"),
    address: requiredText("Address"),
    hours: requiredText("Hours"),
    type: requiredText("Type"),
    rating: numericField("Rating", { min: 0, max: 5 }),
    amenityIds: z.array(requiredText("Amenity")).default([]),
  })
  satisfies z.ZodType<AdminSpatiLocationInput>;

export const adminAmenityInputSchema = z
  .object({
    name: requiredText("Name"),
  })
  satisfies z.ZodType<AdminAmenityInput>;

export const adminLoginSchema = z
  .object({
    email: requiredText("Email").email("Enter a valid email"),
    password: requiredText("Password"),
  })
  satisfies z.ZodType<AdminLoginInput>;

export type AdminSpatiLocationFormValues = z.input<
  typeof adminSpatiLocationSchema
>;
export type AdminSpatiLocationPayload = z.infer<
  typeof adminSpatiLocationSchema
>;

export type AdminAmenityFormValues = z.input<typeof adminAmenityInputSchema>;
export type AdminAmenityPayload = z.infer<typeof adminAmenityInputSchema>;

export type AdminLoginFormValues = z.input<typeof adminLoginSchema>;
