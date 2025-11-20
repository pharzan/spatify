import { randomUUID } from 'node:crypto';
import { SpatiLocation, SpatiLocationInput } from '../models/api.js';
import { mapRecordToSpatiLocation, mapSpatiLocationInputToRecord } from '../models/mappers.js';
import { SpatiRepository } from '../repositories/spatiRepository.js';
import { SpatiNotFoundError } from './errors.js';

export class SpatiAdminService {
  constructor(private readonly repository: SpatiRepository) {}

  async createSpati(input: SpatiLocationInput): Promise<SpatiLocation> {
    const record = await this.repository.create(
      {
        id: randomUUID(),
        ...mapSpatiLocationInputToRecord(input),
      },
      input.amenityIds,
    );

    return mapRecordToSpatiLocation(record);
  }

  async updateSpati(id: string, input: SpatiLocationInput): Promise<SpatiLocation> {
    const record = await this.repository.update(
      id,
      mapSpatiLocationInputToRecord(input),
      input.amenityIds,
    );

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
}
