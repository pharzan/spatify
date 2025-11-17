import { SpatiLocation } from '../models/api.js';
import { mapRecordToSpatiLocation } from '../models/mappers.js';
import { SpatiRepository } from '../repositories/spatiRepository.js';

export class SpatiService {
  constructor(private readonly repository: SpatiRepository) {}

  async listSpatis(): Promise<SpatiLocation[]> {
    const records = await this.repository.findAll();
    return records.map(mapRecordToSpatiLocation);
  }
}
