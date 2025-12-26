import { randomUUID } from 'node:crypto';
import { Mood, MoodInput } from '../models/api.js';
import { mapMoodInputToRecord, mapMoodRecordToMood } from '../models/mappers.js';
import { MoodRepository } from '../repositories/moodRepository.js';
import { MoodNotFoundError } from './errors.js';
import { MoodImageStorage, MoodImageUpload } from './storage/moodImageStorage.js';

export class MoodAdminService {
  constructor(
    private readonly repository: MoodRepository,
    private readonly imageStorage: MoodImageStorage,
  ) { }

  async listMoods(): Promise<Mood[]> {
    const moods = await this.repository.findAll();
    return moods.map(mapMoodRecordToMood);
  }

  async createMood(input: MoodInput, image?: MoodImageUpload): Promise<Mood> {
    const inputImageUrl = this.normalizeImageUrl(input.imageUrl);
    const imageUrl = image ? await this.imageStorage.upload(image) : inputImageUrl;
    const record = await this.repository.create({
      id: randomUUID(),
      ...mapMoodInputToRecord({
        ...input,
        imageUrl,
      }),
    });

    return mapMoodRecordToMood(record);
  }

  async updateMood(
    id: string,
    input: MoodInput,
    options?: { image?: MoodImageUpload; removeImage?: boolean },
  ): Promise<Mood> {
    const existing = await this.repository.findById(id);

    if (!existing) {
      throw new MoodNotFoundError(id);
    }

    const providedImageUrl = input.imageUrl;
    const imageUrlWasProvided = typeof providedImageUrl !== 'undefined';
    const explicitImageRemoval = imageUrlWasProvided && providedImageUrl === null;
    let imageUrl: string | null = imageUrlWasProvided
      ? providedImageUrl
      : (existing.imageUrl ?? null);

    if (explicitImageRemoval && existing.imageUrl) {
      await this.deleteExistingImage(existing.imageUrl);
    }

    if (options?.removeImage && existing.imageUrl) {
      await this.deleteExistingImage(existing.imageUrl);
      imageUrl = null;
    }

    if (options?.image) {
      if (existing.imageUrl && !options.removeImage) {
        await this.deleteExistingImage(existing.imageUrl);
      }
      imageUrl = await this.imageStorage.upload(options.image);
    }

    const record = await this.repository.update(
      id,
      mapMoodInputToRecord({
        ...input,
        imageUrl,
      }),
    );

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

  private async deleteExistingImage(imageUrl: string): Promise<void> {
    try {
      await this.imageStorage.delete(imageUrl);
    } catch (error) {
      // Bubble up the error so API consumers know that the update failed.
      throw error;
    }
  }

  private normalizeImageUrl(imageUrl: unknown): string | null {
    if (typeof imageUrl === 'string' || imageUrl === null) {
      return imageUrl;
    }

    if (typeof imageUrl === 'undefined') {
      return null;
    }

    throw new TypeError('imageUrl must be a string, null, or undefined');
  }
}
