import {
  doublePrecision,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

export const moods = pgTable('moods', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  color: text('color').notNull(), // Hex code like #6b46ff
  imageUrl: text('image_url'),
});

export const spatiLocations = pgTable('spati_locations', {
  id: text('id').primaryKey(),
  store_name: text('store_name').notNull(),
  description: text('description').notNull(),
  lat: doublePrecision('lat').notNull(),
  lng: doublePrecision('lng').notNull(),
  address: text('address').notNull(),
  opening_hours: text('opening_hours').notNull(),
  store_type: text('store_type').notNull(),
  rating: doublePrecision('rating').notNull(),
  imageUrl: text('image_url'),
  moodId: text('mood_id').references(() => moods.id),
});

export const amenities = pgTable('amenities', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  imageUrl: text('image_url'),
});

export const spatiAmenities = pgTable(
  'spati_amenities',
  {
    spatiId: text('spati_id')
      .notNull()
      .references(() => spatiLocations.id, { onDelete: 'cascade' }),
    amenityId: text('amenity_id')
      .notNull()
      .references(() => amenities.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    pk: primaryKey(table.spatiId, table.amenityId),
  }),
);

export const admins = pgTable(
  'admins',
  {
    id: text('id').primaryKey(),
    email: text('email').notNull(),
    passwordHash: text('password_hash').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    emailIdx: uniqueIndex('admins_email_idx').on(table.email),
  }),
);

export type SpatiLocationRecord = typeof spatiLocations.$inferSelect;
export type NewSpatiLocationRecord = typeof spatiLocations.$inferInsert;
export type AmenityRecord = typeof amenities.$inferSelect;
export type NewAmenityRecord = typeof amenities.$inferInsert;
export type MoodRecord = typeof moods.$inferSelect;
export type NewMoodRecord = typeof moods.$inferInsert;
export type SpatiAmenityRecord = typeof spatiAmenities.$inferSelect;
export type AdminRecord = typeof admins.$inferSelect;
export type NewAdminRecord = typeof admins.$inferInsert;

export const newsletterSubscribers = pgTable('newsletter_subscribers', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export type NewsletterSubscriberRecord = typeof newsletterSubscribers.$inferSelect;
export type NewNewsletterSubscriberRecord = typeof newsletterSubscribers.$inferInsert;
