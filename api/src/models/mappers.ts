import { SpatiLocationRecord } from '@/db/schema.js';
import { SpatiLocation, SpatiLocationInput } from './api.js';

export const mapRecordToSpatiLocation = (record: SpatiLocationRecord): SpatiLocation => ({
  id: record.id,
  name: record.store_name,
  description: record.description,
  latitude: record.lat,
  longitude: record.lng,
  address: record.address,
  hours: record.opening_hours,
  type: record.store_type,
  rating: record.rating,
});

export const mapSpatiLocationInputToRecord =(input: SpatiLocationInput)=>{
      return {
      store_name: input.name,
      description: input.description,
      lat: input.latitude,
      lng: input.longitude,
      address: input.address,
      opening_hours: input.hours,
      store_type: input.type,
      rating: input.rating,
    };

}
