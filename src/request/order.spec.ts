import { URL } from 'url';
import { ArgumentError } from '../errors';
import Order from './order';

describe('Order()', () => {
  it('throws an error if currency is not valid', () => {
    const order = () =>
      new Order({
        currency: 'foo',
      });
    expect(order).toThrow(ArgumentError);
    expect(order).toThrow('currency code');
  });

  it('throws an error if referrer URI is not valid', () => {
    const order = () =>
      new Order({
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        referrerUri: 'foo',
      });
    expect(order).toThrow(ArgumentError);
    expect(order).toThrow('referrer URI');
  });

  it('constructs', () => {
    expect(() => {
      new Order({
        currency: 'CAD',
        referrerUri: new URL('https://www.foobar.com/foo/bar.html?ref=1'),
      });
    }).not.toThrow();
  });
});
