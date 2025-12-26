import { NewsletterRepository } from '../repositories/newsletterRepository.js';

export class NewsletterService {
    constructor(private readonly repository: NewsletterRepository) { }

    async subscribe(email: string): Promise<void> {
        const existing = await this.repository.findByEmail(email);
        if (existing) {
            // Idempotent: if already subscribed, just return success (or throw specific error if desired)
            return;
        }

        await this.repository.create({
            id: crypto.randomUUID(),
            email,
        });
    }
}
