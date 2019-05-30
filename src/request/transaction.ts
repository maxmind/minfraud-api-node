import snakecaseKeys = require('snakecase-keys');
import { ArgumentError } from '../errors';
import Account from './account';
import Billing from './billing';
import CreditCard from './creditcard';
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
  device: Device;
  email?: Email;
  event?: Event;
  order?: Order;
  payment?: Payment;
  shipping?: Shipping;
  shoppingCart?: ShoppingCartItem[];
}

export default class Transaction implements TransactionProps {
  public account?: Account;
  public billing?: Billing;
  public creditCard?: CreditCard;
  public device: Device;
  public email?: Email;
  public event?: Event;
  public order?: Order;
  public payment?: Payment;
  public shipping?: Shipping;
  public shoppingCart?: ShoppingCartItem[];

  public constructor(transaction: TransactionProps) {
    if (!transaction.device || !(transaction.device instanceof Device)) {
      throw new ArgumentError('`device` needs to be an instance of Device');
    }

    // This is done to appease TypeScript - strict
    this.device = transaction.device;
    Object.assign(this, transaction);
  }

  public toString(): string {
    return JSON.stringify(snakecaseKeys(this));
  }
}
