export interface ScoreIpAddress {
  readonly risk: number;
}

export interface IpAddress {
  readonly risk: number;
}

export interface CreditCardIssuer {
  readonly name: string;
  readonly matches_provided_name: boolean;
  readonly phone_number: string;
  readonly matches_provided_phone_number: boolean;
}

export interface CreditCard {
  readonly issuer: CreditCardIssuer;
  readonly brand: string;
  readonly country: string;
  readonly is_issued_in_billing_address_country: boolean;
  readonly is_prepaid: boolean;
  readonly is_virtual: boolean;
  readonly type: string;
}

export interface Device {
  readonly confidence: number;
  readonly id: string;
  readonly last_seen: string;
  readonly local_time: string;
}

export interface Email {
  readonly first_seen: string;
  readonly is_free: boolean;
  readonly is_high_risk: boolean;
}

export interface ShippingAddress {
  readonly is_high_risk: boolean;
  readonly is_postal_in_city: boolean;
  readonly latitude: number;
  readonly longitude: number;
  readonly distance_to_ip_location: number;
  readonly distance_to_billing_address: number;
  readonly is_in_ip_country: number;
}

export interface BillingAddress {
  readonly is_postal_in_city: boolean;
  readonly latitude: number;
  readonly longitude: number;
  readonly distance_to_ip_location: number;
  readonly is_in_ip_country: number;
}

export interface Disposition {
  readonly action: string;
  readonly reason: string;
}

export interface Subscores {
  readonly avs_result: number;
  readonly billing_address: number;
  readonly billing_address_distance_to_ip_location: number;
  readonly browser: number;
  readonly chargeback: number;
  readonly country: number;
  readonly country_mismatch: number;
  readonly cvv_result: number;
  readonly email_address: number;
  readonly email_domain: number;
  readonly email_tenure: number;
  readonly ip_tenure: number;
  readonly issuer_id_number: number;
  readonly order_amount: number;
  readonly phone_number: number;
  readonly shipping_address_distance_to_ip_location: number;
  readonly time_of_day: number;
}

export interface Warning {
  readonly code: string;
  readonly warning: string;
  readonly input_pointer: string;
}

export interface ScoreResponse {
  readonly disposition?: Disposition;
  readonly funds_remaining: number;
  readonly id: string;
  readonly ip_address: ScoreIpAddress;
  readonly queries_remaining: number;
  readonly risk_score: number;
  readonly warnings?: Warning[];
}
