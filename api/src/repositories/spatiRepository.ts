import { asc, eq, inArray } from 'drizzle-orm';
import type { DatabaseClient } from '../db/client.js';
import {
  AmenityRecord,
  MoodRecord,
  NewSpatiLocationRecord,
  SpatiLocationRecord,
  amenities,
  moods,
  spatiAmenities,
  spatiLocations,
} from '../db/schema.js';

export type SpatiLocationWithAmenitiesRecord = SpatiLocationRecord & {
  amenities: AmenityRecord[];
  mood: MoodRecord | null;
};

export interface SpatiRepository {
  findAll(): Promise<SpatiLocationWithAmenitiesRecord[]>;
  findById(id: string): Promise<SpatiLocationWithAmenitiesRecord | null>;
  create(
    data: NewSpatiLocationRecord,
    amenityIds: string[],
  ): Promise<SpatiLocationWithAmenitiesRecord>;
  update(
    id: string,
    data: Omit<NewSpatiLocationRecord, 'id'>,
    amenityIds: string[],
  ): Promise<SpatiLocationWithAmenitiesRecord | null>;
  delete(id: string): Promise<boolean>;
}

export class PostgresSpatiRepository implements SpatiRepository {
  constructor(private readonly db: DatabaseClient) {}

  async findAll(): Promise<SpatiLocationWithAmenitiesRecord[]> {
    const rows = await this.db
      .select()
      .from(spatiLocations)
      .leftJoin(moods, eq(spatiLocations.moodId, moods.id))
      .orderBy(asc(spatiLocations.store_name));

    const records = rows.map(({ spati_locations, moods }) => ({
      ...spati_locations,
      mood: moods,
    }));

    return this.attachAmenities(records);
  }

  async findById(id: string): Promise<SpatiLocationWithAmenitiesRecord | null> {
    const rows = await this.db
      .select()
      .from(spatiLocations)
      .leftJoin(moods, eq(spatiLocations.moodId, moods.id))
      .where(eq(spatiLocations.id, id));

    const record = rows[0];

    if (!record) {
      return null;
    }

    const flattened = {
      ...record.spati_locations,
      mood: record.moods,
    };

    const [recordWithAmenities] = await this.attachAmenities([flattened]);
    return recordWithAmenities ?? null;
  }

  async create(
    data: NewSpatiLocationRecord,
    amenityIds: string[],
  ): Promise<SpatiLocationWithAmenitiesRecord> {
    const uniqueAmenityIds = this.normalizeAmenityIds(amenityIds);
    const record = await this.db.transaction(async (tx) => {
      const [created] = await tx.insert(spatiLocations).values(data).returning();

      if (uniqueAmenityIds.length > 0) {
        await tx
          .insert(spatiAmenities)
          .values(uniqueAmenityIds.map((amenityId) => ({ spatiId: created.id, amenityId })));
      }

      return created;
    });

    return (await this.findById(record.id))!;
  }

  async update(
    id: string,
    data: Omit<NewSpatiLocationRecord, 'id'>,
    amenityIds: string[],
  ): Promise<SpatiLocationWithAmenitiesRecord | null> {
    const uniqueAmenityIds = this.normalizeAmenityIds(amenityIds);

    const record = await this.db.transaction(async (tx) => {
      const [updated] = await tx
        .update(spatiLocations)
        .set(data)
        .where(eq(spatiLocations.id, id))
        .returning();

      if (!updated) {
        return null;
      }

      await tx.delete(spatiAmenities).where(eq(spatiAmenities.spatiId, id));

      if (uniqueAmenityIds.length > 0) {
        await tx
          .insert(spatiAmenities)
          .values(uniqueAmenityIds.map((amenityId) => ({ spatiId: id, amenityId })));
      }

      return updated;
    });

    if (!record) {
      return null;
    }

    return (await this.findById(id))!;
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await this.db
      .delete(spatiLocations)
      .where(eq(spatiLocations.id, id))
      .returning({ id: spatiLocations.id });

    return deleted.length > 0;
  }

  private normalizeAmenityIds(amenityIds: string[]): string[] {
    return Array.from(new Set(amenityIds));
  }

  private async attachAmenities(
    records: (SpatiLocationRecord & { mood: MoodRecord | null })[],
  ): Promise<SpatiLocationWithAmenitiesRecord[]> {
    if (records.length === 0) {
      return [];
    }

    const amenityMap = await this.loadAmenitiesForSpatiIds(records.map((record) => record.id));
    return records.map((record) => ({
      ...record,
      amenities: amenityMap.get(record.id) ?? [],
    }));
  }

  private async loadAmenitiesForSpatiIds(
    spatiIds: string[],
  ): Promise<Map<string, AmenityRecord[]>> {
    const amenityMap = new Map<string, AmenityRecord[]>();

    if (spatiIds.length === 0) {
      return amenityMap;
    }

    const rows = await this.db
      .select({
        spatiId: spatiAmenities.spatiId,
        amenity: amenities,
      })
      .from(spatiAmenities)
      .innerJoin(amenities, eq(spatiAmenities.amenityId, amenities.id))
      .where(inArray(spatiAmenities.spatiId, spatiIds));

    for (const row of rows) {
      const existing = amenityMap.get(row.spatiId);

      if (existing) {
        existing.push(row.amenity);
      } else {
        amenityMap.set(row.spatiId, [row.amenity]);
      }
    }

    for (const spatiId of spatiIds) {
      if (!amenityMap.has(spatiId)) {
        amenityMap.set(spatiId, []);
      }
    }

    return amenityMap;
  }
}
