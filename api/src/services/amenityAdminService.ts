import { randomUUID } from 'node:crypto';
import { Amenity, AmenityInput } from '../models/api.js';
import { mapAmenityInputToRecord, mapAmenityRecordToAmenity } from '../models/mappers.js';
import { AmenityRepository } from '../repositories/amenityRepository.js';
import { AmenityNotFoundError } from './errors.js';
import { AmenityImageStorage, AmenityImageUpload } from './storage/amenityImageStorage.js';

export class AmenityAdminService {
  constructor(
    private readonly repository: AmenityRepository,
    private readonly imageStorage: AmenityImageStorage,
  ) {}

  async listAmenities(): Promise<Amenity[]> {
    const amenities = await this.repository.findAll();
    return amenities.map(mapAmenityRecordToAmenity);
  }

  async createAmenity(input: AmenityInput, image?: AmenityImageUpload): Promise<Amenity> {
    const inputImageUrl = this.normalizeImageUrl(input.imageUrl);
    const imageUrl = image ? await this.imageStorage.upload(image) : inputImageUrl;
    const record = await this.repository.create({
      id: randomUUID(),
      ...mapAmenityInputToRecord({
        ...input,
        imageUrl,
      }),
    });

    return mapAmenityRecordToAmenity(record);
  }

  async updateAmenity(
    id: string,
    input: AmenityInput,
    options?: { image?: AmenityImageUpload; removeImage?: boolean },
  ): Promise<Amenity> {
    const existing = await this.repository.findById(id);

    if (!existing) {
      throw new AmenityNotFoundError(id);
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
      mapAmenityInputToRecord({
        ...input,
        imageUrl,
      }),
    );

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
