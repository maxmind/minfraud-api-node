import { URL } from 'url';
import isJSON from 'validator/lib/isJSON';
import { ArgumentError } from '../errors';
import Account from './account';
import Billing from './billing';
import CreditCard from './credit-card';
import CustomInput from './custom-input';
import Device from './device';
import Email from './email';
import Event from './event';
import Order from './order';
import Payment from './payment';
import Shipping from './shipping';
import ShoppingCartItem from './shopping-cart-item';
import Transaction, { TransactionProps } from './transaction';

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
    expect(test).toThrowError(ArgumentError);
    expect(test).toThrowError('instance of Device');
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
      expect(test).toThrowError(ArgumentError);
      expect(test).toThrowError(clss);
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

  describe('toString()', () => {
    const deviceString = '"device":{"ip_address":"1.1.1.1","session_age":100}';

    it('it handles mandatory device field', () => {
      const test = new Transaction({
        device: new Device({
          ipAddress: '1.1.1.1',
          sessionAge: 100,
        }),
      });

      expect(isJSON(test.toString())).toBe(true);

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

      expect(isJSON(test.toString())).toBe(true);

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

      expect(isJSON(test.toString())).toBe(true);

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

      expect(isJSON(test.toString())).toBe(true);

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

      expect(isJSON(test.toString())).toBe(true);

      expect(test.toString()).toContain(deviceString);

      expect(test.toString()).toContain('"billing":{"address_2":"foo"}');
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

      expect(isJSON(test.toString())).toBe(true);

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

      expect(isJSON(test.toString())).toBe(true);

      expect(test.toString()).toContain(deviceString);

      expect(test.toString()).toContain('"payment":{"was_authorized":true}');
    });

    it('it handles optional credit card field', () => {
      const test = new Transaction({
        creditCard: new CreditCard({
          last4digits: '1234',
        }),
        device: new Device({
          ipAddress: '1.1.1.1',
          sessionAge: 100,
        }),
      });

      expect(isJSON(test.toString())).toBe(true);

      expect(test.toString()).toContain(deviceString);

      expect(test.toString()).toContain(
        '"credit_card":{"last_4_digits":"1234"}'
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

      expect(isJSON(test.toString())).toBe(true);

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

      expect(isJSON(test.toString())).toBe(true);

      expect(test.toString()).toContain(deviceString);

      expect(test.toString()).toContain('"shopping_cart":[{"category":"foo"},');
      expect(test.toString()).toContain('{"item_id":"bar"}]');
    });
  });

  describe('key casing conversion', () => {
    describe('`creditCard.last4digits` => `creditCard.last_4_digits`', () => {
      test('typed value is mapped', () => {
        const test = JSON.parse(
          new Transaction({
            device: new Device({
              ipAddress: '1.1.1.1',
            }),
            creditCard: new CreditCard({ last4digits: '1234' }),
          }).toString()
        );

        expect(test.credit_card).toHaveProperty('last_4_digits', '1234');
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

        expect(test.credit_card).toHaveProperty('last_4_digits', null);
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
});
