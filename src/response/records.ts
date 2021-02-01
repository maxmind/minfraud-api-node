import { CountryRecord, Insights, LocationRecord } from '@maxmind/geoip2-node';
import {
  CreditCardType,
  DispositionAction,
  DispositionReason,
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
   * This property is `true` if the name matches the name provided in the request
   * for the card issuer. It is `false` if the name does not match. The property
   * is `null` if either no name or no issuer ID number (IIN) was provided in the
   * request or if MaxMind does not have a name associated with the IIN.
   */
  readonly matchesProvidedName?: boolean;
  /**
   * The phone number of the bank which issued the credit card. In some cases
   * the phone number we return may be out of date.
   */
  readonly phoneNumber: string;
  /**
   * This property is `true` if the phone number matches the number provided in
   * the request for the card issuer. It is `false` if the number does not match.
   * It is `null` if either no phone number or no issuer ID number(IIN) was
   * provided in the request or if MaxMind does not have a phone number
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
   * Note that many devices cannot be uniquely identified because they are too
   * common (for example, all iPhones of a given model and OS release). In
   * these cases, the minFraud service will simply not return a UUID for that
   * device.
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
 * This object contains information about the email address domain passed in the request.
 */
export interface EmailDomain {
  /**
   * The date the email address domain was first seen by MaxMind.
   */
  readonly firstSeen: string;
}

/**
 * This object contains information about the email address passed in the request.
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
   * the city for the address.The property is `false` when the postal code is not
   * in the city. If the address was not provided or could not be parsed, the
   * property will be `null`.
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
   * This property is `true` if the address is in the IP country.The property is
   * `false` when the address is not in the IP country. If the address could not
   * be parsed or was not provided or if the IP address could not be
   * geolocated, the property will be `null`.
   */
  readonly isInIpCountry?: boolean;
}

export interface BillingAddress {
  /**
   * This property is `true` if the postal code provided with the address is in
   * the city for the address.The property is `false` when the postal code is not
   * in the city. If the address was not provided or could not be parsed, the
   * property will be `null`.
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
   * This property is `true` if the address is in the IP country.The property is
   * `false` when the address is not in the IP country. If the address could not
   * be parsed or was not provided or if the IP address could not be
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
   * current set of values are "accept", "manual_review", and "reject". If you
   * do not have custom rules set up, `null` will be returned.
   */
  readonly action: DispositionAction;
  /**
   * The reason for the action. The current possible values are "custom_rule",
   * "block_list", and "default". If you do not have custom rules set up, `null`
   * will be returned.
   */
  readonly reason: DispositionReason;
}

/**
 * This object contains subscores for many of the individual components that are
 * used to calculate the overall risk score.
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
   * and shop ID.This is only available to users sending chargeback data to
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
   * This subscore will default to 1 and will be removed in a future release.
   * The user tenure on email is reflected in the [[Subscores.emailAddress]]
   * output.
   *
   * @category Deprecated
   * @deprecated
   */
  readonly emailTenure?: number;

  /**
   * Deprecated effective August 29, 2019.
   *
   * This subscore will default to 1 and will be removed in a future release.
   * The IP tenure is reflected in the [[Score.riskScore|overall risk score]].
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
