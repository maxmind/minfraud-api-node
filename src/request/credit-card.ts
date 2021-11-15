import { ArgumentError } from '../errors';

export interface CreditCardProps {
  /**
   * The issuer ID number for the credit card. This is the first 6 digits of
   * the credit card number. It identifies the issuing bank.
   */
  issuerIdNumber?: string;
  /**
   * The last digits of the credit card number.
   *
   * @deprecated Use lastDigits instead
   */
  last4digits?: string;
  /**
   * The last digits of the credit card number.
   */
  lastDigits?: string;
  /**
   * A token uniquely identifying the card. This should not be the actual
   * credit card number.
   */
  token?: string;
  /**
   * The name of the issuing bank as provided by the end user.
   */
  bankName?: string;
  /**
   * The phone country code for the issuing bank as provided by the end user.
   */
  bankPhoneCountryCode?: string;
  /**
   * The phone number, without the country code, for the issuing bank as
   * provided by the end user.
   */
  bankPhoneNumber?: string;
  /**
   * The address verification system (AVS) check result, as returned to you by
   * the credit card processor. The minFraud service supports the standard AVS
   * codes.
   */
  avsResult?: string;
  /**
   * The card verification value (CVV) code as provided by the payment processor.
   */
  cvvResult?: string;
  /**
   * Whether or not the outcome of 3D-Secure verification (e.g. Safekey,
   * SecureCode, Verified by Visa) was successful as provided by the end user.
   * `true` if customer verification was successful, or `false` if the customer
   * failed verification. If 3-D Secure verification was not used, was
   * unavailable, or resulted in another outcome other than success or failure,
   * do not set this property.
   */
  was3DSecureSuccessful?: boolean;
}

const singleChar = /^[A-Za-z0-9]$/;
const issuerIdNumberRegex = /^(?:[0-9]{6}|[0-9]{8})$/;
const lastDigitsRegex = /^(?:[0-9]{2}|[0-9]{4})$/;
const tokenRegex = /^(?![0-9]{1,19}$)[\u0021-\u007E]{1,255}$/;

/**
 * The credit card information for the transaction being sent to the web service.
 */
export default class CreditCard implements CreditCardProps {
  /** @inheritDoc CreditCardProps.issuerIdNumber */
  public issuerIdNumber?: string;
  /** @inheritDoc CreditCardProps.lastDigits */
  public lastDigits?: string;
  /** @inheritDoc CreditCardProps.token */
  public token?: string;
  /** @inheritDoc CreditCardProps.bankName */
  public bankName?: string;
  /** @inheritDoc CreditCardProps.bankPhoneCountryCode */
  public bankPhoneCountryCode?: string;
  /** @inheritDoc CreditCardProps.bankPhoneNumber */
  public bankPhoneNumber?: string;
  /** @inheritDoc CreditCardProps.avsResult */
  public avsResult?: string;
  /** @inheritDoc CreditCardProps.cvvResult */
  public cvvResult?: string;
  /** @inheritDoc CreditCardProps.was3DSecureSuccessful */
  public was3DSecureSuccessful?: boolean;

  public constructor(creditCard: CreditCardProps) {
    if (
      creditCard.avsResult != null &&
      !singleChar.test(creditCard.avsResult)
    ) {
      throw new ArgumentError(
        `avsResult should be a single character but we received: ${creditCard.avsResult}`
      );
    }

    if (
      creditCard.cvvResult != null &&
      !singleChar.test(creditCard.cvvResult)
    ) {
      throw new ArgumentError(
        `cvvResult should be a single character but we received: ${creditCard.cvvResult}`
      );
    }

    if (
      creditCard.issuerIdNumber != null &&
      !issuerIdNumberRegex.test(creditCard.issuerIdNumber)
    ) {
      throw new ArgumentError(
        `The issuer ID number (issuerIdNumber) ${creditCard.issuerIdNumber} is of the wrong format.`
      );
    }

    if (creditCard.last4digits != null) {
      creditCard.lastDigits = creditCard.last4digits;
    }

    if (creditCard.lastDigits != null) {
      creditCard.last4digits = creditCard.lastDigits;
    }

    if (
      creditCard.lastDigits != null &&
      !lastDigitsRegex.test(creditCard.lastDigits)
    ) {
      throw new ArgumentError(
        `The last credit card digits (lastDigits) ${creditCard.lastDigits} are of the wrong format.`
      );
    }

    if (
      creditCard.issuerIdNumber != null &&
      creditCard.lastDigits != null &&
      creditCard.issuerIdNumber.length === 8 &&
      creditCard.lastDigits.length !== 2
    ) {
      throw new ArgumentError(
        `The last credit card digits (lastDigits) ${creditCard.lastDigits} are of the wrong format. An eight digit issuerIdNumber requires a two digit value for lastDigit.`
      );
    }

    if (creditCard.token != null && !tokenRegex.test(creditCard.token)) {
      throw new ArgumentError(
        `The credit card token (token) ${creditCard.token} was invalid. Tokens must be non-space ASCII printable characters. If the token consists of all digits, it must be more than 19 digits.`
      );
    }

    Object.assign(this, creditCard);
  }

  /** Get the last digits of the credit card number.
   *
   * @deprecated Use lastDigits instead
   */
  public get last4digits() {
    return this.lastDigits;
  }

  /** Set the last digits of the credit card number.
   *
   * @deprecated Use lastDigits instead
   */
  public set last4digits(lastDigits: string | undefined) {
    this.lastDigits = lastDigits;
  }
}
