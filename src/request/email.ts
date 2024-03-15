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
    'gmai.com': 'gmail.com',
    'gamil.com': 'gmail.com',
    'gmali.com': 'gmail.com',
    'gmial.com': 'gmail.com',
    'gmil.com': 'gmail.com',
    'gmaill.com': 'gmail.com',
    'gmailm.com': 'gmail.com',
    'gmailo.com': 'gmail.com',
    'gmailyhoo.com': 'gmail.com',
    'yahoogmail.com': 'gmail.com',
    // outlook.com
    'putlook.com': 'outlook.com',
  };

  private static readonly typoTLDs: { [key: string]: string } = {
    comm: 'com',
    commm: 'com',
    commmm: 'com',
    comn: 'com',

    cbm: 'com',
    ccm: 'com',
    cdm: 'com',
    cem: 'com',
    cfm: 'com',
    cgm: 'com',
    chm: 'com',
    cim: 'com',
    cjm: 'com',
    ckm: 'com',
    clm: 'com',
    cmm: 'com',
    cnm: 'com',
    cpm: 'com',
    cqm: 'com',
    crm: 'com',
    csm: 'com',
    ctm: 'com',
    cum: 'com',
    cvm: 'com',
    cwm: 'com',
    cxm: 'com',
    cym: 'com',
    czm: 'com',

    col: 'com',
    con: 'com',

    dom: 'com',
    don: 'com',
    som: 'com',
    son: 'com',
    vom: 'com',
    von: 'com',
    xom: 'com',
    xon: 'com',

    clam: 'com',
    colm: 'com',
    comcom: 'com',
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

  private static readonly fastmailDomains: { [key: string]: boolean } = {
    '123mail.org': true,
    '150mail.com': true,
    '150ml.com': true,
    '16mail.com': true,
    '2-mail.com': true,
    '4email.net': true,
    '50mail.com': true,
    'airpost.net': true,
    'allmail.net': true,
    'bestmail.us': true,
    'cluemail.com': true,
    'elitemail.org': true,
    'emailcorner.net': true,
    'emailengine.net': true,
    'emailengine.org': true,
    'emailgroups.net': true,
    'emailplus.org': true,
    'emailuser.net': true,
    'eml.cc': true,
    'f-m.fm': true,
    'fast-email.com': true,
    'fast-mail.org': true,
    'fastem.com': true,
    'fastemail.us': true,
    'fastemailer.com': true,
    'fastest.cc': true,
    'fastimap.com': true,
    'fastmail.cn': true,
    'fastmail.co.uk': true,
    'fastmail.com': true,
    'fastmail.com.au': true,
    'fastmail.de': true,
    'fastmail.es': true,
    'fastmail.fm': true,
    'fastmail.fr': true,
    'fastmail.im': true,
    'fastmail.in': true,
    'fastmail.jp': true,
    'fastmail.mx': true,
    'fastmail.net': true,
    'fastmail.nl': true,
    'fastmail.org': true,
    'fastmail.se': true,
    'fastmail.to': true,
    'fastmail.tw': true,
    'fastmail.uk': true,
    'fastmail.us': true,
    'fastmailbox.net': true,
    'fastmessaging.com': true,
    'fea.st': true,
    'fmail.co.uk': true,
    'fmailbox.com': true,
    'fmgirl.com': true,
    'fmguy.com': true,
    'ftml.net': true,
    'h-mail.us': true,
    'hailmail.net': true,
    'imap-mail.com': true,
    'imap.cc': true,
    'imapmail.org': true,
    'inoutbox.com': true,
    'internet-e-mail.com': true,
    'internet-mail.org': true,
    'internetemails.net': true,
    'internetmailing.net': true,
    'jetemail.net': true,
    'justemail.net': true,
    'letterboxes.org': true,
    'mail-central.com': true,
    'mail-page.com': true,
    'mailandftp.com': true,
    'mailas.com': true,
    'mailbolt.com': true,
    'mailc.net': true,
    'mailcan.com': true,
    'mailforce.net': true,
    'mailftp.com': true,
    'mailhaven.com': true,
    'mailingaddress.org': true,
    'mailite.com': true,
    'mailmight.com': true,
    'mailnew.com': true,
    'mailsent.net': true,
    'mailservice.ms': true,
    'mailup.net': true,
    'mailworks.org': true,
    'ml1.net': true,
    'mm.st': true,
    'myfastmail.com': true,
    'mymacmail.com': true,
    'nospammail.net': true,
    'ownmail.net': true,
    'petml.com': true,
    'postinbox.com': true,
    'postpro.net': true,
    'proinbox.com': true,
    'promessage.com': true,
    'realemail.net': true,
    'reallyfast.biz': true,
    'reallyfast.info': true,
    'rushpost.com': true,
    'sent.as': true,
    'sent.at': true,
    'sent.com': true,
    'speedpost.net': true,
    'speedymail.org': true,
    'ssl-mail.com': true,
    'swift-mail.com': true,
    'the-fastest.net': true,
    'the-quickest.com': true,
    'theinternetemail.com': true,
    'veryfast.biz': true,
    'veryspeedy.net': true,
    'warpmail.net': true,
    'xsmail.com': true,
    'yepmail.net': true,
    'your-mail.com': true,
  };

  private static readonly yahooDomains: { [key: string]: boolean } = {
    'y7mail.com': true,
    'yahoo.at': true,
    'yahoo.be': true,
    'yahoo.bg': true,
    'yahoo.ca': true,
    'yahoo.cl': true,
    'yahoo.co.id': true,
    'yahoo.co.il': true,
    'yahoo.co.in': true,
    'yahoo.co.kr': true,
    'yahoo.co.nz': true,
    'yahoo.co.th': true,
    'yahoo.co.uk': true,
    'yahoo.co.za': true,
    'yahoo.com': true,
    'yahoo.com.ar': true,
    'yahoo.com.au': true,
    'yahoo.com.br': true,
    'yahoo.com.co': true,
    'yahoo.com.hk': true,
    'yahoo.com.hr': true,
    'yahoo.com.mx': true,
    'yahoo.com.my': true,
    'yahoo.com.pe': true,
    'yahoo.com.ph': true,
    'yahoo.com.sg': true,
    'yahoo.com.tr': true,
    'yahoo.com.tw': true,
    'yahoo.com.ua': true,
    'yahoo.com.ve': true,
    'yahoo.com.vn': true,
    'yahoo.cz': true,
    'yahoo.de': true,
    'yahoo.dk': true,
    'yahoo.ee': true,
    'yahoo.es': true,
    'yahoo.fi': true,
    'yahoo.fr': true,
    'yahoo.gr': true,
    'yahoo.hu': true,
    'yahoo.ie': true,
    'yahoo.in': true,
    'yahoo.it': true,
    'yahoo.lt': true,
    'yahoo.lv': true,
    'yahoo.nl': true,
    'yahoo.no': true,
    'yahoo.pl': true,
    'yahoo.pt': true,
    'yahoo.ro': true,
    'yahoo.se': true,
    'yahoo.sk': true,
    'ymail.com': true,
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

    let separator = '+';
    if (Object.prototype.hasOwnProperty.call(Email.yahooDomains, domain)) {
      separator = '-';
    }

    const separatorIndex = localPart.indexOf(separator);
    if (separatorIndex > 0) {
      localPart = localPart.substring(0, separatorIndex);
    }

    if (domain === 'gmail.com') {
      localPart = localPart.replace(/\./g, '');
    }

    const domainParts = domain.split('.');
    if (domainParts.length > 2) {
      const possibleDomain = domainParts.slice(1).join('.');
      if (
        Object.prototype.hasOwnProperty.call(
          Email.fastmailDomains,
          possibleDomain
        )
      ) {
        domain = possibleDomain;
        if (localPart !== '') {
          localPart = domainParts[0];
        }
      }
    }

    return localPart + '@' + domain;
  }

  private cleanDomain(domain: string) {
    // We don't need to trim the domain as if it has any leading whitespace
    // validation (isEmail()) rejects it as invalid.

    // We don't need to strip a trailing '.' because validation (isEmail())
    // rejects domains that have it.

    domain = punycode.toASCII(domain);

    domain = domain.replace(/(?:\.com){2,}$/, '.com');
    domain = domain.replace(/^\d+(?:gmail?\.com)$/, 'gmail.com');

    const idx = domain.lastIndexOf('.');
    if (idx !== -1) {
      const tld = domain.substring(idx + 1);
      if (Object.prototype.hasOwnProperty.call(Email.typoTLDs, tld)) {
        domain = domain.substring(0, idx) + '.' + Email.typoTLDs[tld];
      }
    }

    if (Object.prototype.hasOwnProperty.call(Email.typoDomains, domain)) {
      domain = Email.typoDomains[domain];
    }

    if (Object.prototype.hasOwnProperty.call(Email.equivalentDomains, domain)) {
      domain = Email.equivalentDomains[domain];
    }

    return domain;
  }
}
