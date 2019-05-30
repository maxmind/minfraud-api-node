import snakecaseKeys = require('snakecase-keys');
import { ArgumentError } from '../errors';
import Account from './account';
import Billing from './billing';
import Device from './device';
import Email from './email';
import Event from './event';
import Payment from './payment';
import Shipping from './shipping';

interface TransactionProps {
  account?: Account;
  billing?: Billing;
  device: Device;
  email?: Email;
  event?: Event;
  payment?: Payment;
  shipping?: Shipping;
}

export default class Transaction implements TransactionProps {
  public account?: Account;
  public billing?: Billing;
  public device: Device;
  public email?: Email;
  public event?: Event;
  public payment?: Payment;
  public shipping?: Shipping;

  public constructor(transaction: TransactionProps) {
    if (!transaction.device || !(transaction.device instanceof Device)) {
      throw new ArgumentError('`device` needs to be an instance of Device');
    }

    this.device = transaction.device;
    this.email = transaction.email;
    this.event = transaction.event;
    this.account = transaction.account;
    this.billing = transaction.billing;
    this.shipping = transaction.shipping;
    this.payment = transaction.payment;
  }

  public toString(): string {
    return JSON.stringify(snakecaseKeys(this));
  }
}
