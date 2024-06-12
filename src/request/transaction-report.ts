import { isIP } from 'net';
import snakecaseKeys from 'snakecase-keys';
import { Tag } from '../constants';
import { ArgumentError } from '../errors';

interface TransactionReportProps {
  /**
   * A string which is provided by your payment processor indicating the
   * reason for the chargeback.
   */
  chargebackCode?: string;
  /**
   * The IP address of the customer placing the order. This field is not
   * required if you provide at least one of the transaction's minfraudId,
   * maxmindId, or transactionId. You are encouraged to provide it, if
   * possible.
   */
  ipAddress?: string;
  /**
   * A unique eight character string identifying a minFraud Standard or
   * Premium request. These IDs are returned in the maxmindID field of a
   * response for a successful minFraud request. This field is not required,
   * but you are encouraged to provide it, if possible.
   */
  maxmindId?: string;
  /**
   * A UUID that identifies a minFraud Score, minFraud Insights, or minFraud
   * Factors request. This ID is returned at /id in the response. This field
   * is not required if you provide at least one of the transaction's ipAddress,
   * minfraudId, or transactionId. You are encouraged to provide
   * it, if possible.
   */
  minfraudId?: string;
  /**
   * Your notes on the fraud tag associated with the transaction. We manually
   * review many reported transactions to improve our scoring for you so any
   * additional details to help us understand context are helpful.
   */
  notes?: string;
  /**
   * A Tag enum indicating the likelihood that a transaction may be
   * fraudulent.
   */
  tag: Tag;
  /**
   * The transaction ID you originally passed to minFraud. This field is not
   * required if you provide at least one of the transaction's ipAddress,
   * minfraudId, or maxmindId. You are encouraged to provide it, if possible.
   */
  transactionId?: string;
}

export default class TransactionReport {
  /** @inheritDoc TransactionReportProps.chargebackCode */
  public chargebackCode?: string;
  /** @inheritDoc TransactionReportProps.ipAddress */
  public ipAddress?: string;
  /** @inheritDoc TransactionReportProps.maxmindId */
  public maxmindId?: string;
  /** @inheritDoc TransactionReportProps.minfraudId */
  public minfraudId?: string;
  /** @inheritDoc TransactionReportProps.notes */
  public notes?: string;
  /** @inheritDoc TransactionReportProps.tag */
  public tag: Tag;
  /** @inheritDoc TransactionReportProps.transactionId */
  public transactionId?: string;

  public constructor(transactionReport: TransactionReportProps) {
    // Check if at least one identifier field is set
    if (
      !transactionReport.ipAddress &&
      !transactionReport.maxmindId &&
      !transactionReport.minfraudId &&
      !transactionReport.transactionId
    ) {
      throw new ArgumentError(
        'The report must contain at least one of the following fields: `ipAddress`, `maxmindId`, `minfraudId`, `transactionId`.'
      );
    }

    if (transactionReport.ipAddress) {
      if (isIP(transactionReport.ipAddress) === 0) {
        throw new ArgumentError(
          '`transactionReport.ipAddress` is an invalid IP address'
        );
      }
    }

    if (
      !transactionReport.tag ||
      !Object.values(Tag).includes(transactionReport.tag)
    ) {
      throw new ArgumentError(
        `"${transactionReport.tag}" is an invalid value for "transactionReport.tag"`
      );
    }

    this.ipAddress = transactionReport.ipAddress;
    this.tag = transactionReport.tag;
    Object.assign(this, transactionReport);
  }

  public toString(): string {
    return JSON.stringify(snakecaseKeys(this as Record<string, unknown>));
  }
}
