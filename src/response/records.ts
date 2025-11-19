import { CountryRecord, Insights, LocationRecord } from '@maxmind/geoip2-node';
import {
  CreditCardType,
  DispositionAction,
  DispositionReason,
  EmailDomainClassification,
  EmailDomainVisitStatus,
} from './web-records';

/**
 * The IP addresses risk.
 */
export interface ScoreIpAddress {
  /**
   * The risk associated with the IP address. The value ranges from 0.01 to 99.
   * A higher score indicates a higher risk.
   */
  readonly risk: number;
}

/**
 * A subclass of the GeoIP2 Country model with minFraud-specific additions.
 */
export interface GeoIPCountry extends CountryRecord {
  /**
   * Deprecated effective August 29, 2019.
   *
   * @category Deprecated
   * @deprecated
   */
  isHighRisk?: boolean;
}

/**
 * A subclass of the GeoIP2 Location model with minFraud-specific additions.
 */
export interface GeoIPLocation extends LocationRecord {
  /**
   * The date and time of the transaction in the time zone associated with the
   * IP address.
   */
  localTime?: string;
}

/**
 * A reason for the IP address risk.
 */
export interface IpRiskReasons {
  /**
   * This value is a machine-readable code identifying the reason. See the web
   * service documentation for the current list of of reason codes.
   */
  readonly code?: string;
  /**
   * This property provides a human-readable explanation of the reason. The
   * description may change at any time and should not be matched against.
   */
  readonly reason?: string;
}

/**
 * Model for minFraud GeoIP2 Insights data.
 */
export interface IpAddress extends Insights {
  /**
   * Country object for the requested IP address. This record represents the
   * country where MaxMind believes the IP is located.
   */
  readonly country?: GeoIPCountry;
  /**
   * Location object for the requested IP address.
   */
  readonly location?: GeoIPLocation;
  /**
   * Gets the MaxMind record containing data related to your account
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  maxmind: any;
  /**
   * The risk associated with the IP address. The value ranges from 0.01 to 99.
   * A higher score indicates a higher risk.
   */
  risk: number;
  /**
   * An array containing risk reason objects identifying the reasons why the IP
   * address received the associated risk.
   */
  riskReasons?: IpRiskReasons[];
}

/**
 * Model for the credit card issuer data from minFraud.
 */
export interface CreditCardIssuer {
  /**
   * The name of the bank which issued the credit card.
   */
  readonly name: string;
  /**
   * This property is `true` if the name matches the name provided in the
   * request for the card issuer. It is `false` if the name does not match. The
   * property is `null` if either no name or no issuer ID number (IIN) was
   * provided in the request or if MaxMind does not have a name associated with
   * the IIN.
   */
  readonly matchesProvidedName?: boolean;
  /**
   * The phone number of the bank which issued the credit card. In some cases
   * the phone number we return may be out of date.
   */
  readonly phoneNumber: string;
  /**
   * This property is `true` if the phone number matches the number provided in
   * the request for the card issuer. It is `false` if the number does not
   * match. It is `null` if either no phone number or no issuer ID number (IIN)
   * was provided in the request or if MaxMind does not have a phone number
   * associated with the IIN.
   */
  readonly matchesProvidedPhoneNumber?: boolean;
}

/**
 * Information about the credit card based on the issuer ID number.
 */
export interface CreditCardRecord {
  /**
   * An object containing information about the credit card issuer.
   */
  readonly issuer: CreditCardIssuer;
  /**
   * The credit card brand.
   */
  readonly brand: string;
  /**
   * The two letter ISO 3166-1 alpha-2 country code associated with the
   * location of the majority of customers using this credit card as determined
   * by their billing address. In cases where the location of customers is
   * highly mixed, this defaults to the country of the bank issuing the card.
   */
  readonly country: string;
  /**
   * This property is `true` if the card is a business card.
   */
  readonly isBusiness?: boolean;
  /**
   * This field is `true` if the country of the billing address matches the
   * country of the majority of customers using that IIN. In cases where the
   * location of customers is highly mixed, the match is to the country of the
   * bank issuing the card.
   */
  readonly isIssuedInBillingAddressCountry?: boolean;
  /**
   * This property is `true` if the card is a prepaid card.
   */
  readonly isPrepaid?: boolean;
  /**
   * This property is `true` if the card is a virtual card.
   */
  readonly isVirtual?: boolean;
  /**
   * The credit card type.
   */
  readonly type: CreditCardType;
}

