import { ArgumentError } from '../errors';
import CreditCard from './credit-card';

describe('CreditCard()', () => {
  test.each`
    condition                                           | field               | val
    ${'avsResult is not a single character'}            | ${'avsResult'}      | ${'foo'}
    ${'cvvResult is not a single character'}            | ${'cvvResult'}      | ${'foo'}
    ${'issuerIdNumber is too long'}                     | ${'issuerIdNumber'} | ${'1234567'}
    ${'issuerIdNumber is too short'}                    | ${'issuerIdNumber'} | ${'12345'}
    ${'issuerIdNumber has letters'}                     | ${'issuerIdNumber'} | ${'12345a'}
    ${'issuerIdNumber has non-alphanumeric characters'} | ${'issuerIdNumber'} | ${'12345!'}
    ${'last4digits is too long'}                        | ${'last4digits'}    | ${'12345'}
    ${'last4digits is too short'}                       | ${'last4digits'}    | ${'123'}
    ${'last4digits has letters'}                        | ${'last4digits'}    | ${'12a'}
    ${'last4digits has non-alphanumeric characters'}    | ${'last4digits'}    | ${'154!'}
    ${'token is a PAN'}                                 | ${'token'}          | ${'4485921507912924'}
    ${'token is numbers'}                               | ${'token'}          | ${'432312'}
    ${'token is some string phrase'}                    | ${'token'}          | ${'this is invalid'}
    ${'token is empty string'}                          | ${'token'}          | ${''}
    ${'token is too long'}                              | ${'token'}          | ${'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'}
  `('throws an error if $condition', ({ field, val }) => {
    const creditCard = () => new CreditCard({ [field]: val });
    expect(creditCard).toThrowError(ArgumentError);
    // Ensure that the `ArgumentError` message contains text of a given field
    expect(creditCard).toThrowError(field);
  });

  test.each`
    condition                                           | val
    ${'token is a prefixed PAN'}                        | ${{ token: 't4485921507912924' }}
    ${'token is not all digits'}                        | ${{ token: 'a7f6%gf83fhAu' }}
    ${'token is non-space and printable'}               | ${{ token: 'valid_token' }}
    ${'token is a number with more than 19 characters'} | ${{ token: '12345678901234567890' }}
  `('does not throw an error if $condition', ({ val }) => {
    expect(() => new CreditCard(val)).not.toThrow();
  });

  it('constructs', () => {
    expect(
      () =>
        new CreditCard({
          avsResult: 'A',
          cvvResult: 'c',
          issuerIdNumber: '411111',
          last4digits: '1234',
          token: 'valid_token',
        })
    ).not.toThrow();
  });
});
