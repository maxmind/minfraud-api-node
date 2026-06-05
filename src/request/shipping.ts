import { DeliverySpeed } from '../constants.js';
import Location, { LocationProps } from './location.js';

interface ShippingProps extends LocationProps {
  /**
   * The shipping delivery speed for the order.
   */
  deliverySpeed?: DeliverySpeed;
}

/**
 * The shipping information for the transaction being sent to the web service.
 */
export default class Shipping extends Location {
  /** @inheritDoc ShippingProps.deliverySpeed */
  public deliverySpeed?: DeliverySpeed;

  public constructor(shipping: ShippingProps) {
    super(shipping);
    this.deliverySpeed = shipping.deliverySpeed;
  }
}
