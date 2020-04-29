import { EventType } from '../constants';

interface EventProps {
  /**
   * Your internal ID for the transaction. We can use this to locate a specific
   * transaction in our logs, and it will also show up in email alerts and
   * notifications from us to you.
   */
  transactionId?: string;
  /**
   * Your internal ID for the shop, affiliate, or merchant this order is coming
   * from. Required for minFraud users who are resellers, payment providers,
   * gateways and affiliate networks.
   */
  shopId?: string;
  /**
   * The date and time the event occurred.
   */
  time?: Date;
  /**
   * The type of event being scored.
   */
  type?: EventType;
}

/**
 * Event information for the transaction being sent to the web service.
 */
export default class Event implements EventProps {
  /** @inheritDoc EventProps.transactionId */
  public transactionId?: string;
  /** @inheritDoc EventProps.shopId */
  public shopId?: string;
  /** @inheritDoc EventProps.time */
  public time?: Date;
  /** @inheritDoc EventProps.EventType */
  public type?: EventType;

  public constructor(minfraudEvent: EventProps) {
    Object.assign(this, minfraudEvent);

    if (!this.time) {
      this.time = new Date(Date.now());
    }
  }
}
