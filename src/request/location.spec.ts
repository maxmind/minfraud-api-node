import { describe, expect, it } from 'vitest';
import { PhoneVerificationMethod } from '../constants.js';
import { ArgumentError } from '../errors.js';
import Location, { LocationProps } from './location.js';

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
    expect(location.phoneVerificationTime).toEqual(time);
    expect(location.phoneWasVerificationSuccessful).toBe(false);
  });

  it('copies `phoneVerificationTime`', () => {
    const time = new Date('2026-10-01T14:30:00Z');
    const location = new Location({ phoneVerificationTime: time });

    time.setTime(0);

    expect(location.phoneVerificationTime).toEqual(
      new Date('2026-10-01T14:30:00Z')
    );
  });

  it('accepts null phone verification properties', () => {
    expect(
      () =>
        new Location({
          phoneVerificationMethod: null,
          phoneVerificationTime: null,
          phoneWasVerificationSuccessful: null,
        } as unknown as LocationProps)
    ).not.toThrow();
  });

  it.each(['sms', 'Network', ''])(
    'throws an ArgumentError for phoneVerificationMethod %j',
    (value) => {
      const test = () =>
        new Location({
          phoneVerificationMethod: value as PhoneVerificationMethod,
        });
      expect(test).toThrow(ArgumentError);
      expect(test).toThrow('phoneVerificationMethod');
    }
  );

  it.each(['true', 1, 0])(
    'throws an ArgumentError for phoneWasVerificationSuccessful %j',
    (value) => {
      const test = () =>
        new Location({
          phoneWasVerificationSuccessful: value as unknown as boolean,
        });
      expect(test).toThrow(ArgumentError);
      expect(test).toThrow('phoneWasVerificationSuccessful');
    }
  );

  it.each([
    ['an invalid Date', new Date('not a date')],
    ['a string', '2026-10-01T14:30:00Z'],
    ['a number', 1790000000000],
  ])('throws an ArgumentError if phoneVerificationTime is %s', (_, value) => {
    const test = () =>
      new Location({
        phoneVerificationTime: value as unknown as Date,
      });
    expect(test).toThrow(ArgumentError);
    expect(test).toThrow('phoneVerificationTime');
  });
});
