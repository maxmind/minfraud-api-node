import { isIP } from 'net';
import { ArgumentError } from '../errors';

interface DeviceProps {
  ipAddress: string;
}

export default class Device {
  public ipAddress: string;

  public constructor(device: DeviceProps) {
    if (isIP(device.ipAddress) === 0) {
      throw new ArgumentError('`device.ipAddress` is an invalid IP address');
    }

    this.ipAddress = device.ipAddress;
  }
}
