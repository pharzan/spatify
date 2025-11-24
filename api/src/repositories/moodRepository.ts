import { asc, eq } from 'drizzle-orm';
import type { DatabaseClient } from '../db/client.js';
import { MoodRecord, NewMoodRecord, moods } from '../db/schema.js';

export interface MoodRepository {
  findById(id: string): Promise<MoodRecord | null>;
  findAll(): Promise<MoodRecord[]>;
  create(data: NewMoodRecord): Promise<MoodRecord>;
  update(id: string, data: Omit<NewMoodRecord, 'id'>): Promise<MoodRecord | null>;
  delete(id: string): Promise<boolean>;
}

export class PostgresMoodRepository implements MoodRepository {
  constructor(private readonly db: DatabaseClient) {}

  async findById(id: string): Promise<MoodRecord | null> {
    const [record] = await this.db.select().from(moods).where(eq(moods.id, id));
    return record ?? null;
  }

  async findAll(): Promise<MoodRecord[]> {
    return this.db.select().from(moods).orderBy(asc(moods.name));
  }

  async create(data: NewMoodRecord): Promise<MoodRecord> {
    const [record] = await this.db.insert(moods).values(data).returning();
    return record;
  }

  async update(id: string, data: Omit<NewMoodRecord, 'id'>): Promise<MoodRecord | null> {
    const [record] = await this.db.update(moods).set(data).where(eq(moods.id, id)).returning();

    return record ?? null;
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await this.db.delete(moods).where(eq(moods.id, id)).returning({
      id: moods.id,
    });

    return deleted.length > 0;
  }
}
