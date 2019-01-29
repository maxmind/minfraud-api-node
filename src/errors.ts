/* tslint:disable:max-classes-per-file */
export class ArgumentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}
