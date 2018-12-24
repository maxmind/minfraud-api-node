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

    this.device = new Device(transaction.device);
  }
}
