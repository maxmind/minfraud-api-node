import { Processor } from '../constants';

interface PaymentProps {
  processor?: Processor;
  wasAuthorized?: boolean;
  declineCode?: string;
}

export default class Payment implements PaymentProps {
  public processor?: Processor;
  public wasAuthorized?: boolean;
  public declineCode?: string;

  public constructor(payment: PaymentProps) {
    Object.assign(this, payment);
  }
}
