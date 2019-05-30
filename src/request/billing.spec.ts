import Billing from './billing';

describe('Billing()', () => {
  it('constructs', () => {
    expect(() => {
      const billing = new Billing({
        country: 'CA',
      });
    }).not.toThrow();
  });
});
