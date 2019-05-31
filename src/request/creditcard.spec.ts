import { ArgumentError } from '../errors';
import CreditCard from './creditcard';

describe('CreditCard()', () => {
  it('throws an error if avsResult is not valid', () => {
    expect(() => {
      const creditcard = new CreditCard({
        avsResult: 'foo',
      });
    }).toThrowError(ArgumentError);
  });

  it('throws an error if cvvResult is not valid', () => {
    expect(() => {
      const creditcard = new CreditCard({
        cvvResult: 'foo',
      });
    }).toThrowError(ArgumentError);
  });

  it('throws an error if IIN is not valid', () => {
    expect(() => {
      const creditcard = new CreditCard({
        issuerIdNumber: 'foo',
      });
    }).toThrowError(ArgumentError);
  });

  it('throws an error if last4 is not valid', () => {
    expect(() => {
      const creditcard = new CreditCard({
        last_4_digits: 'foo',
      });
    }).toThrowError(ArgumentError);
  });

  it('throws an error if token is not valid', () => {
    expect(() => {
      const creditcard = new CreditCard({
        token: '432312',
      });
    }).toThrowError(ArgumentError);
  });

  it('constructs', () => {
    expect(() => {
      const creditcard = new CreditCard({
        issuerIdNumber: '123456',
        last_4_digits: '1234',
        token: 'valid_token',
      });
    }).not.toThrow();
  });
});
