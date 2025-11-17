import { randomUUID } from 'node:crypto';
import { SpatiLocation, SpatiLocationInput } from '../models/api.js';
import { mapRecordToSpatiLocation } from '../models/mappers.js';
import { SpatiRepository } from '../repositories/spatiRepository.js';
import { SpatiNotFoundError } from './errors.js';

export class SpatiAdminService {
  constructor(private readonly repository: SpatiRepository) {}

  async createSpati(input: SpatiLocationInput): Promise<SpatiLocation> {
    const record = await this.repository.create({
      id: randomUUID(),
      ...this.mapInputToRecord(input),
    });

    return mapRecordToSpatiLocation(record);
  }

  async updateSpati(id: string, input: SpatiLocationInput): Promise<SpatiLocation> {
    const record = await this.repository.update(id, this.mapInputToRecord(input));

    if (!record) {
      throw new SpatiNotFoundError(id);
    }

    return mapRecordToSpatiLocation(record);
  }

  async deleteSpati(id: string): Promise<void> {
    const deleted = await this.repository.delete(id);

    if (!deleted) {
      throw new SpatiNotFoundError(id);
    }
  }

  private mapInputToRecord(input: SpatiLocationInput) {
    return {
      store_name: input.name,
      description: input.description,
      lat: input.latitude,
      lng: input.longitude,
      address: input.address,
      opening_hours: input.hours,
      store_type: input.type,
      rating: input.rating,
    };
  }
}
