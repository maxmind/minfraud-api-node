import { camelizeResponse } from '../../utils';
import * as records from '../records';
import * as webRecords from '../web-records';

export default class Score {
  public readonly disposition?: records.Disposition;
  public readonly fundsRemaining: number;
  public readonly id: string;
  public readonly ipAddress: records.ScoreIpAddress;
  public readonly queriesRemaining: number;
  public readonly riskScore: number;
  public readonly warnings?: records.Warning[];

  public constructor(response: webRecords.ScoreResponse) {
    this.disposition = response.disposition as records.Disposition;
    this.fundsRemaining = response.funds_remaining;
    this.id = response.id;
    this.ipAddress = response.ip_address;
    this.queriesRemaining = response.queries_remaining;
    this.riskScore = response.risk_score;
    this.warnings = response.warnings
      ? camelizeResponse(response.warnings)
      : undefined;
  }
}
