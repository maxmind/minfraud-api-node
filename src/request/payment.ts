import { PaymentMethod, Processor } from '../constants';

interface PaymentProps {
  /**
   * The payment method associated with the transaction.
   */
  method?: PaymentMethod;
  /**
   * The payment processor used for the transaction.
   */
  processor?: Processor;
  /**
   * The authorization outcome from the payment processor. If the transaction
   * has not yet been approved or denied, do not include this field.
   */
  wasAuthorized?: boolean;
  /**
   * The decline code as provided by your payment processor. If the transaction
   * was not declined, do not include this field.
   */
  declineCode?: string;
}

/**
 * The payment information for the transaction being sent to the web service.
 */
export default class Payment implements PaymentProps {
  /** @inheritDoc PaymentProps.method */
  public method?: PaymentMethod;
  /** @inheritDoc PaymentProps.processor */
  public processor?: Processor;
  /** @inheritDoc PaymentProps.wasAuthorized */
  public wasAuthorized?: boolean;
  /** @inheritDoc PaymentProps.declineCode */
  public declineCode?: string;

  public constructor(payment: PaymentProps) {
    Object.assign(this, payment);
  }
}
