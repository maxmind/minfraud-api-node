import { ArgumentError } from '../errors';

interface CreditCardProps {
  issuerIdNumber?: string;
  last_4_digits?: string;
  token?: string;
  bankName?: string;
  bankPhoneCountryCode?: string;
  bankPhoneNumber?: string;
  avsResult?: string;
  cvvResult?: string;
}

const issuerIdNumberRegex = /^[0-9]{6}$/;
const last4Regex = /^[0-9]{4}$/;
const tokenRegex = /^(?![0-9]{1,19}$)[\\x21-\\x7E]{1,255}$/;

export default class CreditCard implements CreditCardProps {
  public issuerIdNumber?: string;
  public last_4_digits?: string;
  public token?: string;
  public bankName?: string;
  public bankPhoneCountryCode?: string;
  public bankPhoneNumber?: string;
  public avsResult?: string;
  public cvvResult?: string;

  public constructor(creditCard: CreditCardProps) {
    if (
      creditCard.issuerIdNumber != null &&
      !issuerIdNumberRegex.test(creditCard.issuerIdNumber)
    ) {
      throw new ArgumentError(
        `The issuer ID number ${
          creditCard.issuerIdNumber
        } is of the wrong format.`
      );
    }

    if (
      creditCard.last_4_digits != null &&
      !last4Regex.test(creditCard.last_4_digits)
    ) {
      throw new ArgumentError(
        `The last 4 credit card digits ${
          creditCard.last_4_digits
        } are of the wrong format.`
      );
    }

    if (creditCard.token != null && !tokenRegex.test(creditCard.token)) {
      throw new ArgumentError(
        `The credit card token ${
          creditCard.token
        } was invalid. Tokens must be non-space ASCII printable characters. If the token consists of all digits, it must be more than 19 digits.`
      );
    }

    Object.assign(this, creditCard);
  }
}
