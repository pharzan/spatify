import { randomUUID } from 'node:crypto';
import { SpatiLocation, SpatiLocationInput } from '../models/api.js';
import { mapRecordToSpatiLocation, mapSpatiLocationInputToRecord } from '../models/mappers.js';
import { SpatiRepository } from '../repositories/spatiRepository.js';
import { SpatiNotFoundError } from './errors.js';
import { SpatiImageStorage, SpatiImageUpload } from './storage/spatiImageStorage.js';

export class SpatiAdminService {
  constructor(
    private readonly repository: SpatiRepository,
    private readonly storage: SpatiImageStorage,
  ) {}

  async createSpati(input: SpatiLocationInput, image?: SpatiImageUpload): Promise<SpatiLocation> {
    let imageUrl: string | undefined;

    if (image) {
      imageUrl = await this.storage.upload(image);
    } else if (input.imageUrl) {
      imageUrl = input.imageUrl;
    }

    const record = await this.repository.create(
      {
        id: randomUUID(),
        ...mapSpatiLocationInputToRecord({ ...input, imageUrl }),
      },
      input.amenityIds,
    );

    return mapRecordToSpatiLocation(record);
  }

  async updateSpati(
    id: string,
    input: SpatiLocationInput,
    options?: { image?: SpatiImageUpload; removeImage?: boolean },
  ): Promise<SpatiLocation> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new SpatiNotFoundError(id);
    }

    let imageUrl = existing.imageUrl;

    if (options?.removeImage && existing.imageUrl) {
      await this.storage.delete(existing.imageUrl);
      imageUrl = null;
    }

    if (options?.image) {
      if (imageUrl) {
        await this.storage.delete(imageUrl);
      }
      imageUrl = await this.storage.upload(options.image);
    } else if (input.imageUrl !== undefined) {
      // If imageUrl is explicitly provided in input (e.g. null or new URL), use it
      // Note: input.imageUrl being undefined means "no change" in some contexts, but here we might need to be careful.
      // Based on Amenity logic, if we have a direct URL update:
      if (input.imageUrl !== existing.imageUrl) {
        // If replacing an existing image with a new URL, we might want to delete the old one if it was ours?
        // For now, let's assume input.imageUrl overrides.
        imageUrl = input.imageUrl;
      }
    }

    const record = await this.repository.update(
      id,
      mapSpatiLocationInputToRecord({ ...input, imageUrl }),
      input.amenityIds,
    );

    if (!record) {
      throw new SpatiNotFoundError(id);
    }

    return mapRecordToSpatiLocation(record);
  }

  async deleteSpati(id: string): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new SpatiNotFoundError(id);
    }

    if (existing.imageUrl) {
      await this.storage.delete(existing.imageUrl);
    }

    const deleted = await this.repository.delete(id);

    if (!deleted) {
      throw new SpatiNotFoundError(id);
    }
  }
}
