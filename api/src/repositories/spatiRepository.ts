import { asc, eq } from 'drizzle-orm';
import type { DatabaseClient } from '../db/client.js';
import { NewSpatiLocationRecord, SpatiLocationRecord, spatiLocations } from '../db/schema.js';

export interface SpatiRepository {
  findAll(): Promise<SpatiLocationRecord[]>;
  findById(id: string): Promise<SpatiLocationRecord | null>;
  create(data: NewSpatiLocationRecord): Promise<SpatiLocationRecord>;
  update(
    id: string,
    data: Omit<NewSpatiLocationRecord, 'id'>,
  ): Promise<SpatiLocationRecord | null>;
  delete(id: string): Promise<boolean>;
}

export class PostgresSpatiRepository implements SpatiRepository {
  constructor(private readonly db: DatabaseClient) {}

  async findAll(): Promise<SpatiLocationRecord[]> {
    return this.db.select().from(spatiLocations).orderBy(asc(spatiLocations.store_name));
  }

  async findById(id: string): Promise<SpatiLocationRecord | null> {
    const [record] = await this.db
      .select()
      .from(spatiLocations)
      .where(eq(spatiLocations.id, id));

    return record ?? null;
  }

  async create(data: NewSpatiLocationRecord): Promise<SpatiLocationRecord> {
    const [record] = await this.db.insert(spatiLocations).values(data).returning();
    return record;
  }

  async update(
    id: string,
    data: Omit<NewSpatiLocationRecord, 'id'>,
  ): Promise<SpatiLocationRecord | null> {
    const [record] = await this.db
      .update(spatiLocations)
      .set(data)
      .where(eq(spatiLocations.id, id))
      .returning();

    return record ?? null;
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await this.db
      .delete(spatiLocations)
      .where(eq(spatiLocations.id, id))
      .returning({ id: spatiLocations.id });

    return deleted.length > 0;
  }
}
