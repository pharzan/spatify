import { randomUUID } from 'node:crypto';
import { hash } from 'bcryptjs';
import { db, pool } from '../src/db/client.js';
import { PostgresAdminRepository } from '../src/repositories/adminRepository.js';

const DEFAULT_EMAIL = 'admin@spatify.local';
const DEFAULT_PASSWORD = 'changeme';

const email = process.env.ADMIN_SEED_EMAIL ?? DEFAULT_EMAIL;
const password = process.env.ADMIN_SEED_PASSWORD ?? DEFAULT_PASSWORD;

const repository = new PostgresAdminRepository(db);

const main = async (): Promise<void> => {
  const normalizedEmail = email.toLowerCase();
  const existing = await repository.findByEmail(normalizedEmail);

  if (existing) {
    console.log(`Admin with email "${normalizedEmail}" already exists (id=${existing.id}).`);
    return;
  }

  const passwordHash = await hash(password, 10);
  const admin = await repository.create({
    id: randomUUID(),
    email: normalizedEmail,
    passwordHash,
  });

  console.log(
    `Admin created: email="${admin.email}". Use password "${password}" to login in local development.`,
  );
};

main()
  .catch((error) => {
    console.error('Failed to seed admin user:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
