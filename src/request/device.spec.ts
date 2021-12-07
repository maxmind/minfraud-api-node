import { ArgumentError } from '../errors';
import Device from './device';

describe('Device()', () => {
  it('throws an error if device.ipAddress is not valid', () => {
    const device = () =>
      new Device({
        ipAddress: 'foo',
      });
    expect(device).toThrowError(ArgumentError);
    expect(device).toThrowError('device.ipAddress');
  });

  it('constructs', () => {
    expect(() => {
      new Device({
        ipAddress: '1.1.1.1',
        userAgent: 'foo',
      });
    }).not.toThrow();
  });

  it('constructs without IP', () => {
    expect(() => {
      new Device({
        userAgent: 'foo',
      });
    }).not.toThrow();
  });
});
