import { ArgumentError } from '../errors';

interface CreditCardProps {
  /**
   * The issuer ID number for the credit card. This is the first 6 digits of
   * the credit card number. It identifies the issuing bank.
   */
  issuerIdNumber?: string;
  /**
   * The last four digits of the credit card number.
   */
  last4digits?: string;
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
}

const singleChar = /^[A-Za-z0-9]$/;
const issuerIdNumberRegex = /^[0-9]{6}$/;
const last4Regex = /^[0-9]{4}$/;
const tokenRegex = /^(?![0-9]{1,19}$)[\u0021-\u007E]{1,255}$/;

/**
 * The credit card information for the transaction being sent to the web service.
 */
export default class CreditCard implements CreditCardProps {
  /**
   * The issuer ID number for the credit card. This is the first 6 digits of
   * the credit card number. It identifies the issuing bank.
   */
  public issuerIdNumber?: string;
  /**
   * The last four digits of the credit card number.
   */
  public last4digits?: string;
  /**
   * A token uniquely identifying the card. This should not be the actual
   * credit card number.
   */
  public token?: string;
  /**
   * The name of the issuing bank as provided by the end user.
   */
  public bankName?: string;
  /**
   * The phone country code for the issuing bank as provided by the end user.
   */
  public bankPhoneCountryCode?: string;
  /**
   * The phone number, without the country code, for the issuing bank as
   * provided by the end user.
   */
  public bankPhoneNumber?: string;
  /**
   * The address verification system (AVS) check result, as returned to you by
   * the credit card processor. The minFraud service supports the standard AVS
   * codes.
   */
  public avsResult?: string;
  /**
   * The card verification value (CVV) code as provided by the payment processor.
   */
  public cvvResult?: string;

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

    if (
      creditCard.last4digits != null &&
      !last4Regex.test(creditCard.last4digits)
    ) {
      throw new ArgumentError(
        `The last 4 credit card digits (last4digits) ${creditCard.last4digits} are of the wrong format.`
      );
    }

    if (creditCard.token != null && !tokenRegex.test(creditCard.token)) {
      throw new ArgumentError(
        `The credit card token (token) ${creditCard.token} was invalid. Tokens must be non-space ASCII printable characters. If the token consists of all digits, it must be more than 19 digits.`
      );
    }

    Object.assign(this, creditCard);
  }
}
