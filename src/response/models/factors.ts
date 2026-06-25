import { camelcaseKeys } from '../../utils.js';
import * as records from '../records.js';
import * as webRecords from '../web-records.js';
import Insights from './insights.js';

export default class Factors extends Insights {
  /**
   * An array of risk score reason objects that describe a risk score
   * multiplier and the reasons for that multiplier.
   */
  public readonly riskScoreReasons?: records.RiskScoreReason[];

  /**
   * An object containing GeoIP and minFraud Insights information about the IP
   * address.
   *
   * @deprecated replaced by {@link riskScoreReasons}.
   */
  public readonly subscores: records.Subscores;

  public constructor(response: webRecords.FactorsResponse) {
    super(response);

    this.riskScoreReasons = response.risk_score_reasons;
    this.subscores = camelcaseKeys(response.subscores) as records.Subscores;
  }
}
