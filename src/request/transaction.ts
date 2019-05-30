import snakecaseKeys = require('snakecase-keys');
import { ArgumentError } from '../errors';
import Account from './account';
import Device from './device';
import Email from './email';
import Event from './event';

interface TransactionProps {
  account?: Account;
  device: Device;
  email?: Email;
  event?: Event;
}

export default class Transaction implements TransactionProps {
  public account?: Account;
  public device: Device;
  public email?: Email;
  public event?: Event;

  public constructor(transaction: TransactionProps) {
    if (!transaction.device || !(transaction.device instanceof Device)) {
      throw new ArgumentError('`device` needs to be an instance of Device');
    }

    this.device = transaction.device;
    this.email = transaction.email;
    this.event = transaction.event;
    this.account = transaction.account;
  }

  public toString(): string {
    return JSON.stringify(snakecaseKeys(this));
  }
}
