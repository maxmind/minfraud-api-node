import { Insights as GeoInsights } from '@maxmind/geoip2-node';
import { camelizeResponse } from '../../utils';
import * as records from '../records';
import * as webRecords from '../web-records';
import Score from './score';

export default class Insights extends Score {
  /**
   * An object containing minFraud data related to the billing address used in
   * the transaction.
   */
  public readonly billingAddress?: records.BillingAddress;
  /**
   * An object containing minFraud data related to the billing phone used in
   * the transaction.
   */
  public readonly billingPhone?: records.Phone;
  /**
   * An object containing minFraud data about the credit card used in the
   * transaction.
   */
  public readonly creditCard?: records.CreditCardRecord;
  /**
   * This object contains information about the device that MaxMind believes is
   * associated with the IP address passed in the request.
   */
  public readonly device?: records.Device;
  /**
   * This object contains information about the email address passed in the
   * request.
   */
  public readonly email?: records.Email;
  /**
   * An object containing GeoIP2 and minFraud Insights information about the IP address.
   */
  public readonly ipAddress?: records.IpAddress;
  /**
   * An object containing minFraud data related to the shipping address used in the transaction.
   */
  public readonly shippingAddress?: records.ShippingAddress;
  /**
   * An object containing minFraud data related to the shipping phone used in
   * the transaction.
   */
  public readonly shippingPhone?: records.Phone;

  public constructor(response: webRecords.InsightsResponse) {
    super(response);

    this.billingAddress = this.maybeGet<records.BillingAddress>(
      response,
      'billing_address'
    );
    this.billingPhone = this.maybeGet<records.Phone>(response, 'billing_phone');
    this.creditCard = this.maybeGet<records.CreditCardRecord>(
      response,
      'credit_card'
    );
    this.device = this.maybeGet<records.Device>(response, 'device');
    this.email = this.maybeGet<records.Email>(response, 'email');
    this.ipAddress = this.getIpAddress(response);
    this.shippingAddress = this.maybeGet<records.ShippingAddress>(
      response,
      'shipping_address'
    );
    this.shippingPhone = this.maybeGet<records.Phone>(
      response,
      'shipping_phone'
    );
  }

  private maybeGet<T>(
    response: webRecords.InsightsResponse,
    prop: keyof webRecords.InsightsResponse
  ): T | undefined {
    return response[prop] ? (camelizeResponse(response[prop]) as T) : undefined;
  }

  private getIpAddress(
    response: webRecords.InsightsResponse
  ): records.IpAddress | undefined {
    if (!response.ip_address) {
      return undefined;
    }

    const insights = new GeoInsights(response.ip_address) as records.IpAddress;

    if (insights.country && response.ip_address.country) {
      insights.country.isHighRisk = response.ip_address.country.is_high_risk;
    }

    if (insights.location && response.ip_address.location) {
      insights.location.localTime = response.ip_address.location.local_time;
    }

    insights.risk = response.ip_address.risk;

    insights.riskReasons = response.ip_address
      .risk_reasons as records.IpRiskReasons[];

    delete insights.maxmind;

    return insights;
  }
}
