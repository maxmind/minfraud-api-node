type EventType =
  | 'account_creation'
  | 'account_login'
  | 'email_change'
  | 'password_reset'
  | 'payout_change'
  | 'purchase'
  | 'recurring_purchase'
  | 'referral'
  | 'survey';

interface EventProps {
  transactionId?: string;
  shopId?: string;
  time?: Date;
  type?: EventType;
}

export default class Event implements EventProps {
  public transactionId?: string;
  public shopId?: string;
  public time?: Date;
  public type?: EventType;

  public constructor(minfraudEvent: EventProps) {
    Object.assign(this, minfraudEvent);

    if (!this.time) {
      this.time = new Date(Date.now());
    }
  }
}