/**
 * This object contains information about the device that MaxMind believes is
 * associated with the IP address passed in the request. In order to receive
 * device output from minFraud Insights or minFraud Factors, you must be using
 * the Device Tracking Add-on.
 */
export interface Device {
  /**
   * A number representing the confidence that the `deviceId` refers to a unique
   * device as opposed to a cluster of similar devices. A confidence of 0.01
   * indicates very low confidence that the device is unique, whereas 99
   * indicates very high confidence.
   */
  readonly confidence: number;
  /**
   * A UUID that MaxMind uses for the device associated with this IP address.
   */
  readonly id?: string;
  /**
   * The date and time of the last sighting of the device.
   */
  readonly lastSeen: string;
  /**
   * The local date and time of the transaction in the time zone of the device.
   * This is determined by using the UTC offset associated with the device.
   * This is an RFC 3339 date-time
   */
  readonly localTime: string;
}

/**
 * Status of an automated visit to the email domain. This object is only
 * available for low-volume domains. High-volume domains (email providers,
 * large businesses) will not include visit data.
 */
export interface EmailDomainVisit {
  /**
   * Indicates if the domain redirects to another URL.
   */
  readonly hasRedirect: boolean;
  /**
   * The date the automated visit was completed, in ISO 8601 format (YYYY-MM-DD).
   */
  readonly lastVisitedOn: string;
  /**
   * Classification of the domain based on the automated visit.
   * Possible values include: `live`, `dns_error`, `network_error`,
   * `http_error`, `parked`, `pre_development`.
   */
  readonly status: EmailDomainVisitStatus;
}

/**
 * This object contains information about the email address domain passed in the
 * request.
 */
export interface EmailDomain {
  /**
   * Classification of the email domain type. Possible values include:
   * `business`, `education`, `government`, `isp_email`.
   * Additional values may be added in the future.
   */
  readonly classification?: EmailDomainClassification;
  /**
   * The date the email address domain was first seen by MaxMind.
   */
  readonly firstSeen: string;
  /**
   * A risk score from 0.01 to 99 associated with the email domain.
   * Higher scores indicate higher risk.
   */
  readonly risk?: number;
  /**
   * Information from an automated visit to the email domain. This is only
   * available for low-volume domains and may be initially unavailable for
   * newly-sighted domains, populating later after automated visits occur.
   */
  readonly visit?: EmailDomainVisit;
  /**
   * Activity indicator for the email domain across the minFraud network,
   * expressed in sightings per million. Values range from 0.001 to 1,000,000
   * and are rounded to 2 significant figures.
   */
  readonly volume?: number;
}

/**
 * This object contains information about the email address passed in the
 * request.
 */
export interface Email {
  /**
   * An object containing information about the email address domain.
   */
  readonly domain: EmailDomain;
  /**
   * The date the email address was first seen by MaxMind.
   */
  readonly firstSeen: string;
  /**
   * This property incidates whether the email is from a disposable email
   * provider. The value will be `null` if no email address or email domain was
   * passed as an input.
   */
  readonly isDisposable?: boolean;
  /**
   * This property is true if MaxMind believes that this email is hosted by a
   * free email provider such as Gmail or Yahoo! Mail.
   */
  readonly isFree?: boolean;
  /**
   * This property is true if MaxMind believes that this email is likely to be
   * used for fraud. Note that this is also factored into the overall
   * risk_score in the response as well.
   */
  readonly isHighRisk?: boolean;
}

/**
 * This object contains information about the billing or shipping phone passed
 * in the request.
 */
export interface Phone {
  /**
   * A two-character ISO 3166-1 country code for the country associated with
   * the phone number.
   */
  readonly country: string;
  /**
   * This is `true` if the phone number is a Voice over Internet Protocol (VoIP)
   * number allocated by a regulator. It is `false` if the phone number is not a
   * VoIP number allocated by a regulator. The property is `null` if a valid
   * number has not been provided or we do not have data for it.
   */
  readonly isVoip?: boolean;
  /**
   * This property is `true` if the phone number's prefix is commonly
   * associated with the postal code. It is `false` if the prefix is not
   * associated with the postal code. It is non-`null` only when the phone
   * number is in the US, the number prefix is in our database, and the
   * postal code and country are provided in the request.
   */
  readonly matchesPostal?: boolean;
  /**
   * The name of the original network operator associated with the phone
   * number. This property does not reflect phone numbers that have been ported
   * from the original operator to another, nor does it identify mobile
   * virtual network operators.
   */
  readonly networkOperator: string;
  /**
   * One of the following values: `fixed` or `mobile`. Additional values may
   * be added in the future.
   */
  readonly numberType: string;
}

