import { describe, expect, it } from 'vitest';
import { DeliverySpeed } from '../constants.js';
import Shipping from './shipping.js';

describe('Shipping()', () => {
  it('constructs', () => {
    expect(() => {
      new Shipping({
        country: 'CA',
        deliverySpeed: DeliverySpeed.Expedited,
      });
    }).not.toThrow();
  });
});
