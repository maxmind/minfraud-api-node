import { camelizeResponse } from '../../utils';
import * as records from '../records';
import * as webRecords from '../web-records';
import Insights from './insights';

export default class Factors extends Insights {
  /**
   * An object containing GeoIP2 and minFraud Insights information about the IP
   * address.
   */
  public readonly subscores: records.Subscores;

  public constructor(response: webRecords.FactorsResponse) {
    super(response);

    this.subscores = camelizeResponse(response.subscores) as records.Subscores;
  }
}
