import snakecaseKeys from 'snakecase-keys';
import { ArgumentError } from '../errors';
import Account from './account';
import Billing from './billing';
import CreditCard from './credit-card';
import CustomInput from './custom-input';
import Device from './device';
import Email from './email';
import Event from './event';
import Order from './order';
import Payment from './payment';
import Shipping from './shipping';
import ShoppingCartItem from './shopping-cart-item';

export interface TransactionProps {
  /**
   * Account information for the transaction.
   */
  account?: Account;
  /**
   * Information about the account used in the transaction.
   */
  billing?: Billing;
  /**
   * Information about the credit card used in the transaction.
   */
  creditCard?: CreditCard;
  /**
   * Custom inputs as configured on your account portal.
   */
  customInputs?: CustomInput[];
  /**
   * Information about the device used in the transaction.
   */
  device?: Device;
  /**
   * Information about the email used in the transaction.
   */
  email?: Email;
  /**
   * Details about the event such as the time.
   */
  event?: Event;
  /**
   * Details about the order.
   */
  order?: Order;
  /**
   * Information about the payment processing.
   */
  payment?: Payment;
  /**
   * Shipping information used in the transaction.
   */
  shipping?: Shipping;
  /**
   * List of shopping items in the transaction.
   */
  shoppingCart?: ShoppingCartItem[];
}

/**
 * The transaction to be sent to the web service.
 */
export default class Transaction {
  /** @inheritDoc TransactionProps.account */
  public account?: Account;
  /** @inheritDoc TransactionProps.billing */
  public billing?: Billing;
  /** @inheritDoc TransactionProps.creditCard */
  public creditCard?: CreditCard;
  /** @inheritDoc TransactionProps.customInputs */
  public customInputs?: Record<string, boolean | number | string>;
  /** @inheritDoc TransactionProps.device */
  public device?: Device;
  /** @inheritDoc TransactionProps.email */
  public email?: Email;
  /** @inheritDoc TransactionProps.event */
  public event?: Event;
  /** @inheritDoc TransactionProps.order */
  public order?: Order;
  /** @inheritDoc TransactionProps.payment */
  public payment?: Payment;
  /** @inheritDoc TransactionProps.shipping */
  public shipping?: Shipping;
  /** @inheritDoc TransactionProps.shoppingCart */
  public shoppingCart?: ShoppingCartItem[];

  public constructor(transaction: TransactionProps) {
    this.ensureTypes(transaction);

    Object.assign(this, transaction);

    if (transaction.customInputs != null) {
      this.customInputs = Object.assign({}, ...transaction.customInputs);
    }
  }

  public toString(): string {
    const sanitized = this.sanitizeKeys();

    if (sanitized.order != null && sanitized.order.referrerUri) {
      sanitized.order.referrerUri = sanitized.order.referrerUri.toString();
    }

    return JSON.stringify(snakecaseKeys(sanitized));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private argumentCheck(property: any, type: any, key: string) {
    if (property != null && !(property instanceof type)) {
      throw new ArgumentError(
        `\`${key}\` needs to be an instance of ${type.name}`
      );
    }
  }

  private sanitizeKeys() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sanitized = Object.assign({}, this) as any;

    if (
      sanitized.billing &&
      Object.prototype.hasOwnProperty.call(sanitized.billing, 'address2')
    ) {
      sanitized.billing.address_2 = sanitized.billing.address2;
      delete sanitized.billing.address2;
    }

    if (
      sanitized.shipping &&
      Object.prototype.hasOwnProperty.call(sanitized.shipping, 'address2')
    ) {
      sanitized.shipping.address_2 = sanitized.shipping.address2;
      delete sanitized.shipping.address2;
    }

    if (
      sanitized.creditCard &&
      Object.prototype.hasOwnProperty.call(
        sanitized.creditCard,
        'was3DSecureSuccessful'
      )
    ) {
      sanitized.creditCard.was_3d_secure_successful =
        sanitized.creditCard.was3DSecureSuccessful;
      delete sanitized.creditCard.was3DSecureSuccessful;
    }

    return sanitized;
  }

  private checkRegularProps(props: TransactionProps) {
    // Excludes array props (customInputs, shoppingCart)
    const propTypeMap = {
      account: Account,
      billing: Billing,
      creditCard: CreditCard,
      device: Device,
      email: Email,
      event: Event,
      order: Order,
      payment: Payment,
      shipping: Shipping,
    } as unknown as typeof props;

    const keys = Object.keys(propTypeMap) as (keyof typeof props)[];

    for (const key of keys) {
      this.argumentCheck(props[key], propTypeMap[key], key);
    }
  }

  private checkArrayProps(props: TransactionProps) {
    if (props.shoppingCart != null) {
      for (const [idx, item] of props.shoppingCart.entries()) {
        if (!(item instanceof ShoppingCartItem)) {
          throw new ArgumentError(
            `\`shoppingCart[${idx}]\` needs to be an instance of ShoppingCartItem`
          );
        }
      }
    }

    if (props.customInputs != null) {
      for (const [idx, item] of props.customInputs.entries()) {
        if (!(item instanceof CustomInput)) {
          throw new ArgumentError(
            `\`customInputs[${idx}]\` needs to be an instance of CustomInput`
          );
        }
      }
    }
  }

  private ensureTypes(props: TransactionProps) {
    this.checkRegularProps(props);
    this.checkArrayProps(props);
  }
}
