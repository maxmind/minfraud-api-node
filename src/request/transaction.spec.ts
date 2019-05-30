import isJSON = require('validator/lib/isJSON');
import { ArgumentError } from '../errors';
import Account from './account';
import Billing from './billing';
import CreditCard from './creditcard';
import Device from './device';
import Email from './email';
import Event from './event';
import Order from './order';
import Payment from './payment';
import Shipping from './shipping';
import ShoppingCartItem from './shopping-cart-item';
import Transaction from './transaction';

describe('Transaction()', () => {
  it('throws an error if `device` is not defined', () => {
    expect(() => {
      const test = new Transaction({
        // @ts-ignore
        device: undefined,
      });
    }).toThrowError(ArgumentError);
  });

  it('throws an error if `device` is not an instance of Device', () => {
    expect(() => {
      const test = new Transaction({
        device: {
          ipAddress: '123',
        },
      });
    }).toThrowError(ArgumentError);
  });

  it('constructs', () => {
    expect(() => {
      const test = new Transaction({
        device: new Device({
          ipAddress: '1.1.1.1',
        }),
      });
    }).not.toThrow();
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
          address_2: 'foo',
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
          address_2: 'foo',
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
          bankName: 'foo',
        }),
        device: new Device({
          ipAddress: '1.1.1.1',
          sessionAge: 100,
        }),
      });

      expect(isJSON(test.toString())).toBe(true);

      expect(test.toString()).toContain(deviceString);

      expect(test.toString()).toContain('"credit_card":{"bank_name":"foo"}');
    });

    it('it handles optional order field', () => {
      const test = new Transaction({
        device: new Device({
          ipAddress: '1.1.1.1',
          sessionAge: 100,
        }),
        order: new Order({
          amount: 123.99,
        }),
      });

      expect(isJSON(test.toString())).toBe(true);

      expect(test.toString()).toContain(deviceString);

      expect(test.toString()).toContain('"order":{"amount":123.99}');
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
});
