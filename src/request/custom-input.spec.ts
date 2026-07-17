import { describe, expect, it } from 'vitest';
import CustomInput from './custom-input.js';

describe('CustomInput()', () => {
  it('constructs', () => {
    const test = new CustomInput('foo', false);

    expect(test).toEqual({ foo: false });
  });
});
