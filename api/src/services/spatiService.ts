import { Amenity, Mood, SpatiLocation } from '../models/api.js';
import {
  mapAmenityRecordToAmenity,
  mapMoodRecordToMood,
  mapRecordToSpatiLocation,
} from '../models/mappers.js';
import { AmenityRepository } from '../repositories/amenityRepository.js';
import { MoodRepository } from '../repositories/moodRepository.js';
import { SpatiRepository } from '../repositories/spatiRepository.js';

export class SpatiService {
  constructor(
    private readonly repository: SpatiRepository,
    private readonly amenityRepository: AmenityRepository,
    private readonly moodRepository: MoodRepository,
  ) { }

  async listSpatis(): Promise<SpatiLocation[]> {
    const records = await this.repository.findAll();
    return records.map(mapRecordToSpatiLocation);
  }

  async listAmenities(): Promise<Amenity[]> {
    const records = await this.amenityRepository.findAll();
    return records.map(mapAmenityRecordToAmenity);
  }

  async listMoods(): Promise<Mood[]> {
    const records = await this.moodRepository.findAll();
    return records.map(mapMoodRecordToMood);
  }
}
