import { camelizeResponse } from '../../utils';
import * as records from '../records';
import * as webRecords from '../web-records';

export default class Score {
  /**
   * This object contains information about the disposition set by custom rules.
   */
  public readonly disposition?: records.Disposition;
  /**
   * The approximate US dollar value of the funds remaining on your MaxMind account.
   */
  public readonly fundsRemaining: number;
  /**
   * This is a UUID that identifies the minFraud request. Please use this ID in
   * support requests to MaxMind so that we can easily identify a particular
   * request.
   */
  public readonly id: string;
  /**
   * An object containing information about the IP address's risk.
   */
  public readonly ipAddress?: records.ScoreIpAddress;
  /**
   * The approximate number of queries remaining for this service before your
   * account runs out of funds.
   */
  public readonly queriesRemaining: number;
  /**
   * This property contains the risk score, from 0.01 to 99. A higher score
   * indicates a higher risk of fraud.For example, a score of 20 indicates a
   * 20% chance that a transaction is fraudulent.We never return a risk score
   * of 0, since all transactions have the possibility of being
   * fraudulent.Likewise we never return a risk score of 100.
   */
  public readonly riskScore: number;
  /**
   * This list contains objects detailing issues with the request that was sent
   * such as invalid or unknown inputs. It is highly recommended that you check
   * this array for issues when integrating the web service.
   */
  public readonly warnings?: records.Warning[];

  public constructor(response: webRecords.ScoreResponse) {
    this.disposition = camelizeResponse(
      response.disposition
    ) as records.Disposition;
    this.fundsRemaining = response.funds_remaining;
    this.id = response.id;
    this.ipAddress = response.ip_address;
    this.queriesRemaining = response.queries_remaining;
    this.riskScore = response.risk_score;
    this.warnings = response.warnings
      ? (camelizeResponse(response.warnings) as records.Warning[])
      : undefined;
  }
}
