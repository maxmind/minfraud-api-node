import snakecaseKeys = require('snakecase-keys');
import { ArgumentError } from '../errors';
import Account from './account';
import Billing from './billing';
import CreditCard from './creditcard';
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
    if (!transaction.device || !(transaction.device instanceof Device)) {
      throw new ArgumentError('`device` needs to be an instance of Device');
    }

    // This is done to appease TypeScript - strict
    this.device = transaction.device;

    Object.assign(this, transaction);

    if (transaction.customInputs != null) {
      this.customInputs = Object.assign({}, ...transaction.customInputs);
    }
  }

  public toString(): string {
    return JSON.stringify(snakecaseKeys(this));
  }
}
