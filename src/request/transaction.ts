import snakecaseKeys = require('snakecase-keys');
import { ArgumentError } from '../errors';
import Device from './device';

interface TransactionProps {
  device: Device;
}

export default class Transaction {
  public device: Device;

  public constructor(transaction: TransactionProps) {
    if (!transaction.device || !(transaction.device instanceof Device)) {
      throw new ArgumentError('`device` needs to be an instance of Device');
    }

    this.device = transaction.device;
  }

  public toString(): string {
    return `{
      "device": ${this.snakeJsonStringify(this.device)}
    }`.replace(/\n|\s+/g, '');
  }

  private snakeJsonStringify(property: any): string {
    return JSON.stringify(snakecaseKeys(property));
  }
}
