import { doublePrecision, pgTable, text } from 'drizzle-orm/pg-core';

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
});

export type SpatiLocationRecord = typeof spatiLocations.$inferSelect;
export type NewSpatiLocationRecord = typeof spatiLocations.$inferInsert;
