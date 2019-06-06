import { URL } from 'url';
import * as isURL from 'validator/lib/isURL';
import { ArgumentError } from '../errors';

interface OrderProps {
  amount?: number;
  currency?: string;
  discountCode?: string;
  affiliateId?: string;
  subaffiliateId?: string;
  referrerUri?: URL;
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
  public referrerUri?: URL;
  public isGift?: boolean;
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
