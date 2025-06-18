import { ArgumentError } from '../errors';
import ShoppingCartItem from './shopping-cart-item';

describe('ShoppingCartItem()', () => {
  it('throws an error if quantity is not an integer', () => {
    const item = () =>
      new ShoppingCartItem({
        quantity: 123.12,
      });
    expect(item).toThrow(ArgumentError);
    expect(item).toThrow('positive integer');
  });

  it('throws an error if quantity is not a positive integer', () => {
    const item = () =>
      new ShoppingCartItem({
        quantity: -1,
      });
    expect(item).toThrow(ArgumentError);
    expect(item).toThrow('positive integer');
  });

  it('constructs', () => {
    expect(() => {
      new ShoppingCartItem({
        quantity: 100,
      });
    }).not.toThrow();
  });
});
