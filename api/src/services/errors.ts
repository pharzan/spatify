export class SpatiNotFoundError extends Error {
  constructor(id: string) {
    super(`Späti with id "${id}" was not found.`);
    this.name = 'SpatiNotFoundError';
  }
}

export class AmenityNotFoundError extends Error {
  constructor(id: string) {
    super(`Amenity with id ${id} not found`);
    this.name = 'AmenityNotFoundError';
  }
}

export class MoodNotFoundError extends Error {
  constructor(id: string) {
    super(`Mood with id ${id} not found`);
    this.name = 'MoodNotFoundError';
  }
}

export class AdminInvalidCredentialsError extends Error {
  constructor() {
    super('Invalid admin credentials.');
    this.name = 'AdminInvalidCredentialsError';
  }
}
