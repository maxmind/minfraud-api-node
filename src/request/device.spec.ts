import { ArgumentError } from '../errors';
import Device from './device';

describe('Device()', () => {
  it('throws an error if device.ipAddress is not valid', () => {
    expect(() => {
      const device = new Device({
        ipAddress: 'foo',
      });
    }).toThrowError(ArgumentError);
  });

  it('constructs', () => {
    expect(() => {
      const device = new Device({
        ipAddress: '1.1.1.1',
        userAgent: 'foo',
      });
    }).not.toThrow();
  });
});
