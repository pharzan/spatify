import { compare } from 'bcryptjs';
import { AdminLoginInput } from '../models/api.js';
import { AdminRepository } from '../repositories/adminRepository.js';
import { AdminInvalidCredentialsError } from './errors.js';

export interface AdminIdentity {
  id: string;
  email: string;
}

export class AdminAuthService {
  constructor(private readonly repository: AdminRepository) {}

  async verifyCredentials(input: AdminLoginInput): Promise<AdminIdentity> {
    const admin = await this.repository.findByEmail(input.email);

    if (!admin) {
      throw new AdminInvalidCredentialsError();
    }

    const matches = await compare(input.password, admin.passwordHash);

    if (!matches) {
      throw new AdminInvalidCredentialsError();
    }

    return {
      id: admin.id,
      email: admin.email,
    };
  }
}
