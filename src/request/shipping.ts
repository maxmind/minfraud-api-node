import { DeliverySpeed } from '../constants';
import Location, { LocationProps } from './location';

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
  /**
   * The shipping delivery speed for the order.
   */
  public deliverySpeed?: DeliverySpeed;

  public constructor(shipping: ShippingProps) {
    super(shipping);
    this.deliverySpeed = shipping.deliverySpeed;
  }
}
