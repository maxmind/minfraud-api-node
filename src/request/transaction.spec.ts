import { ArgumentError } from '../errors';
import Device from './device';
import Transaction from './transaction';

describe('Transaction()', () => {
  it('throws an error if `device` is not defined', () => {
    expect(() => {
      const test = new Transaction({
        // @ts-ignore
        device: undefined,
      });
    }).toThrowError(ArgumentError);
  });

  it('throws an error if `device` is not an instance of Device', () => {
    expect(() => {
      const test = new Transaction({
        device: {
          ipAddress: '123',
        },
      });
    }).toThrowError(ArgumentError);
  });

  it('throws an error if device.ipAddress is not valid', () => {
    expect(() => {
      const test = new Transaction({
        device: new Device({
          ipAddress: 'foo',
        }),
      });
    }).toThrowError(ArgumentError);
  });

  it('constructs', () => {
    expect(() => {
      const test = new Transaction({
        device: new Device({
          ipAddress: '1.1.1.1',
        }),
      });
    }).not.toThrow();
  });
});
