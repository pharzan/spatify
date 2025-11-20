import { eq } from 'drizzle-orm';
import type { DatabaseClient } from '../db/client.js';
import { AdminRecord, NewAdminRecord, admins } from '../db/schema.js';

export interface AdminRepository {
  findByEmail(email: string): Promise<AdminRecord | null>;
  create(data: NewAdminRecord): Promise<AdminRecord>;
}

export class PostgresAdminRepository implements AdminRepository {
  constructor(private readonly db: DatabaseClient) {}

  async findByEmail(email: string): Promise<AdminRecord | null> {
    const [record] = await this.db
      .select()
      .from(admins)
      .where(eq(admins.email, email.toLowerCase()));
    return record ?? null;
  }

  async create(data: NewAdminRecord): Promise<AdminRecord> {
    const payload = {
      ...data,
      email: data.email.toLowerCase(),
    };

    const [record] = await this.db.insert(admins).values(payload).returning();
    return record;
  }
}
