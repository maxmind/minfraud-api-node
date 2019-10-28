import { Insights as GeoInsights } from '@maxmind/geoip2-node';
import { camelizeResponse } from '../../utils';
import * as records from '../records';
import * as webRecords from '../web-records';
import Score from './score';

export default class Insights extends Score {
  public readonly billingAddress?: records.BillingAddress;
  public readonly creditCard?: records.CreditCard;
  public readonly device?: records.Device;
  public readonly email?: records.Email;
  public readonly ipAddress: records.IpAddress;
  public readonly shippingAddress?: records.ShippingAddress;

  public constructor(response: webRecords.InsightsResponse) {
    super(response);

    this.billingAddress = this.maybeGet<records.BillingAddress>(
      response,
      'billing_address'
    );
    this.creditCard = this.maybeGet<records.CreditCard>(
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
  }

  private maybeGet<T>(
    response: webRecords.InsightsResponse,
    prop: keyof webRecords.InsightsResponse
  ): T | undefined {
    return response[prop]
      ? ((camelizeResponse(response[prop]) as unknown) as T)
      : undefined;
  }

  private getIpAddress(
    response: webRecords.InsightsResponse
  ): records.IpAddress {
    const insights = new GeoInsights(response.ip_address) as records.IpAddress;

    insights.country.isHighRisk = response.ip_address.country
      ? response.ip_address.country.is_high_risk
      : undefined;

    insights.location.localTime = response.ip_address.location
      ? response.ip_address.location.local_time
      : undefined;

    insights.risk = response.ip_address.risk;

    delete insights.maxmind;

    return insights;
  }
}
