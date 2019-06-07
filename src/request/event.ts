import { EventType } from '../constants';

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
