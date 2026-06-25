import validator from 'validator';
import { ArgumentError } from '../errors.js';
import Account from './account.js';
import Billing from './billing.js';
import CreditCard from './credit-card.js';
import CustomInput from './custom-input.js';
import Device from './device.js';
import Email from './email.js';
import Event from './event.js';
import Order from './order.js';
import Payment from './payment.js';
import Shipping from './shipping.js';
import ShoppingCartItem from './shopping-cart-item.js';
import Transaction, { TransactionProps } from './transaction.js';

describe('Transaction()', () => {
  it('does not throw an error if `device` is not defined', () => {
    const test = () =>
      new Transaction({
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        device: undefined,
      });
    expect(test).not.toThrow();
  });

  it('throws an error if `device` is not an instance of Device', () => {
    const test = () =>
      new Transaction({
        device: {
          ipAddress: '123',
        },
      });
    expect(test).toThrow(ArgumentError);
    expect(test).toThrow('instance of Device');
  });

  test.each`
    clss            | val
    ${'Account'}    | ${{ account: { userId: 'foo' } }}
    ${'Billing'}    | ${{ billing: { address: 'foo' } }}
    ${'CreditCard'} | ${{ creditCard: { bankName: 'foo' } }}
    ${'Email'}      | ${{ email: { domain: 'foo.com' } }}
    ${'Event'}      | ${{ event: { shopId: 'foo' } }}
    ${'Order'}      | ${{ order: { affiliateId: 'foo' } }}
    ${'Payment'}    | ${{ payment: { declineCode: 'A' } }}
    ${'Shipping'}   | ${{ shipping: { address: 'foo' } }}
  `(
    'throws an error if `$property` is not an instance of $clss',
    ({ clss, val }: { clss: string; val: Partial<TransactionProps> }) => {
      const txn: TransactionProps = Object.assign(
        { device: new Device({ ipAddress: '1.1.1.1' }) },
        val
      );
      const test = () => new Transaction(txn);
      expect(test).toThrow(ArgumentError);
      expect(test).toThrow(clss);
    }
  );

  it('throws an error if `customInputs[i]` is not an instance of CustomInput', () => {
    const test = () =>
      new Transaction({
        customInputs: [{ foo: 'bar' }],
        device: new Device({
          ipAddress: '1.1.1.1',
        }),
      });
    expect(test).toThrow(ArgumentError);
    expect(test).toThrow('CustomInput');
  });

  it('throws an error if `shoppingCart[i]` is not an instance of ShoppingCartItem', () => {
    const test = () =>
      new Transaction({
        device: new Device({
          ipAddress: '1.1.1.1',
        }),
        shoppingCart: [{ category: 'bar' }],
      });
    expect(test).toThrow(ArgumentError);
    expect(test).toThrow('ShoppingCartItem');
  });

  it('constructs', () => {
    expect(() => {
      new Transaction({
        device: new Device({
          ipAddress: '1.1.1.1',
        }),
      });
    }).not.toThrow();
  });

  it('constructs without device', () => {
    expect(() => {
      new Transaction({
        account: new Account({
          username: 'foo',
        }),
      });
    }).not.toThrow();
  });

  it('flattens custom inputs', () => {
    const test = new Transaction({
      customInputs: [
        new CustomInput('foo', 'bar'),
        new CustomInput('fizz', 'buzz'),
      ],
      device: new Device({
        ipAddress: '1.1.1.1',
      }),
    });

    expect(test.customInputs).toEqual({
      fizz: 'buzz',
      foo: 'bar',
    });
  });

  it('accepts custom inputs as a plain record', () => {
    const test = new Transaction({
      customInputs: { fizz: 'buzz', foo: 'bar' },
      device: new Device({
        ipAddress: '1.1.1.1',
      }),
    });

    expect(test.customInputs).toEqual({
      fizz: 'buzz',
      foo: 'bar',
    });
  });

  it('throws if a customInputs record value is not a primitive', () => {
    const test = () =>
      new Transaction({
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        customInputs: { foo: { nested: true } },
        device: new Device({
          ipAddress: '1.1.1.1',
        }),
      });
    expect(test).toThrow(ArgumentError);
    expect(test).toThrow('customInputs');
  });

  it('throws if a customInputs record value is a non-finite number', () => {
    const test = () =>
      new Transaction({
        customInputs: { foo: NaN },
        device: new Device({
          ipAddress: '1.1.1.1',
        }),
      });
    expect(test).toThrow(ArgumentError);
    expect(test).toThrow('customInputs');
  });

  describe('toString()', () => {
    const deviceString = '"device":{"ip_address":"1.1.1.1","session_age":100}';

    it('it handles mandatory device field', () => {
      const test = new Transaction({
        device: new Device({
          ipAddress: '1.1.1.1',
          sessionAge: 100,
        }),
      });

      expect(validator.isJSON(test.toString())).toBe(true);

      expect(test.toString()).toEqual(`{${deviceString}}`);
    });

    it('it handles optional event field', () => {
      const mockDate = '2019-05-29T21:33:35.565Z';
      const test = new Transaction({
        device: new Device({
          ipAddress: '1.1.1.1',
          sessionAge: 100,
        }),
        event: new Event({
          time: new Date(mockDate),
          transactionId: 'foobar',
        }),
      });

      expect(validator.isJSON(test.toString())).toBe(true);

      expect(test.toString()).toContain(deviceString);

      expect(test.toString()).toContain(
        `"event":{"time":"${mockDate}","transaction_id":"foobar"}
      `.replace(/\n|\s+/g, '')
      );
    });

    it('it handles optional account field', () => {
      const test = new Transaction({
        account: new Account({
          username: 'foo',
        }),
        device: new Device({
          ipAddress: '1.1.1.1',
          sessionAge: 100,
        }),
      });

      expect(validator.isJSON(test.toString())).toBe(true);

      expect(test.toString()).toContain(deviceString);

      expect(test.toString()).toContain(
        '"account":{"username_md5":"acbd18db4cc2f85cedef654fccc4a4d8"}'
      );
    });

    it('it handles optional email field', () => {
      const test = new Transaction({
        device: new Device({
          ipAddress: '1.1.1.1',
          sessionAge: 100,
        }),
        email: new Email({
          domain: 'foo.com',
        }),
      });

      expect(validator.isJSON(test.toString())).toBe(true);

      expect(test.toString()).toContain(deviceString);

      expect(test.toString()).toContain('"email":{"domain":"foo.com"}');
    });

    it('it handles optional billing field', () => {
      const test = new Transaction({
        billing: new Billing({
          address2: 'foo',
        }),
        device: new Device({
          ipAddress: '1.1.1.1',
          sessionAge: 100,
        }),
      });

      expect(validator.isJSON(test.toString())).toBe(true);

      expect(test.toString()).toContain(deviceString);

      expect(test.toString()).toContain('"billing":{"address_2":"foo"}');
    });

    it('does not mutate the caller’s input objects when serializing', () => {
      const billing = new Billing({ address2: 'foo' });
      const shipping = new Shipping({ address2: 'bar' });
      const creditCard = new CreditCard({ was3DSecureSuccessful: true });
      const order = new Order({
        referrerUri: new URL('https://example.com/foo'),
      });
      const test = new Transaction({
        billing,
        creditCard,
        device: new Device({ ipAddress: '1.1.1.1' }),
        order,
        shipping,
      });

      const serialized = test.toString();
      expect(serialized).toContain('"billing":{"address_2":"foo"}');
      expect(serialized).toContain('"shipping":{"address_2":"bar"}');
      expect(serialized).toContain('"was_3d_secure_successful":true');
      expect(serialized).toContain('"referrer_uri":"https://example.com/foo"');

      // Serializing must not have rewritten any of the caller's instances.
      expect(billing.address2).toEqual('foo');
      expect(Object.prototype.hasOwnProperty.call(billing, 'address_2')).toBe(
        false
      );
      expect(shipping.address2).toEqual('bar');
      expect(Object.prototype.hasOwnProperty.call(shipping, 'address_2')).toBe(
        false
      );
      expect(creditCard.was3DSecureSuccessful).toBe(true);
      expect(
        Object.prototype.hasOwnProperty.call(
          creditCard,
          'was_3d_secure_successful'
        )
      ).toBe(false);
      // referrerUri must still be the original URL, not a stringified copy.
      expect(order.referrerUri).toBeInstanceOf(URL);
    });

    it('it handles optional shipping field', () => {
      const test = new Transaction({
        device: new Device({
          ipAddress: '1.1.1.1',
          sessionAge: 100,
        }),
        shipping: new Shipping({
          address2: 'foo',
        }),
      });

      expect(validator.isJSON(test.toString())).toBe(true);

      expect(test.toString()).toContain(deviceString);

      expect(test.toString()).toContain('"shipping":{"address_2":"foo"}');
    });

    it('it handles optional payment field', () => {
      const test = new Transaction({
        device: new Device({
          ipAddress: '1.1.1.1',
          sessionAge: 100,
        }),
        payment: new Payment({
          wasAuthorized: true,
        }),
      });

      expect(validator.isJSON(test.toString())).toBe(true);

      expect(test.toString()).toContain(deviceString);

      expect(test.toString()).toContain('"payment":{"was_authorized":true}');
    });

    it('it handles optional credit card field', () => {
      const test = new Transaction({
        creditCard: new CreditCard({
          last4digits: '1234',
          was3DSecureSuccessful: true,
        }),
        device: new Device({
          ipAddress: '1.1.1.1',
          sessionAge: 100,
        }),
      });

      expect(validator.isJSON(test.toString())).toBe(true);

      expect(test.toString()).toContain(deviceString);

      expect(test.toString()).toContain(
        '"credit_card":{"last_digits":"1234","was_3d_secure_successful":true}'
      );
    });

    it('it handles optional order field', () => {
      const test = new Transaction({
        device: new Device({
          ipAddress: '1.1.1.1',
          sessionAge: 100,
        }),
        order: new Order({
          amount: 123.99,
          referrerUri: new URL('http://google.com'),
        }),
      });

      expect(validator.isJSON(test.toString())).toBe(true);

      expect(test.toString()).toContain(deviceString);

      expect(test.toString()).toContain('"order":{"amount":123.99');
      expect(test.toString()).toContain('"referrer_uri":"http://google.com/"');
    });

    it('it handles optional shopping cart field', () => {
      const test = new Transaction({
        device: new Device({
          ipAddress: '1.1.1.1',
          sessionAge: 100,
        }),
        shoppingCart: [
          new ShoppingCartItem({
            category: 'foo',
          }),
          new ShoppingCartItem({
            itemId: 'bar',
          }),
        ],
      });

      expect(validator.isJSON(test.toString())).toBe(true);

      expect(test.toString()).toContain(deviceString);

      expect(test.toString()).toContain('"shopping_cart":[{"category":"foo"},');
      expect(test.toString()).toContain('{"item_id":"bar"}]');
    });
  });

  describe('key casing conversion', () => {
    describe('`creditCard.lastDigits/last4digits` => `creditCard.lastDigits`', () => {
      test('typed value is mapped', () => {
        const test = JSON.parse(
          new Transaction({
            device: new Device({
              ipAddress: '1.1.1.1',
            }),
            creditCard: new CreditCard({ last4digits: '1234' }),
          }).toString()
        );

        expect(test.credit_card).toHaveProperty('last_digits', '1234');
      });

      test('null value is mapped', () => {
        const test = JSON.parse(
          new Transaction({
            device: new Device({
              ipAddress: '1.1.1.1',
            }),
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore explicit null
            creditCard: new CreditCard({ last4digits: null }),
          }).toString()
        );

        expect(test.credit_card).toHaveProperty('last_digits', null);
      });

      test('typed value is mapped', () => {
        const test = JSON.parse(
          new Transaction({
            device: new Device({
              ipAddress: '1.1.1.1',
            }),
            creditCard: new CreditCard({ lastDigits: '1234' }),
          }).toString()
        );

        expect(test.credit_card).toHaveProperty('last_digits', '1234');
      });

      test('null value is mapped', () => {
        const test = JSON.parse(
          new Transaction({
            device: new Device({
              ipAddress: '1.1.1.1',
            }),
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore explicit null
            creditCard: new CreditCard({ lastDigits: null }),
          }).toString()
        );

        expect(test.credit_card).toHaveProperty('last_digits', null);
      });
    });

    describe('`billing.address2` => `billing.address_2`', () => {
      test('typed value is mapped', () => {
        const test = JSON.parse(
          new Transaction({
            billing: new Billing({
              address2: '',
            }),
            device: new Device({
              ipAddress: '1.1.1.1',
            }),
          }).toString()
        );

        expect(test.billing).toHaveProperty('address_2', '');
      });

      test('null value is mapped', () => {
        const test = JSON.parse(
          new Transaction({
            billing: new Billing({
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore explicit null
              address2: null,
            }),
            device: new Device({
              ipAddress: '1.1.1.1',
            }),
          }).toString()
        );

        expect(test.billing).toHaveProperty('address_2', null);
      });
    });

    describe('`shipping.address2` => `shipping.address_2`', () => {
      test('typed value is mapped', () => {
        const test = JSON.parse(
          new Transaction({
            device: new Device({
              ipAddress: '1.1.1.1',
            }),
            shipping: new Shipping({
              address2: '',
            }),
          }).toString()
        );

        expect(test.shipping).toHaveProperty('address_2', '');
      });

      test('null value is mapped', () => {
        const test = JSON.parse(
          new Transaction({
            device: new Device({
              ipAddress: '1.1.1.1',
            }),
            shipping: new Shipping({
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore explicit null
              address2: null,
            }),
          }).toString()
        );

        expect(test.shipping).toHaveProperty('address_2', null);
      });
    });
  });

  describe('6 or 8 digit iins and 2 or 4 digit lastDigits', () => {
    it('it handles 8 digit iins with 2 digit lastDigits', () => {
      const test = new Transaction({
        creditCard: new CreditCard({
          issuerIdNumber: '12345678',
          lastDigits: '12',
        }),
        device: new Device({
          ipAddress: '1.1.1.1',
          sessionAge: 100,
        }),
      });

      expect(validator.isJSON(test.toString())).toBe(true);

      expect(test.toString()).toContain(
        '"credit_card":{"issuer_id_number":"12345678","last_digits":"12"}'
      );
    });

    it('it handles 8 digit iins with 4 digit lastDigits', () => {
      const test = new Transaction({
        creditCard: new CreditCard({
          issuerIdNumber: '12345678',
          lastDigits: '1234',
        }),
        device: new Device({
          ipAddress: '1.1.1.1',
          sessionAge: 100,
        }),
      });

      expect(validator.isJSON(test.toString())).toBe(true);

      expect(test.toString()).toContain(
        '"credit_card":{"issuer_id_number":"12345678","last_digits":"1234"}'
      );
    });

    it('it handles 6 digit iins with 2 digit lastDigits', () => {
      const test = new Transaction({
        creditCard: new CreditCard({
          issuerIdNumber: '123456',
          lastDigits: '12',
        }),
        device: new Device({
          ipAddress: '1.1.1.1',
          sessionAge: 100,
        }),
      });

      expect(validator.isJSON(test.toString())).toBe(true);

      expect(test.toString()).toContain(
        '"credit_card":{"issuer_id_number":"123456","last_digits":"12"}'
      );
    });
  });
});
