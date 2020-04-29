import { URL } from 'url';
import isURL from 'validator/lib/isURL';
import { ArgumentError } from '../errors';

interface OrderProps {
  /**
   * The total order amount for the transaction.
   */
  amount?: number;
  /**
   * The ISO 4217 currency code for the currency used in the transaction.
   */
  currency?: string;
  /**
   * The discount code applied to the transaction. If multiple discount codes
   * were used, please separate them with a comma.
   */
  discountCode?: string;
  /**
   * The ID of the affiliate where the order is coming from.
   */
  affiliateId?: string;
  /**
   * The ID of the sub-affiliate where the order is coming from.
   */
  subaffiliateId?: string;
  /**
   * The URI of the referring site for this order.
   */
  referrerUri?: URL;
  /**
   * Whether order was marked as a gift by the purchaser.
   */
  isGift?: boolean;
  /**
   * Whether the purchaser included a gift message.
   */
  hasGiftMessage?: boolean;
}

const currencyRegex = /^[A-Z]{3}$/;

/**
 * The order information for the transaction being sent to the web service.
 */
export default class Order implements OrderProps {
  /** @inheritDoc OrderProps.amount */
  public amount?: number;
  /** @inheritDoc OrderProps.currency */
  public currency?: string;
  /** @inheritDoc OrderProps.discountCode */
  public discountCode?: string;
  /** @inheritDoc OrderProps.affiliateId */
  public affiliateId?: string;
  /** @inheritDoc OrderProps.subaffiliateId */
  public subaffiliateId?: string;
  /** @inheritDoc OrderProps.referrerUri */
  public referrerUri?: URL;
  /** @inheritDoc OrderProps.isGift */
  public isGift?: boolean;
  /** @inheritDoc OrderProps.hasGiftMessage */
  public hasGiftMessage?: boolean;

  public constructor(order: OrderProps) {
    if (order.currency != null && !currencyRegex.test(order.currency)) {
      throw new ArgumentError(`The currency code ${order.currency} is invalid`);
    }

    if (order.referrerUri != null && !isURL(order.referrerUri.toString())) {
      throw new ArgumentError(
        `The referrer URI ${order.referrerUri} is invalid`
      );
    }

    Object.assign(this, order);
  }
}
