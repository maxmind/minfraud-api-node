import { CityResponse } from 'maxmind';

export interface ScoreIpAddress {
  readonly risk: number;
}

interface Names {
  readonly de?: string;
  readonly en: string;
  readonly es?: string;
  readonly fr?: string;
  readonly ja?: string;
  readonly 'pt-BR'?: string;
  readonly ru?: string;
  readonly 'zh-CN'?: string;
}

export interface GeoIPCountryWebRecord {
  readonly geoname_id: number;
  readonly is_in_european_union?: boolean;
  readonly iso_code: string;
  readonly names: Names;
  readonly confidence?: number;
  readonly is_high_risk: boolean;
}

export interface GeoIPLocationWebRecord {
  readonly accuracy_radius: number;
  readonly average_income?: number;
  readonly latitude: number;
  readonly longitude: number;
  readonly metro_code?: number;
  readonly population_density?: number;
  readonly time_zone?: string;
  readonly local_time: string;
}

export interface IpRiskReasonsWebRecord {
  readonly code?: string;
  readonly reason?: string;
}

export interface IpAddressWebRecord extends CityResponse {
  readonly risk: number;
  readonly risk_reasons?: IpRiskReasonsWebRecord[];
  readonly country?: GeoIPCountryWebRecord;
  readonly location?: GeoIPLocationWebRecord;
}

export interface CreditCardIssuerWebRecord {
  readonly name: string;
  readonly matches_provided_name?: boolean;
  readonly phone_number: string;
  readonly matches_provided_phone_number?: boolean;
}

export type CreditCardType = 'charge' | 'credit' | 'debit';

export interface CreditCardWebRecord {
  readonly issuer: CreditCardIssuerWebRecord;
  readonly brand: string;
  readonly country: string;
  readonly is_business?: boolean;
  readonly is_issued_in_billing_address_country?: boolean;
  readonly is_prepaid?: boolean;
  readonly is_virtual?: boolean;
  readonly type: CreditCardType;
}

export interface DeviceWebRecord {
  readonly confidence: number;
  readonly id?: string;
  readonly last_seen: string;
  readonly local_time: string;
}

export interface EmailDomainWebRecord {
  readonly first_seen: string;
}

export interface EmailWebRecord {
  readonly domain: EmailDomainWebRecord;
  readonly first_seen: string;
  readonly is_disposable?: boolean;
  readonly is_free?: boolean;
  readonly is_high_risk?: boolean;
}

export interface ShippingAddressWebRecord {
  readonly is_high_risk: boolean;
  readonly is_postal_in_city?: boolean;
  readonly latitude: number;
  readonly longitude: number;
  readonly distance_to_ip_location: number;
  readonly distance_to_billing_address: number;
  readonly is_in_ip_country?: boolean;
}

export interface BillingAddressWebRecord {
  readonly is_postal_in_city?: boolean;
  readonly latitude: number;
  readonly longitude: number;
  readonly distance_to_ip_location: number;
  readonly is_in_ip_country?: boolean;
}

export type DispositionAction = 'accept' | 'reject' | 'manual_review' | 'test';

export type DispositionReason = 'default' | 'custom_rule';

export interface DispositionWebRecord {
  readonly action: DispositionAction;
  readonly reason: DispositionReason;
  readonly rule_label?: string;
}

export interface SubscoresWebRecord {
  readonly avs_result?: number;
  readonly billing_address?: number;
  readonly billing_address_distance_to_ip_location?: number;
  readonly browser?: number;
  readonly chargeback?: number;
  readonly country?: number;
  readonly country_mismatch?: number;
  readonly cvv_result?: number;
  readonly device?: number;
  readonly email_address?: number;
  readonly email_domain?: number;
  readonly email_local_part?: number;
  readonly email_tenure?: number;
  readonly ip_tenure?: number;
  readonly issuer_id_number?: number;
  readonly order_amount?: number;
  readonly phone_number?: number;
  readonly shipping_address?: number;
  readonly shipping_address_distance_to_ip_location?: number;
  readonly time_of_day?: number;
}

export interface Warning {
  readonly code: string;
  readonly warning: string;
  readonly input_pointer: string;
}

export interface ScoreResponse {
  readonly disposition?: DispositionWebRecord;
  readonly funds_remaining: number;
  readonly id: string;
  readonly ip_address?: ScoreIpAddress;
  readonly queries_remaining: number;
  readonly risk_score: number;
  readonly warnings?: Warning[];
}

export interface InsightsResponse extends ScoreResponse {
  readonly ip_address: IpAddressWebRecord;
  readonly credit_card?: CreditCardWebRecord;
  readonly device: DeviceWebRecord;
  readonly email?: EmailWebRecord;
  readonly shipping_address?: ShippingAddressWebRecord;
  readonly billing_address?: BillingAddressWebRecord;
}

export interface FactorsResponse extends InsightsResponse {
  readonly subscores: SubscoresWebRecord;
}
