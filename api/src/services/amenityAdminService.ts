import { randomUUID } from 'node:crypto';
import { Amenity, AmenityInput } from '../models/api.js';
import { mapAmenityInputToRecord, mapAmenityRecordToAmenity } from '../models/mappers.js';
import { AmenityRepository } from '../repositories/amenityRepository.js';
import { AmenityNotFoundError } from './errors.js';

export class AmenityAdminService {
  constructor(private readonly repository: AmenityRepository) {}

  async listAmenities(): Promise<Amenity[]> {
    const amenities = await this.repository.findAll();
    return amenities.map(mapAmenityRecordToAmenity);
  }

  async createAmenity(input: AmenityInput): Promise<Amenity> {
    const record = await this.repository.create({
      id: randomUUID(),
      ...mapAmenityInputToRecord(input),
    });

    return mapAmenityRecordToAmenity(record);
  }

  async updateAmenity(id: string, input: AmenityInput): Promise<Amenity> {
    const record = await this.repository.update(id, mapAmenityInputToRecord(input));

    if (!record) {
      throw new AmenityNotFoundError(id);
    }

    return mapAmenityRecordToAmenity(record);
  }

  async deleteAmenity(id: string): Promise<void> {
    const deleted = await this.repository.delete(id);

    if (!deleted) {
      throw new AmenityNotFoundError(id);
    }
  }
}
