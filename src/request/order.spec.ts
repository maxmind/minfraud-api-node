import { ArgumentError } from '../errors';
import Order from './order';

describe('Order()', () => {
  it('throws an error if currency is not valid', () => {
    expect(() => {
      const order = new Order({
        currency: 'foo',
      });
    }).toThrowError(ArgumentError);
  });

  it('constructs', () => {
    expect(() => {
      const order = new Order({
        currency: 'CAD',
      });
    }).not.toThrow();
  });
});
