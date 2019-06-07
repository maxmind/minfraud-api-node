import { URL } from 'url';
import { ArgumentError } from '../errors';
import Order from './order';

describe('Order()', () => {
  it('throws an error if currency is not valid', () => {
    const order = () =>
      new Order({
        currency: 'foo',
      });
    expect(order).toThrowError(ArgumentError);
    expect(order).toThrowError('currency code');
  });

  it('throws an error if referrer URI is not valid', () => {
    const order = () =>
      new Order({
        // @ts-ignore
        referrerUri: 'foo',
      });
    expect(order).toThrowError(ArgumentError);
    expect(order).toThrowError('referrer URI');
  });

  it('constructs', () => {
    expect(() => {
      const order = new Order({
        currency: 'CAD',
        referrerUri: new URL('https://www.foobar.com/foo/bar.html?ref=1'),
      });
    }).not.toThrow();
  });
});
