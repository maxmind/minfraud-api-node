import Event from './event';

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
});
