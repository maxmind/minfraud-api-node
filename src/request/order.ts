import isURL = require('validator/lib/isURL');
import { ArgumentError } from '../errors';

interface OrderProps {
  amount?: number;
  currency?: string;
  discountCode?: string;
  affiliateId?: string;
  subaffiliateId?: string;
  referrerUri?: string;
  isGift?: boolean;
  hasGiftMessage?: boolean;
}

const currencyRegex = /^[A-Z]{3}$/;

export default class Order implements OrderProps {
  public amount?: number;
  public currency?: string;
  public discountCode?: string;
  public affiliateId?: string;
  public subaffiliateId?: string;
  public referrerUri?: string;
  public isGift?: boolean;
  public hasGiftMessage?: boolean;

  public constructor(order: OrderProps) {
    if (order.currency != null && !currencyRegex.test(order.currency)) {
      throw new ArgumentError(`The currency code ${order.currency} is invalid`);
    }

    if (order.referrerUri != null && !isURL(order.referrerUri)) {
      throw new ArgumentError(
        `The referrer URI ${order.referrerUri} is invalid`
      );
    }

    Object.assign(this, order);
  }
}
