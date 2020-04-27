import * as crypto from 'crypto';
import isEmail from 'validator/lib/isEmail';
import isFQDN from 'validator/lib/isFQDN';
import { ArgumentError } from '../errors';

interface EmailProps {
  /**
   * The email address used in the transaction.
   */
  address?: string;
  /**
   * The domain of the email address.
   */
  domain?: string;
}

/**
 * The email information for the transaction being sent to the web service.
 */
export default class Email implements EmailProps {
  /**
   * The MD5 generated from the email address.
   */
  public address?: string;
  /**
   * The domain of the email address.
   */
  public domain?: string;

  public constructor(email: EmailProps) {
    if (email.address != null && !isEmail(email.address)) {
      throw new ArgumentError('`email.address` is an invalid email address');
    }

    if (email.domain != null && !isFQDN(email.domain)) {
      throw new ArgumentError('`email.domain` is an invalid domain');
    }

    this.address = email.address
      ? crypto
          .createHash('md5')
          .update(email.address.toLowerCase())
          .digest('hex')
      : undefined;
    this.domain = email.domain;

    if (email.domain == null && email.address != null) {
      this.domain = email.address.substring(email.address.indexOf('@') + 1);
    }
  }
}
