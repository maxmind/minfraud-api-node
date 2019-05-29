import snakecaseKeys = require('snakecase-keys');
import { ArgumentError } from '../errors';
import Device from './device';
import Event from './event';

interface TransactionProps {
  device: Device;
  event?: Event;
}

export default class Transaction implements TransactionProps {
  public device: Device;
  public event?: Event;

  public constructor(transaction: TransactionProps) {
    if (!transaction.device || !(transaction.device instanceof Device)) {
      throw new ArgumentError('`device` needs to be an instance of Device');
    }

    this.device = transaction.device;
    this.event = transaction.event;
  }

  public toString(): string {
    const device = `"device": ${this.snakeJsonStringify(this.device)}`;
    const event = this.event
      ? `,"event": ${this.snakeJsonStringify(this.event)}`
      : '';

    return `{
      ${device}
      ${event}
    }`.replace(/\n|\s+/g, '');
  }

  private snakeJsonStringify(property: any): string {
    return JSON.stringify(snakecaseKeys(property));
  }
}
