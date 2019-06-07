import { ArgumentError } from '../errors';

interface ShoppingCartItemProps {
  category?: string;
  itemId?: string;
  quantity?: number;
  price?: number;
}

export default class ShoppingCartItem implements ShoppingCartItemProps {
  public category?: string;
  public itemId?: string;
  public quantity?: number;
  public price?: number;

  public constructor(item: ShoppingCartItemProps) {
    if (
      item.quantity != null &&
      (!Number.isInteger(item.quantity) || item.quantity < 0)
    ) {
      throw new ArgumentError(
        `Expected a positive integer for quantity but received: ${
          item.quantity
        }`
      );
    }

    Object.assign(this, item);
  }
}
