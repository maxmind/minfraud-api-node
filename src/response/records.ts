import { CountryRecord, Insights, LocationRecord } from '@maxmind/geoip2-node';
import {
  CreditCardType,
  DispositionAction,
  DispositionReason,
} from './web-records';

export interface ScoreIpAddress {
  readonly risk: number;
}

export interface GeoIPCountry extends CountryRecord {
  isHighRisk: boolean;
}

export interface GeoIPLocation extends LocationRecord {
  localTime: string;
}

export interface IpAddress extends Insights {
  readonly country: GeoIPCountry;
  readonly location: GeoIPLocation;
  maxmind: any;
  risk: number;
}

export interface CreditCardIssuer {
  readonly name: string;
  readonly matchesProvidedName?: boolean;
  readonly phoneNumber: string;
  readonly matchesProvidedPhoneNumber?: boolean;
}

export interface CreditCard {
  readonly issuer: CreditCardIssuer;
  readonly brand: string;
  readonly country: string;
  readonly isIssuedInBillingAddressCountry?: boolean;
  readonly isPrepaid?: boolean;
  readonly isVirtual?: boolean;
  readonly type: CreditCardType;
}

export interface Device {
  readonly confidence: number;
  readonly id?: string;
  readonly lastSeen: string;
  readonly localTime: string;
}

export interface Email {
  readonly firstSeen: string;
  readonly isFree?: boolean;
  readonly isHighRisk?: boolean;
}

export interface ShippingAddress {
  readonly isHighRisk: boolean;
  readonly isPostalInCity?: boolean;
  readonly latitude: number;
  readonly longitude: number;
  readonly distanceToIpLocation: number;
  readonly distanceToBillingAddress: number;
  readonly isInIpCountry?: boolean;
}

export interface BillingAddress {
  readonly isPostalInCity?: boolean;
  readonly latitude: number;
  readonly longitude: number;
  readonly distanceToIpLocation: number;
  readonly isInIpCountry?: boolean;
}

export interface Disposition {
  readonly action: DispositionAction;
  readonly reason: DispositionReason;
}

export interface Subscores {
  readonly avsResult?: number;
  readonly billingAddress?: number;
  readonly billingAddressDistanceToIpLocation?: number;
  readonly browser?: number;
  readonly chargeback?: number;
  readonly country?: number;
  readonly countryMismatch?: number;
  readonly cvvResult?: number;
  readonly emailAddress?: number;
  readonly emailDomain?: number;
  readonly emailTenure?: number;
  readonly ipTenure?: number;
  readonly issuerIdNumber?: number;
  readonly orderAmount?: number;
  readonly phoneNumber?: number;
  readonly shippingAddressDistanceToIpLocation?: number;
  readonly timeOfDay?: number;
}

export interface Warning {
  readonly code: string;
  readonly warning: string;
  readonly inputPointer: string;
}
