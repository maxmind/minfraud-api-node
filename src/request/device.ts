import { isIP } from 'net';
import { ArgumentError } from '../errors';

interface DeviceProps {
  ipAddress: string;
  userAgent?: string;
  acceptLanguage?: string;
  sessionAge?: number;
  sessionId?: string;
}

export default class Device implements DeviceProps {
  public ipAddress: string;
  public userAgent?: string;
  public acceptLanguage?: string;
  public sessionAge?: number;
  public sessionId?: string;

  public constructor(device: DeviceProps) {
    if (isIP(device.ipAddress) === 0) {
      throw new ArgumentError('`device.ipAddress` is an invalid IP address');
    }

    // This is done to appease TypeScript - strict
    this.ipAddress = device.ipAddress;
    Object.assign(this, device);
  }
}
