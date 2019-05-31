import { ArgumentError } from '../errors';

export interface LocationProps {
  firstName?: string;
  lastName?: string;
  company?: string;
  address?: string;
  address2?: string;
  city?: string;
  region?: string;
  country?: string;
  postal?: string;
  phoneNumber?: string;
  phoneCountryCode?: string;
}

const countryRegex = /^[A-Z]{2}$/;

export default class Location implements LocationProps {
  public firstName?: string;
  public lastName?: string;
  public company?: string;
  public address?: string;
  public address2?: string;
  public city?: string;
  public region?: string;
  public country?: string;
  public postal?: string;
  public phoneNumber?: string;
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
