import { describe, expect, it } from 'vitest';
import { PhoneVerificationMethod } from '../constants.js';
import Billing from './billing.js';

describe('Billing()', () => {
  it('constructs', () => {
    expect(() => {
      new Billing({
        country: 'CA',
      });
    }).not.toThrow();
  });

  it('stores the phone verification properties', () => {
    const time = new Date('2026-10-01T14:30:00Z');
    const billing = new Billing({
      country: 'CA',
      phoneVerificationMethod: PhoneVerificationMethod.Network,
      phoneVerificationTime: time,
      phoneWasVerificationSuccessful: false,
    });

    expect(billing.country).toBe('CA');
    expect(billing.phoneVerificationMethod).toBe('network');
    expect(billing.phoneVerificationTime).toBe(time);
    expect(billing.phoneWasVerificationSuccessful).toBe(false);
  });
});