/**
 * Information about the shipping address.
 */
export interface ShippingAddress {
  /**
   * This property is `true` if the shipping address is in the IP country. The
   * property is `false` when the address is not in the IP country. If the
   * shipping address could not be parsed or was not provided or the IP address
   * could not be geolocated, then the property is `null`.
   */
  readonly isHighRisk: boolean;
  /**
   * This property is `true` if the postal code provided with the address is in
   * the city for the address. The property is `false` when the postal code is
   * not in the city. If the address was not provided or could not be parsed,
   * the property will be `null`.
   */
  readonly isPostalInCity?: boolean;
  /**
   * The latitude associated with the address.
   */
  readonly latitude: number;
  /**
   * The longitude associated with the address.
   */
  readonly longitude: number;
  /**
   * The distance in kilometers from the address to the IP location.
   */
  readonly distanceToIpLocation: number;
  /**
   * The distance in kilometers from the shipping address to billing address.
   */
  readonly distanceToBillingAddress: number;
  /**
   * This property is `true` if the address is in the IP country. The property
   * is `false` when the address is not in the IP country. If the address could
   * not be parsed or was not provided or if the IP address could not be
   * geolocated, the property will be `null`.
   */
  readonly isInIpCountry?: boolean;
}

export interface BillingAddress {
  /**
   * This property is `true` if the postal code provided with the address is in
   * the city for the address. The property is `false` when the postal code is
   * not in the city. If the address was not provided or could not be parsed,
   * the property will be `null`.
   */
  readonly isPostalInCity?: boolean;
  /**
   * The latitude associated with the address.
   */
  readonly latitude: number;
  /**
   * The longitude associated with the address.
   */
  readonly longitude: number;
  /**
   * The distance in kilometers from the address to the IP location.
   */
  readonly distanceToIpLocation: number;
  /**
   * This property is `true` if the address is in the IP country. The property
   * is `false` when the address is not in the IP country. If the address could
   * not be parsed or was not provided or if the IP address could not be
   * geolocated, the property will be `null`.
   */
  readonly isInIpCountry?: boolean;
}

/**
 * This object contains the disposition set by custom rules.
 */
export interface Disposition {
  /**
   * The action to take on the transaction as defined by your custom rules. The
   * current set of values are "accept", "manual_review", "reject", and "test".
   * If you do not have custom rules set up, `null` will be returned.
   */
  readonly action: DispositionAction;
  /**
   * The reason for the action. The current possible values are "custom_rule"
   * and "default". If you do not have custom rules set up, `null` will be
   * returned.
   */
  readonly reason: DispositionReason;
  /**
   * The label of the custom rule that was triggered. If you do not have custom
   * rules set up, the triggered custom rule does not have a label, or no custom
   * rule was triggered, `null` will be returned.
   */
  readonly ruleLabel?: string;
}

