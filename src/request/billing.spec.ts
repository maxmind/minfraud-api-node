import Billing from './billing.js';

describe('Billing()', () => {
  it('constructs', () => {
    expect(() => {
      new Billing({
        country: 'CA',
      });
    }).not.toThrow();
  });
});
