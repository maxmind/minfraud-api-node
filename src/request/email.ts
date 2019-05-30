import crypto = require('crypto');
import isEmail = require('validator/lib/isEmail');
import isFQDN = require('validator/lib/isFQDN');
import { ArgumentError } from '../errors';

interface EmailProps {
  address?: string;
  domain?: string;
}

export default class Email implements EmailProps {
  public address?: string;
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
