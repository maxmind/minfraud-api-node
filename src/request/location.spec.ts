import { describe, expect, it } from 'vitest';
import { PhoneVerificationMethod } from '../constants.js';
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

  it('stores the phone verification properties', () => {
    const time = new Date('2026-10-01T14:30:00Z');
    const location = new Location({
      country: 'CA',
      phoneVerificationMethod: PhoneVerificationMethod.Network,
      phoneVerificationTime: time,
      phoneWasVerificationSuccessful: false,
    });

    expect(location.country).toBe('CA');
    expect(location.phoneVerificationMethod).toBe('network');
    expect(location.phoneVerificationTime).toBe(time);
    expect(location.phoneWasVerificationSuccessful).toBe(false);
  });
});
