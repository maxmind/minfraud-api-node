import Payment from './payment';
import { PaymentMethod } from '../constants';

describe('Payment()', () => {
  it('constructs', () => {
    expect(() => {
      new Payment({
        wasAuthorized: true,
      });
    }).not.toThrow();
  });

  it('accepts card payment method', () => {
    const payment = new Payment({
      method: PaymentMethod.Card,
    });

    expect(payment.method).toEqual(PaymentMethod.Card);
  });

  it('accepts crypto payment method', () => {
    const payment = new Payment({
      method: PaymentMethod.Crypto,
    });

    expect(payment.method).toEqual(PaymentMethod.Crypto);
  });

  it('accepts digital_wallet payment method', () => {
    const payment = new Payment({
      method: PaymentMethod.DigitalWallet,
    });

    expect(payment.method).toEqual(PaymentMethod.DigitalWallet);
  });
});
