import { DeliverySpeed } from '../constants';
import Shipping from './shipping';

describe('Shipping()', () => {
  it('constructs', () => {
    expect(() => {
      const shipping = new Shipping({
        country: 'CA',
        deliverySpeed: DeliverySpeed.Expedited,
      });
    }).not.toThrow();
  });
});
