import { ArgumentError } from '../errors';
import CreditCard, { CreditCardProps } from './credit-card';

describe('CreditCard()', () => {
  test.each`
    condition                                           | field               | val
    ${'avsResult is not a single character'}            | ${'avsResult'}      | ${'foo'}
    ${'country is invalid'}                             | ${'country'}        | ${'ca'}
    ${'cvvResult is not a single character'}            | ${'cvvResult'}      | ${'foo'}
    ${'issuerIdNumber is too long'}                     | ${'issuerIdNumber'} | ${'1234567'}
    ${'issuerIdNumber is too short'}                    | ${'issuerIdNumber'} | ${'12345'}
    ${'issuerIdNumber has letters'}                     | ${'issuerIdNumber'} | ${'12345a'}
    ${'issuerIdNumber has non-alphanumeric characters'} | ${'issuerIdNumber'} | ${'12345!'}
    ${'lastDigits is too long'}                         | ${'lastDigits'}     | ${'12345'}
    ${'lastDigits is too short'}                        | ${'lastDigits'}     | ${'123'}
    ${'lastDigits has letters'}                         | ${'lastDigits'}     | ${'12a'}
    ${'lastDigits has non-alphanumeric characters'}     | ${'lastDigits'}     | ${'154!'}
    ${'token is a PAN'}                                 | ${'token'}          | ${'4485921507912924'}
    ${'token is numbers'}                               | ${'token'}          | ${'432312'}
    ${'token is some string phrase'}                    | ${'token'}          | ${'this is invalid'}
    ${'token is empty string'}                          | ${'token'}          | ${''}
    ${'token is too long'}                              | ${'token'}          | ${'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'}
  `(
    'throws an error if $condition',
    ({ field, val }: { field: string; val: string }) => {
      const creditCard = () => new CreditCard({ [field]: val });
      expect(creditCard).toThrow(ArgumentError);
      // Ensure that the `ArgumentError` message contains text of a given field
      expect(creditCard).toThrow(field);
    }
  );

  test.each`
    condition                                           | val
    ${'token is a prefixed PAN'}                        | ${{ token: 't4485921507912924' }}
    ${'token is not all digits'}                        | ${{ token: 'a7f6%gf83fhAu' }}
    ${'token is non-space and printable'}               | ${{ token: 'valid_token' }}
    ${'token is a number with more than 19 characters'} | ${{ token: '12345678901234567890' }}
  `(
    'does not throw an error if $condition',
    ({ val }: { val: CreditCardProps }) => {
      expect(() => new CreditCard(val)).not.toThrow();
    }
  );

  it('constructs', () => {
    expect(
      () =>
        new CreditCard({
          avsResult: 'A',
          country: 'CA',
          cvvResult: 'c',
          issuerIdNumber: '411111',
          last4digits: '1234',
          token: 'valid_token',
          was3DSecureSuccessful: true,
        })
    ).not.toThrow();
  });

  it('last4digits getter aliases lastDigits', () => {
    const cc = new CreditCard({
      issuerIdNumber: '411111',
      lastDigits: '1234',
    });

    expect(cc.lastDigits).toBe('1234');
    expect(cc.last4digits).toBe(cc.lastDigits);
  });

  it('last4digits setter aliases lastDigits', () => {
    const cc = new CreditCard({
      issuerIdNumber: '411111',
    });
    cc.last4digits = '1234';

    expect(cc.lastDigits).toBe('1234');
    expect(cc.last4digits).toBe(cc.lastDigits);
  });
});
