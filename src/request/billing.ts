import { PhoneVerificationMethod } from '../constants.js';
import Location, { LocationProps } from './location.js';

interface BillingProps extends LocationProps {
  /**
   * The most recent method used to verify the billing phone number.
   */
  phoneVerificationMethod?: PhoneVerificationMethod;
  /**
   * The date and time of the most recent verification of the billing phone
   * number.
   */
  phoneVerificationTime?: Date;
  /**
   * Whether the most recent verification of the billing phone number
   * succeeded. Omit this if no verification was attempted.
   */
  phoneWasVerificationSuccessful?: boolean;
}

/**
 * The billing information for the transaction being sent to the web service.
 */
export default class Billing extends Location {
  /** @inheritDoc BillingProps.phoneVerificationMethod */
  public phoneVerificationMethod?: PhoneVerificationMethod;
  /** @inheritDoc BillingProps.phoneVerificationTime */
  public phoneVerificationTime?: Date;
  /** @inheritDoc BillingProps.phoneWasVerificationSuccessful */
  public phoneWasVerificationSuccessful?: boolean;

  public constructor(billing: BillingProps) {
    super(billing);
    this.phoneVerificationMethod = billing.phoneVerificationMethod;
    this.phoneVerificationTime = billing.phoneVerificationTime;
    this.phoneWasVerificationSuccessful =
      billing.phoneWasVerificationSuccessful;
  }
}
