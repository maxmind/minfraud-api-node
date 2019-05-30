import { ArgumentError } from '../errors';
import ShoppingCartItem from './shopping-cart-item';

describe('ShoppingCartItem()', () => {
  it('throws an error if quantity is not an integer', () => {
    expect(() => {
      const item = new ShoppingCartItem({
        quantity: 123.12,
      });
    }).toThrowError(ArgumentError);
  });

  it('throws an error if quantity is not a positive integer', () => {
    expect(() => {
      const item = new ShoppingCartItem({
        quantity: -1,
      });
    }).toThrowError(ArgumentError);
  });

  it('constructs', () => {
    expect(() => {
      const item = new ShoppingCartItem({
        quantity: 100,
      });
    }).not.toThrow();
  });
});