/**
 * The risk score reason for the multiplier.
 *
 * This class provides both a machine-readable code and a human-readable
 * explanation of the reason for the risk score. See
 * {@link https://dev.maxmind.com/minfraud/api-documentation/responses/#schema--response--risk-score-reason--multiplier-reason | the response API documentation}.
 *
 * Although more codes may be added in the future, the current codes are:
 *
 * * `BROWSER_LANGUAGE` - Riskiness of the browser user-agent and language
 *   associated with the request.
 * * `BUSINESS_ACTIVITY` - Riskiness of business activity associated with the
 *   request.
 * * `COUNTRY` - Riskiness of the country associated with the request.
 * * `CUSTOMER_ID` - Riskiness of a customer's activity.
 * * `EMAIL_DOMAIN` - Riskiness of email domain.
 * * `EMAIL_DOMAIN_NEW` - Riskiness of newly-sighted email domain.
 * * `EMAIL_ADDRESS_NEW` - Riskiness of newly-sighted email address.
 * * `EMAIL_LOCAL_PART` - Riskiness of the local part of the email address.
 * * `EMAIL_VELOCITY` - Velocity on email - many requests on same email over
 *   short period of time.
 * * `ISSUER_ID_NUMBER_COUNTRY_MISMATCH` - Riskiness of the country mismatch
 *   between IP, billing, shipping and IIN country.
 * * `ISSUER_ID_NUMBER_ON_SHOP_ID` - Risk of Issuer ID Number for the shop ID.
 * * `ISSUER_ID_NUMBER_LAST_DIGITS_ACTIVITY` - Riskiness of many recent
 *   requests and previous high-risk requests on the IIN and last digits of the
 *   credit card.
 * * `ISSUER_ID_NUMBER_SHOP_ID_VELOCITY` - Risk of recent Issuer ID Number
 *   activity for the shop ID.
 * * `INTRACOUNTRY_DISTANCE` - Risk of distance between IP, billing, and
 *   shipping location.
 * * `ANONYMOUS_IP` - Risk due to IP being an Anonymous IP.
 * * `IP_BILLING_POSTAL_VELOCITY` - Velocity of distinct billing postal code on
 *   IP address.
 * * `IP_EMAIL_VELOCITY` - Velocity of distinct email address on IP address.
 * * `IP_HIGH_RISK_DEVICE` - High-risk device sighted on IP address.
 * * `IP_ISSUER_ID_NUMBER_VELOCITY` - Velocity of distinct IIN on IP address.
 * * `IP_ACTIVITY` - Riskiness of IP based on minFraud network activity.
 * * `LANGUAGE` - Riskiness of browser language.
 * * `MAX_RECENT_EMAIL` - Riskiness of email address based on past minFraud
 *   risk scores on email.
 * * `MAX_RECENT_PHONE` - Riskiness of phone number based on past minFraud risk
 *   scores on phone.
 * * `MAX_RECENT_SHIP` - Riskiness of email address based on past minFraud risk
 *   scores on ship address.
 * * `MULTIPLE_CUSTOMER_ID_ON_EMAIL` - Riskiness of email address having many
 *   customer IDs.
 * * `ORDER_AMOUNT` - Riskiness of the order amount.
 * * `ORG_DISTANCE_RISK` - Risk of ISP and distance between billing address and
 *   IP location.
 * * `PHONE` - Riskiness of the phone number or related numbers.
 * * `CART` - Riskiness of shopping cart contents.
 * * `TIME_OF_DAY` - Risk due to local time of day.
 * * `TRANSACTION_REPORT_EMAIL` - Risk due to transaction reports on the email
 *   address.
 * * `TRANSACTION_REPORT_IP` - Risk due to transaction reports on the IP
 *   address.
 * * `TRANSACTION_REPORT_PHONE` - Risk due to transaction reports on the phone
 *   number.
 * * `TRANSACTION_REPORT_SHIP` - Risk due to transaction reports on the
 *   shipping address.
 * * `EMAIL_ACTIVITY` - Riskiness of the email address based on minFraud
 *   network activity.
 * * `PHONE_ACTIVITY` - Riskiness of the phone number based on minFraud network
 *   activity.
 * * `SHIP_ACTIVITY` - Riskiness of ship address based on minFraud network
 *   activity.
 */
export interface Reason {
  /**
   * A machine-readable code identifying the reason.
   */
  code: string;
  /**
   * A human-readable explanation of the reason. The description may change at
   * any time and should not be matched against.
   */
  reason: string;
}

/**
 * The object describing the risk score multiplier and the reasons for that
 * multiplier.
 */
export interface RiskScoreReason {
  /**
   * The factor by which the risk score is increased (if the value is greater
   * than 1) or decreased (if the value is less than 1) for given risk
   * reason(s).
   * Multipliers greater than 1.5 and less than 0.66 are considered significant
   * and lead to risk reason(s) being present.
   */
  multiplier: number;
  /**
   * An array containing Reason objects that describe one of the reasons for
   * the multiplier.
   */
  reasons: Reason[];
}

/**
 * This object contains scores for many of the individual risk factors that
 * are used to calculate the overall risk score.
 *
 * @deprecated replaced by {@link RiskScoreReason}.
 */
