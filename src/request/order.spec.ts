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

  it('throws an error if referrer URI is not valid', () => {
    expect(() => {
      const order = new Order({
        referrerUri: 'foo',
      });
    }).toThrowError(ArgumentError);
  });

  it('constructs', () => {
    expect(() => {
      const order = new Order({
        currency: 'CAD',
        referrerUri: 'https://www.foobar.com/foo/bar.html?ref=1',
      });
    }).not.toThrow();
  });
});
