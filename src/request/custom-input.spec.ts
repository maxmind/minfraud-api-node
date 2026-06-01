import CustomInput from './custom-input.js';

describe('CustomInput()', () => {
  it('constructs', () => {
    const test = new CustomInput('foo', false);

    expect(test).toEqual({ foo: false });
  });
});
