import { Tag } from '../constants';
import { ArgumentError } from '../errors';
import TransactionReport from './transaction-report';

describe('Device()', () => {
  it('throws an error if TransactionReport.ipAddress is not valid', () => {
    const report = () =>
      new TransactionReport({
        ipAddress: 'foo',
        tag: Tag.CHARGEBACK,
      });
    expect(report).toThrowError(ArgumentError);
    expect(report).toThrowError('transactionReport.ipAddress');
  });

  it('throws an error if TransactionReport.tag is not valid', () => {
    const report = () =>
      new TransactionReport({
        ipAddress: '1.1.1.1',
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        tag: 'foobar',
      });
    expect(report).toThrowError(ArgumentError);
    expect(report).toThrowError('transactionReport.tag');
  });

  it('constructs with ipAddress', () => {
    expect(() => {
      new TransactionReport({
        ipAddress: '1.1.1.1',
        tag: Tag.CHARGEBACK,
      });
    }).not.toThrow();
  });

  it('constructs with maxmindId', () => {
    expect(() => {
      new TransactionReport({
        maxmindId: '12345678',
        tag: Tag.CHARGEBACK,
      });
    }).not.toThrow();
  });

  it('constructs with minfraudId', () => {
    expect(() => {
      new TransactionReport({
        minfraudId: '58fa38d8-4b87-458b-a22b-f00eda1aa20',
        tag: Tag.CHARGEBACK,
      });
    }).not.toThrow();
  });

  it('constructs with transactionId', () => {
    expect(() => {
      new TransactionReport({
        minfraudId: 'abc123',
        tag: Tag.CHARGEBACK,
      });
    }).not.toThrow();
  });
});
