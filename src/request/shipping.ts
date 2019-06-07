import { DeliverySpeed } from '../constants';
import Location, { LocationProps } from './location';

interface ShippingProps extends LocationProps {
  deliverySpeed?: DeliverySpeed;
}

export default class Shipping extends Location {
  public deliverySpeed?: DeliverySpeed;

  public constructor(shipping: ShippingProps) {
    super(shipping);
    this.deliverySpeed = shipping.deliverySpeed;
  }
}
