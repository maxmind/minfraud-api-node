import { ArgumentError } from '../errors';
import Location from './location';

describe('Location()', () => {
  it('throws an error if country is not valid', () => {
    const location = () =>
      new Location({
        country: 'foo',
      });

    expect(location).toThrowError(ArgumentError);
    expect(location).toThrowError('country code');
  });

  it('constructs', () => {
    expect(() => {
      const location = new Location({
        country: 'CA',
      });
    }).not.toThrow();
  });
});
