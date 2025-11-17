import { SpatiLocation } from './api.js';
import { SpatiLocationRecord } from './db.js';

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
