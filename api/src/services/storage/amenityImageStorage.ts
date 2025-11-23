import { randomUUID } from 'node:crypto';
import { pipeline } from 'node:stream/promises';
import { Storage } from '@google-cloud/storage';

export interface AmenityImageUpload {
  stream: NodeJS.ReadableStream;
  filename: string;
  mimetype: string;
}

export interface AmenityImageStorage {
  upload(image: AmenityImageUpload): Promise<string>;
  delete(imageUrl: string): Promise<void>;
}

export class GcsAmenityImageStorage implements AmenityImageStorage {
  private readonly bucket;

  constructor(
    private readonly storage: Storage,
    private readonly bucketName: string,
  ) {
    this.bucket = this.storage.bucket(this.bucketName);
  }

  async upload(image: AmenityImageUpload): Promise<string> {
    const objectName = this.buildObjectName(image.filename);
    const file = this.bucket.file(objectName);
    const writeStream = file.createWriteStream({
      resumable: false,
      metadata: {
        contentType: image.mimetype,
        cacheControl: 'public, max-age=31536000, immutable',
      },
    });

    await pipeline(image.stream, writeStream);

    return file.publicUrl();
  }

  async delete(imageUrl: string): Promise<void> {
    const objectName = this.extractObjectName(imageUrl);
    if (!objectName) {
      return;
    }

    try {
      await this.bucket.file(objectName).delete();
    } catch (error) {
      const maybeError = error as { code?: number };
      if (maybeError?.code === 404) {
        return;
      }
      throw error;
    }
  }

  private buildObjectName(originalFilename: string): string {
    const defaultName = 'amenity-image';
    const cleanedName = originalFilename?.trim() ? originalFilename.trim() : defaultName;
    const safeName = cleanedName.replace(/[^a-zA-Z0-9.]/g, '-').replace(/-+/g, '-');
    const extension =
      safeName.includes('.') && safeName.lastIndexOf('.') > 0
        ? safeName.substring(safeName.lastIndexOf('.'))
        : '';
    return `amenities/${randomUUID()}${extension.toLowerCase()}`;
  }

  private extractObjectName(imageUrl: string): string | null {
    const prefix = `https://storage.googleapis.com/${this.bucketName}/`;
    if (imageUrl.startsWith(prefix)) {
      return decodeURIComponent(imageUrl.slice(prefix.length));
    }

    return null;
  }
}
