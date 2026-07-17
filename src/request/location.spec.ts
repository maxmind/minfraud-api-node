import { describe, expect, it } from 'vitest';
import { ArgumentError } from '../errors.js';
import Location from './location.js';

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
