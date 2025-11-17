export class SpatiNotFoundError extends Error {
  constructor(id: string) {
    super(`Späti with id "${id}" was not found.`);
    this.name = 'SpatiNotFoundError';
  }
}
