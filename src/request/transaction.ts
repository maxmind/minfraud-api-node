import * as snakecaseKeys from 'snakecase-keys';
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

interface TransactionProps {
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
  device: Device;
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
  public customInputs?: any;
  /** @inheritDoc TransactionProps.device */
  public device: Device;
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

    // This is done to appease TypeScript - strict
    this.device = transaction.device;

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

  private argumentCheck(property: any, type: any, key: string) {
    if (property != null && !(property instanceof type)) {
      throw new ArgumentError(
        `\`${key}\` needs to be an instance of ${type.name}`
      );
    }
  }

  private sanitizeKeys() {
    const sanitized = Object.assign({}, this) as any;

    if (
      sanitized.creditCard != null &&
      sanitized.creditCard.last4digits != null
    ) {
      sanitized.creditCard.last_4_digits = this.creditCard!.last4digits;
      delete sanitized.creditCard.last4digits;
    }

    if (sanitized.billing != null && sanitized.billing.address2 != null) {
      sanitized.billing.address_2 = this.billing!.address2;
      delete sanitized.billing.address2;
    }

    if (sanitized.shipping != null && sanitized.shipping.address2 != null) {
      sanitized.shipping.address_2 = this.shipping!.address2;
      delete sanitized.shipping.address2;
    }

    return sanitized;
  }

  private checkRegularProps(props: TransactionProps) {
    // Excludes device, and array props (customInputs, shoppingCart)
    const propTypeMap = ({
      account: Account,
      billing: Billing,
      creditCard: CreditCard,
      email: Email,
      event: Event,
      order: Order,
      payment: Payment,
      shipping: Shipping,
    } as unknown) as typeof props;

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
    if (!props.device || !(props.device instanceof Device)) {
      throw new ArgumentError('`device` needs to be an instance of Device');
    }

    this.checkRegularProps(props);
    this.checkArrayProps(props);
  }
}
