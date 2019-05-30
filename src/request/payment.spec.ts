import Payment from './payment';

describe('Payment()', () => {
  it('constructs', () => {
    expect(() => {
      const payment = new Payment({
        wasAuthorized: true,
      });
    }).not.toThrow();
  });
});
