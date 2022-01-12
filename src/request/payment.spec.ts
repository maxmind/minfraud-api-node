import Payment from './payment';

describe('Payment()', () => {
  it('constructs', () => {
    expect(() => {
      new Payment({
        wasAuthorized: true,
      });
    }).not.toThrow();
  });
});
