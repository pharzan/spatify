import { AmenityRecord, MoodRecord, SpatiLocationRecord } from '@/db/schema.js';
import {
  Amenity,
  AmenityInput,
  Mood,
  MoodInput,
  SpatiLocation,
  SpatiLocationInput,
} from './api.js';

export type SpatiLocationRecordWithAmenities = SpatiLocationRecord & {
  amenities: AmenityRecord[];
  mood: MoodRecord | null;
};

export const mapAmenityRecordToAmenity = (record: AmenityRecord): Amenity => ({
  id: record.id,
  name: record.name,
  imageUrl: record.imageUrl,
});

export const mapMoodRecordToMood = (record: MoodRecord): Mood => ({
  id: record.id,
  name: record.name,
  color: record.color,
});

export const mapRecordToSpatiLocation = (
  record: SpatiLocationRecordWithAmenities,
): SpatiLocation => ({
  id: record.id,
  name: record.store_name,
  description: record.description,
  latitude: record.lat,
  longitude: record.lng,
  address: record.address,
  hours: record.opening_hours,
  type: record.store_type,
  rating: record.rating,
  imageUrl: record.imageUrl,
  amenities: record.amenities.map(mapAmenityRecordToAmenity),
  mood: record.mood ? mapMoodRecordToMood(record.mood) : null,
});

export const mapSpatiLocationInputToRecord = (input: SpatiLocationInput) => {
  const { amenityIds: _amenityIds, ...spatiInput } = input;
  void _amenityIds;
  return {
    store_name: spatiInput.name,
    description: spatiInput.description,
    lat: spatiInput.latitude,
    lng: spatiInput.longitude,
    address: spatiInput.address,
    opening_hours: spatiInput.hours,
    store_type: spatiInput.type,
    rating: spatiInput.rating,
    imageUrl: spatiInput.imageUrl ?? null,
    moodId: spatiInput.moodId ?? null,
  };
};

export const mapAmenityInputToRecord = (input: AmenityInput) => ({
  name: input.name,
  imageUrl: input.imageUrl ?? null,
});

export const mapMoodInputToRecord = (input: MoodInput) => ({
  name: input.name,
  color: input.color,
});
