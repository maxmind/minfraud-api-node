import Billing from './billing';

describe('Billing()', () => {
  it('constructs', () => {
    expect(() => {
      new Billing({
        country: 'CA',
      });
    }).not.toThrow();
  });
});
