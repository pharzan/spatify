import { randomUUID } from 'node:crypto';
import { Mood, MoodInput } from '../models/api.js';
import { mapMoodInputToRecord, mapMoodRecordToMood } from '../models/mappers.js';
import { MoodRepository } from '../repositories/moodRepository.js';
import { MoodNotFoundError } from './errors.js';

export class MoodAdminService {
  constructor(private readonly repository: MoodRepository) {}

  async listMoods(): Promise<Mood[]> {
    const moods = await this.repository.findAll();
    return moods.map(mapMoodRecordToMood);
  }

  async createMood(input: MoodInput): Promise<Mood> {
    const record = await this.repository.create({
      id: randomUUID(),
      ...mapMoodInputToRecord(input),
    });

    return mapMoodRecordToMood(record);
  }

  async updateMood(id: string, input: MoodInput): Promise<Mood> {
    const existing = await this.repository.findById(id);

    if (!existing) {
      throw new MoodNotFoundError(id);
    }

    const record = await this.repository.update(id, mapMoodInputToRecord(input));

    if (!record) {
      throw new MoodNotFoundError(id);
    }

    return mapMoodRecordToMood(record);
  }

  async deleteMood(id: string): Promise<void> {
    const deleted = await this.repository.delete(id);

    if (!deleted) {
      throw new MoodNotFoundError(id);
    }
  }
}
