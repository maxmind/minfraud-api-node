import { describe, expect, it } from 'vitest';
import { ArgumentError } from '../errors.js';
import Order from './order.js';

describe('Order()', () => {
  it('constructs without a referrer URI', () => {
    expect(() => new Order({ currency: 'USD' })).not.toThrow();
  });

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

  it('throws an error if the referrer URI scheme is not http(s)', () => {
    const order = () =>
      new Order({
        referrerUri: new URL('javascript:alert(1)'),
      });
    expect(order).toThrow(ArgumentError);
    expect(order).toThrow('referrer URI');
  });

  it('throws an error if the referrer URI host has no dot', () => {
    const order = () =>
      new Order({
        referrerUri: new URL('http://foo'),
      });
    expect(order).toThrow(ArgumentError);
    expect(order).toThrow('referrer URI');
  });

  it('accepts an IP-literal referrer host', () => {
    expect(() => {
      new Order({ referrerUri: new URL('https://[2001:db8::1]/') });
    }).not.toThrow();
    expect(() => {
      new Order({ referrerUri: new URL('http://192.0.2.1/') });
    }).not.toThrow();
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
