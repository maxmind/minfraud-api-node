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

  it('constructs', () => {
    expect(() => {
      new TransactionReport({
        ipAddress: '1.1.1.1',
        tag: Tag.CHARGEBACK,
      });
    }).not.toThrow();
  });
});
