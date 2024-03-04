import crypto from 'crypto';
import punycode from 'punycode';
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
  /**
   * By default, the address will be sent in plain text. If this is set
   * true, the address will instead be sent as an MD5 hash.
   */
  hashAddress?: boolean;
}

/**
 * The email information for the transaction being sent to the web service.
 */
export default class Email implements EmailProps {
  /**
   * The email address, or the MD5 generated from the email address if
   * hashAddress is true.
   */
  public address?: string;
  /** @inheritDoc EmailProps.domain */
  public domain?: string;

  private static readonly typoDomains: { [key: string]: string } = {
    // gmail.com
    '35gmai.com': 'gmail.com',
    '636gmail.com': 'gmail.com',
    'gamil.com': 'gmail.com',
    'gmail.comu': 'gmail.com',
    'gmial.com': 'gmail.com',
    'gmil.com': 'gmail.com',
    'yahoogmail.com': 'gmail.com',
    // outlook.com
    'putlook.com': 'outlook.com',
  };

  private static readonly equivalentDomains: { [key: string]: string } = {
    'googlemail.com': 'gmail.com',
    'pm.me': 'protonmail.com',
    'proton.me': 'protonmail.com',
    'yandex.by': 'yandex.ru',
    'yandex.com': 'yandex.ru',
    'yandex.kz': 'yandex.ru',
    'yandex.ua': 'yandex.ru',
    'ya.ru': 'yandex.ru',
  };

  public constructor(email: EmailProps) {
    if (email.address != null && !isEmail(email.address)) {
      throw new ArgumentError('`email.address` is an invalid email address');
    }

    if (email.domain != null && !isFQDN(email.domain)) {
      throw new ArgumentError('`email.domain` is an invalid domain');
    }

    if (email.address) {
      if (email.hashAddress) {
        this.address = crypto
          .createHash('md5')
          .update(this.cleanEmailAddress(email.address))
          .digest('hex');
      } else {
        this.address = email.address;
      }
    }

    this.domain = email.domain;

    if (email.domain == null && email.address != null) {
      this.domain = email.address.substring(email.address.indexOf('@') + 1);
    }
  }

  private cleanEmailAddress(address: string) {
    address = address.trim().toLowerCase();

    const atIndex = address.lastIndexOf('@');

    // We don't need to check that there is an @ or if it's the last index
    // because validation rejects those cases.

    let localPart = address.substring(0, atIndex);
    let domain = address.substring(atIndex + 1);

    domain = this.cleanDomain(domain);

    const separator = domain === 'yahoo.com' ? '-' : '+';
    const separatorIndex = localPart.indexOf(separator);
    if (separatorIndex > 0) {
      localPart = localPart.substring(0, separatorIndex);
    }

    if (domain === 'gmail.com') {
      localPart = localPart.replace(/\./g, '');
    }

    return localPart + '@' + domain;
  }

  private cleanDomain(domain: string) {
    // We don't need to trim the domain as if it has any leading whitespace
    // validation (isEmail()) rejects it as invalid.

    // We don't need to strip a trailing '.' because validation (isEmail())
    // rejects domains that have it.

    domain = punycode.toASCII(domain);

    if (Object.prototype.hasOwnProperty.call(Email.typoDomains, domain)) {
      domain = Email.typoDomains[domain];
    }

    if (Object.prototype.hasOwnProperty.call(Email.equivalentDomains, domain)) {
      domain = Email.equivalentDomains[domain];
    }

    return domain;
  }
}