export interface Subscores {
  /**
   * The risk associated with the AVS result. If present, this is a value in
   * the range 0.01 to 99.
   */
  readonly avsResult?: number;
  /**
   * The risk associated with the billing address. If present, this is a value
   * in the range 0.01 to 99.
   */
  readonly billingAddress?: number;
  /**
   * The risk associated with the distance between the billing address and the
   * location for the given IP address. If present, this is a value in the
   * range 0.01 to 99.
   */
  readonly billingAddressDistanceToIpLocation?: number;
  /**
   * The risk associated with the browser attributes such as the User-Agent and
   * Accept-Language. If present, this is a value in the range 0.01 to 99.
   */
  readonly browser?: number;
  /**
   * Individualized risk of chargeback for the given IP address on your account
   * and shop ID. This is only available to users sending chargeback data to
   * MaxMind. If present, this is a value in the range 0.01 to 99.
   */
  readonly chargeback?: number;
  /**
   * The risk associated with the country the transaction originated from. If
   * present, this is a value in the range 0.01 to 99.
   */
  readonly country?: number;
  /**
   * The risk associated with the combination of IP country, card issuer
   * country, billing country, and shipping country. If present, this is a
   * value in the range 0.01 to 99.
   */
  readonly countryMismatch?: number;
  /**
   * The risk associated with the CVV result. If present, this is a value in
   * the range 0.01 to 99.
   */
  readonly cvvResult?: number;
  /**
   * The risk associated with the device. If present, this is a value in the
   * range 0.01 to 99.
   */
  readonly device?: number;
  /**
   * The risk associated with the particular email address. If present, this is
   * a value in the range 0.01 to 99.
   */
  readonly emailAddress?: number;
  /**
   * The general risk associated with the email domain. If present, this is a
   * value in the range 0.01 to 99.
   */
  readonly emailDomain?: number;
  /**
   * The risk associated with the email address local part (the part of the
   * email address before the @ symbol). If present, this is a value in the
   * range 0.01 to 99.
   */
  readonly emailLocalPart?: number;
  /**
   * The risk associated with the particular issuer ID number (IIN) given the
   * billing location and the history of usage of the IIN on your account and
   * shop ID. If present, this is a value in the range 0.01 to 99.
   */
  readonly issuerIdNumber?: number;
  /**
   * The risk associated with the particular order amount for your account and
   * shop ID. If present, this is a value in the range 0.01 to 99.
   */
  readonly orderAmount?: number;
  /**
   * The risk associated with the particular phone number. If present, this is
   * a value in the range 0.01 to 99.
   */
  readonly phoneNumber?: number;
  /**
   * The risk associated with the shipping address. If present, this is a
   * value in the range 0.01 to 99.
   */
  readonly shippingAddress?: number;
  /**
   * The risk associated with the distance between the shipping address and the
   * location for the given IP address. If present, this is a value in the
   * range 0.01 to 99.
   */
  readonly shippingAddressDistanceToIpLocation?: number;
  /**
   * The risk associated with the local time of day of the transaction in the
   * IP address location. If present, this is a value in the range 0.01 to 99.
   */
  readonly timeOfDay?: number;

  /**
   * Deprecated effective August 29, 2019.
   *
   * This risk factor score will default to 1 and will be removed in a future
   * release. The user tenure on email is reflected in the
   * [[Subscores.emailAddress]] output.
   *
   * @category Deprecated
   * @deprecated
   */
  readonly emailTenure?: number;

  /**
   * Deprecated effective August 29, 2019.
   *
   * This risk factor score will default to 1 and will be removed in a future
   * release. The IP tenure is reflected in the
   * [[Score.riskScore|overall risk score]].
   *
   * @category Deprecated
   * @deprecated
   */
  readonly ipTenure?: number;
}

/**
 * A warning returned by the web service.
 */
export interface Warning {
  /**
   * This value is a machine-readable code identifying the warning. See the web
   * service documentation for the current list of of warning codes.
   */
  readonly code: string;
  /**
   * This property provides a human-readable explanation of the warning. The
   * description may change at any time and should not be matched against.
   */
  readonly warning: string;
  /**
   * A JSON Pointer to the input field that the warning is associated with. For
   * instance, if the warning was about the billing city, this would be
   * `/billing/city`. If it was for the price in the second shopping cart item,
   * it would be `/shopping_cart/1/price`.
   */
  readonly inputPointer: string;
}
