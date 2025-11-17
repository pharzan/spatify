import { SpatiLocationRecord, staticSpatiRecords } from '../models/db.js';

export interface SpatiRepository {
  findAll(): Promise<SpatiLocationRecord[]>;
}

export class InMemorySpatiRepository implements SpatiRepository {
  async findAll(): Promise<SpatiLocationRecord[]> {
    return staticSpatiRecords;
  }
}
