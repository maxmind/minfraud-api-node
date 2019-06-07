import { ArgumentError } from '../errors';
import ShoppingCartItem from './shopping-cart-item';

describe('ShoppingCartItem()', () => {
  it('throws an error if quantity is not an integer', () => {
    const item = () =>
      new ShoppingCartItem({
        quantity: 123.12,
      });
    expect(item).toThrowError(ArgumentError);
    expect(item).toThrowError('positive integer');
  });

  it('throws an error if quantity is not a positive integer', () => {
    const item = () =>
      new ShoppingCartItem({
        quantity: -1,
      });
    expect(item).toThrowError(ArgumentError);
    expect(item).toThrowError('positive integer');
  });

  it('constructs', () => {
    expect(() => {
      const item = new ShoppingCartItem({
        quantity: 100,
      });
    }).not.toThrow();
  });
});
