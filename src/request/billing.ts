import Location, { LocationProps } from './location';

/**
 * The billing information for the transaction being sent to the web service.
 */
export default class Billing extends Location {
  public constructor(billing: LocationProps) {
    super(billing);
  }
}
