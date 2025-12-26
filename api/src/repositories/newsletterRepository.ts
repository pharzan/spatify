import { eq } from 'drizzle-orm';
import type { DatabaseClient } from '../db/client.js';
import {
    NewNewsletterSubscriberRecord,
    NewsletterSubscriberRecord,
    newsletterSubscribers,
} from '../db/schema.js';

export interface NewsletterRepository {
    create(data: NewNewsletterSubscriberRecord): Promise<NewsletterSubscriberRecord>;
    findByEmail(email: string): Promise<NewsletterSubscriberRecord | null>;
}

export class PostgresNewsletterRepository implements NewsletterRepository {
    constructor(private readonly db: DatabaseClient) { }

    async create(data: NewNewsletterSubscriberRecord): Promise<NewsletterSubscriberRecord> {
        const [record] = await this.db.insert(newsletterSubscribers).values(data).returning();
        return record;
    }

    async findByEmail(email: string): Promise<NewsletterSubscriberRecord | null> {
        const [record] = await this.db
            .select()
            .from(newsletterSubscribers)
            .where(eq(newsletterSubscribers.email, email));
        return record || null;
    }
}
