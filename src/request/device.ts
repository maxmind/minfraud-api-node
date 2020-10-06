import { isIP } from 'net';
import { ArgumentError } from '../errors';

interface DeviceProps {
  /**
   * The IP address associated with the device used by the customer in the
   * transaction.
   */
  ipAddress?: string;
  /**
   * The HTTP “User-Agent” header of the browser used in the transaction.
   */
  userAgent?: string;
  /**
   * The HTTP “Accept-Language” header of the device used in the transaction.
   */
  acceptLanguage?: string;
  /**
   * The number of seconds between the creation of the user's session and the
   * time of the transaction. Note that sessionAge is not the duration of the
   * current visit, but the time since the start of the first visit.
   */
  sessionAge?: number;
  /**
   * A string up to 255 characters in length. This is an ID that uniquely
   * identifies a visitor's session on the site.
   */
  sessionId?: string;
}

/**
 * The device information for the transaction being sent to the web service.
 */
export default class Device implements DeviceProps {
  /** @inheritDoc DeviceProps.ipAddress */
  public ipAddress?: string;
  /** @inheritDoc DeviceProps.userAgent */
  public userAgent?: string;
  /** @inheritDoc DeviceProps.acceptLanguage */
  public acceptLanguage?: string;
  /** @inheritDoc DeviceProps.sessionAge */
  public sessionAge?: number;
  /** @inheritDoc DeviceProps.sessionId */
  public sessionId?: string;

  public constructor(device: DeviceProps) {
    if (device.ipAddress != null && isIP(device.ipAddress) === 0) {
      throw new ArgumentError('`device.ipAddress` is an invalid IP address');
    }

    Object.assign(this, device);
  }
}
