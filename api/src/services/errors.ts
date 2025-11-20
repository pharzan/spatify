export class SpatiNotFoundError extends Error {
  constructor(id: string) {
    super(`Späti with id "${id}" was not found.`);
    this.name = 'SpatiNotFoundError';
  }
}

export class AmenityNotFoundError extends Error {
  constructor(id: string) {
    super(`Amenity with id "${id}" was not found.`);
    this.name = 'AmenityNotFoundError';
  }
}
