import Event from './event';
import { EventType } from '../constants';

describe('Event()', () => {
  it('sets `time` to now by default', () => {
    const mockDate = new Date('2019-05-29T17:12:28.123Z');

    jest
      .spyOn(global.Date, 'now')
      .mockImplementationOnce(() => mockDate.valueOf());

    const event = new Event({
      transactionId: 'foobar',
    });

    expect(event.time).toEqual(mockDate);
  });

  it('accepts credit_application event type', () => {
    const event = new Event({
      type: EventType.CreditApplication,
    });

    expect(event.type).toEqual(EventType.CreditApplication);
  });

  it('accepts fund_transfer event type', () => {
    const event = new Event({
      type: EventType.FundTransfer,
    });

    expect(event.type).toEqual(EventType.FundTransfer);
  });
});
