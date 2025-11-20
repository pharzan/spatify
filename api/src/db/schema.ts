import { doublePrecision, pgTable, primaryKey, text } from 'drizzle-orm/pg-core';

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

export const amenities = pgTable('amenities', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
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

export type SpatiLocationRecord = typeof spatiLocations.$inferSelect;
export type NewSpatiLocationRecord = typeof spatiLocations.$inferInsert;
export type AmenityRecord = typeof amenities.$inferSelect;
export type NewAmenityRecord = typeof amenities.$inferInsert;
export type SpatiAmenityRecord = typeof spatiAmenities.$inferSelect;
