import { ArgumentError } from '../errors';
import Location from './location';

describe('Location()', () => {
  it('throws an error if country is not valid', () => {
    const location = () =>
      new Location({
        country: 'foo',
      });

    expect(location).toThrow(ArgumentError);
    expect(location).toThrow('country code');
  });

  it('constructs', () => {
    expect(() => {
      new Location({
        country: 'CA',
      });
    }).not.toThrow();
  });
});
