import { asc, eq } from 'drizzle-orm';
import type { DatabaseClient } from '../db/client.js';
import { AmenityRecord, NewAmenityRecord, amenities } from '../db/schema.js';

export interface AmenityRepository {
  findAll(): Promise<AmenityRecord[]>;
  create(data: NewAmenityRecord): Promise<AmenityRecord>;
  update(id: string, data: Omit<NewAmenityRecord, 'id'>): Promise<AmenityRecord | null>;
  delete(id: string): Promise<boolean>;
}

export class PostgresAmenityRepository implements AmenityRepository {
  constructor(private readonly db: DatabaseClient) {}

  async findAll(): Promise<AmenityRecord[]> {
    return this.db.select().from(amenities).orderBy(asc(amenities.name));
  }

  async create(data: NewAmenityRecord): Promise<AmenityRecord> {
    const [record] = await this.db.insert(amenities).values(data).returning();
    return record;
  }

  async update(id: string, data: Omit<NewAmenityRecord, 'id'>): Promise<AmenityRecord | null> {
    const [record] = await this.db
      .update(amenities)
      .set(data)
      .where(eq(amenities.id, id))
      .returning();

    return record ?? null;
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await this.db.delete(amenities).where(eq(amenities.id, id)).returning({
      id: amenities.id,
    });

    return deleted.length > 0;
  }
}
