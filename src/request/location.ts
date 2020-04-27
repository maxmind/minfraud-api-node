import { ArgumentError } from '../errors';

export interface LocationProps {
  /**
   * The first name associated with the address.
   */
  firstName?: string;
  /**
   * The last name associated with the address.
   */
  lastName?: string;
  /**
   * The company name associated with the address.
   */
  company?: string;
  /**
   * The first line of the address.
   */
  address?: string;
  /**
   * The second line of the address.
   */
  address2?: string;
  /**
   * The city associated with the address.
   */
  city?: string;
  /**
   * The ISO 3166-2 subdivision code for the region associated with the address.
   */
  region?: string;
  /**
   * The ISO 3166-1 alpha-2 country code for the country associated with the
   * address (e.g., "US")
   */
  country?: string;
  /**
   * The postal code for associated with the address.
   */
  postal?: string;
  /**
   * The phone country code for the phone number associated with the address.
   */
  phoneNumber?: string;
  /**
   * The phone number, without the country code, associated with the address.
   */
  phoneCountryCode?: string;
}

const countryRegex = /^[A-Z]{2}$/;

/**
 * The location information for the transaction being sent to the web service.
 */
export default class Location implements LocationProps {
  /**
   * The first name associated with the address.
   */
  public firstName?: string;
  /**
   * The last name associated with the address.
   */
  public lastName?: string;
  /**
   * The company name associated with the address.
   */
  public company?: string;
  /**
   * The first line of the address.
   */
  public address?: string;
  /**
   * The second line of the address.
   */
  public address2?: string;
  /**
   * The city associated with the address.
   */
  public city?: string;
  /**
   * The ISO 3166-2 subdivision code for the region associated with the address.
   */
  public region?: string;
  /**
   * The ISO 3166-1 alpha-2 country code for the country associated with the
   * address (e.g., "US")
   */
  public country?: string;
  /**
   * The postal code for associated with the address.
   */
  public postal?: string;
  /**
   * The phone country code for the phone number associated with the address.
   */
  public phoneNumber?: string;
  /**
   * The phone number, without the country code, associated with the address.
   */
  public phoneCountryCode?: string;

  public constructor(location: LocationProps) {
    if (location.country != null && !countryRegex.test(location.country)) {
      throw new ArgumentError(
        'Expected two-letter country code in the ISO 3166-1 alpha-2 format'
      );
    }

    Object.assign(this, location);
  }
}
