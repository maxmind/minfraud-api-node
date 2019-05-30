import { ArgumentError } from '../errors';
import Location from './location';

describe('Location()', () => {
  it('throws an error if country is not valid', () => {
    expect(() => {
      const location = new Location({
        country: 'foo',
      });
    }).toThrowError(ArgumentError);
  });

  it('constructs', () => {
    expect(() => {
      const location = new Location({
        country: 'CA',
      });
    }).not.toThrow();
  });
});
