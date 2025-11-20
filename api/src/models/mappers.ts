import { AmenityRecord, SpatiLocationRecord } from '@/db/schema.js';
import { Amenity, AmenityInput, SpatiLocation, SpatiLocationInput } from './api.js';

export type SpatiLocationRecordWithAmenities = SpatiLocationRecord & { amenities: AmenityRecord[] };

export const mapAmenityRecordToAmenity = (record: AmenityRecord): Amenity => ({
  id: record.id,
  name: record.name,
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
  amenities: record.amenities.map(mapAmenityRecordToAmenity),
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
  };
};

export const mapAmenityInputToRecord = (input: AmenityInput) => ({
  name: input.name,
});
