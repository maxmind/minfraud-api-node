import { PhoneVerificationMethod } from '../constants.js';
import { ArgumentError } from '../errors.js';
import { assertValidDate } from '../utils.js';

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
   * The phone number, without the country code, associated with the address.
   */
  phoneNumber?: string;
  /**
   * The phone country code for the phone number associated with the address.
   */
  phoneCountryCode?: string;
  /**
   * The method used for the most recent verification of the phone number. Set
   * this if you tried to verify the phone number, even if the user did not
   * complete the verification. Do not set this if you did not try to verify
   * the phone number.
   */
  phoneVerificationMethod?: PhoneVerificationMethod;
  /**
   * The date and time that the end user completed the most recent verification
   * of the phone number, if known. Set this only if
   * `phoneWasVerificationSuccessful` is `true`. The time must not be before
   * 1970-01-01T00:00:00Z or more than two days in the future. The web service
   * ignores a time outside this range and returns a warning.
   */
  phoneVerificationTime?: Date;
  /**
   * Whether the end user has verified that they control the phone number, as
   * of the time of the event. Set this to `true` if the user completed a
   * verification. Set it to `false` if the phone number is not verified. This
   * includes a verification that is pending, abandoned, expired, or failed,
   * and a phone number that you did not try to verify. Omitting this is not
   * equivalent to `false`.
   */
  phoneWasVerificationSuccessful?: boolean;
}

const countryRegex = /^[A-Z]{2}$/;

/**
 * The location information for the transaction being sent to the web service.
 */
export default class Location implements LocationProps {
  /** @inheritDoc LocationProps.firstName */
  public firstName?: string;
  /** @inheritDoc LocationProps.lastName */
  public lastName?: string;
  /** @inheritDoc LocationProps.company */
  public company?: string;
  /** @inheritDoc LocationProps.address */
  public address?: string;
  /** @inheritDoc LocationProps.address2 */
  public address2?: string;
  /** @inheritDoc LocationProps.city */
  public city?: string;
  /** @inheritDoc LocationProps.region */
  public region?: string;
  /** @inheritDoc LocationProps.country */
  public country?: string;
  /** @inheritDoc LocationProps.postal */
  public postal?: string;
  /** @inheritDoc LocationProps.phoneNumber */
  public phoneNumber?: string;
  /** @inheritDoc LocationProps.phoneCountryCode */
  public phoneCountryCode?: string;
  /** @inheritDoc LocationProps.phoneVerificationMethod */
  public phoneVerificationMethod?: PhoneVerificationMethod;
  /** @inheritDoc LocationProps.phoneVerificationTime */
  public phoneVerificationTime?: Date;
  /** @inheritDoc LocationProps.phoneWasVerificationSuccessful */
  public phoneWasVerificationSuccessful?: boolean;

  public constructor(location: LocationProps) {
    if (location.country != null && !countryRegex.test(location.country)) {
      throw new ArgumentError(
        'Expected two-letter country code in the ISO 3166-1 alpha-2 format'
      );
    }

    if (
      location.phoneVerificationMethod != null &&
      !Object.values(PhoneVerificationMethod).includes(
        location.phoneVerificationMethod
      )
    ) {
      throw new ArgumentError(
        `"${location.phoneVerificationMethod}" is an invalid value for "phoneVerificationMethod"`
      );
    }

    if (
      location.phoneWasVerificationSuccessful != null &&
      typeof location.phoneWasVerificationSuccessful !== 'boolean'
    ) {
      throw new ArgumentError(
        '`phoneWasVerificationSuccessful` must be a boolean'
      );
    }

    if (location.phoneVerificationTime != null) {
      assertValidDate(location.phoneVerificationTime, 'phoneVerificationTime');
    }

    Object.assign(this, location);

    // Copy the Date so that a later change to the caller's object does not
    // change the request.
    if (location.phoneVerificationTime != null) {
      this.phoneVerificationTime = new Date(
        location.phoneVerificationTime.getTime()
      );
    }
  }
}
