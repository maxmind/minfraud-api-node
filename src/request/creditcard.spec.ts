import { ArgumentError } from '../errors';
import CreditCard from './creditcard';

describe('CreditCard()', () => {
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
        token: 'foo',
      });
    }).toThrowError(ArgumentError);
  });

  it('constructs', () => {
    expect(() => {
      const creditcard = new CreditCard({
        bankPhoneCountryCode: '1',
      });
    }).not.toThrow();
  });
});
