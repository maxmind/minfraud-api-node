import { ArgumentError } from '../errors';

interface ShoppingCartItemProps {
  /**
   * The category of the item.
   */
  category?: string;
  /**
   * Your internal ID for the item.
   */
  itemId?: string;
  /**
   * The quantity of the item in the shopping cart.
   */
  quantity?: number;
  /**
   * The per-unit price of the item in the shopping cart. This should use the
   * same currency as the order currency.
   */
  price?: number;
}

/**
 * Information for an item in the shopping cart for the transaction being sent
 * to the web service.
 */
export default class ShoppingCartItem implements ShoppingCartItemProps {
  /**
   * The category of the item.
   */
  public category?: string;
  /**
   * Your internal ID for the item.
   */
  public itemId?: string;
  /**
   * The quantity of the item in the shopping cart.
   */
  public quantity?: number;
  /**
   * The per-unit price of the item in the shopping cart. This should use the
   * same currency as the order currency.
   */
  public price?: number;

  public constructor(item: ShoppingCartItemProps) {
    if (
      item.quantity != null &&
      (!Number.isInteger(item.quantity) || item.quantity < 0)
    ) {
      throw new ArgumentError(
        `Expected a positive integer for quantity but received: ${item.quantity}`
      );
    }

    Object.assign(this, item);
  }
}
