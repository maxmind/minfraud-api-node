import { isIP } from 'node:net';
import { ArgumentError } from '../errors.js';

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

    if (order.referrerUri != null) {
      let parsed: URL;
      try {
        // The URL constructor throws for non-absolute or otherwise invalid URLs.
        parsed = new URL(order.referrerUri.toString());
      } catch {
        throw new ArgumentError(
          `The referrer URI ${order.referrerUri.toString()} is invalid`
        );
      }
      // Only http(s) referrers are meaningful; reject other schemes (e.g.
      // javascript:, data:, mailto:) and single-label hosts (e.g. http://foo)
      // the way the former validator.isURL did by default. IP literals
      // (e.g. http://192.0.2.1, https://[2001:db8::1]) are valid hosts even
      // though an IPv6 literal contains no dot, so exempt them.
      const host = parsed.hostname.replace(/^\[|\]$/g, '');
      const isIpLiteral = isIP(host) !== 0;
      if (
        (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') ||
        (!isIpLiteral && !parsed.hostname.includes('.'))
      ) {
        throw new ArgumentError(
          `The referrer URI ${order.referrerUri.toString()} is invalid`
        );
      }
    }

    Object.assign(this, order);
  }
}
