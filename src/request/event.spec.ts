import { describe, expect, it, vi } from 'vitest';
import Event from './event.js';
import { EventParty, EventType } from '../constants.js';
import { ArgumentError } from '../errors.js';

describe('Event()', () => {
  it('sets `time` to now by default', () => {
    const mockDate = new Date('2019-05-29T17:12:28.123Z');

    vi.spyOn(global.Date, 'now').mockImplementationOnce(() =>
      mockDate.valueOf()
    );

    const event = new Event({
      transactionId: 'foobar',
    });

    expect(event.time).toEqual(mockDate);
  });

  it('keeps a valid `time`', () => {
    const time = new Date('2026-10-01T14:30:00Z');
    const event = new Event({ time });

    expect(event.time).toEqual(time);
  });

  it.each([
    ['an invalid Date', new Date('not a date')],
    ['a string', '2026-10-01T14:30:00Z'],
  ])('throws an ArgumentError if `time` is %s', (_, value) => {
    const test = () => new Event({ time: value as unknown as Date });
    expect(test).toThrow(ArgumentError);
    expect(test).toThrow('event.time');
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

  it('accepts agent party', () => {
    const event = new Event({
      party: EventParty.Agent,
    });

    expect(event.party).toEqual(EventParty.Agent);
  });

  it('accepts customer party', () => {
    const event = new Event({
      party: EventParty.Customer,
    });

    expect(event.party).toEqual(EventParty.Customer);
  });
});
