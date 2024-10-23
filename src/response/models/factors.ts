import { camelizeResponse } from '../../utils';
import * as records from '../records';
import * as webRecords from '../web-records';
import Insights from './insights';

export default class Factors extends Insights {
  /**
   * An array of risk score reason objects that describe a risk score
   * multiplier and the reasons for that multiplier.
   */
  public readonly riskScoreReasons?: records.RiskScoreReason[];

  /**
   * An object containing GeoIP2 and minFraud Insights information about the IP
   * address.
   *
   * @deprecated replaced by {@link riskScoreReasons}.
   */
  public readonly subscores: records.Subscores;

  public constructor(response: webRecords.FactorsResponse) {
    super(response);

    this.riskScoreReasons = response.risk_score_reasons;
    this.subscores = camelizeResponse(response.subscores) as records.Subscores;
  }
}
