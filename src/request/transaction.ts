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
  account?: Account;
  billing?: Billing;
  creditCard?: CreditCard;
  customInputs?: CustomInput[];
  device: Device;
  email?: Email;
  event?: Event;
  order?: Order;
  payment?: Payment;
  shipping?: Shipping;
  shoppingCart?: ShoppingCartItem[];
}

export default class Transaction {
  public account?: Account;
  public billing?: Billing;
  public creditCard?: CreditCard;
  public customInputs?: any;
  public device: Device;
  public email?: Email;
  public event?: Event;
  public order?: Order;
  public payment?: Payment;
  public shipping?: Shipping;
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

    const keys = Object.keys(propTypeMap) as Array<keyof typeof props>;

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
