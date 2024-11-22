import { Request, Response } from "express";
import {
  addToCartService,
  getCartService,
  updateCartItemService,
  clearCartService,
  removeFromCartService,
} from "../services/cart.services";

// Add a dish to the cart
export const addToCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const { dishId, quantity } = req.body;
    const userId = res.locals.userId;

    if (!dishId || !quantity || quantity <= 0) {
      res.status(400).json({ error: "Invalid input data" });
      return;
    }

    const cartItem = await addToCartService({
      userId,
      dishId,
      quantity,
    });

    res.status(201).json(cartItem);
  } catch (error: any) {
    console.error(error);
    if (error.message === "Dish not found") {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Failed to add to cart" });
    }
  }
};

// Get the user's cart
export const getCart = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.userId;

    const cart = await getCartService({ userId });

    res.status(200).json(cart);
  } catch (error: any) {
    console.error(error);
    if (error.message === "Cart not found") {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Failed to fetch cart" });
    }
  }
};

// Update a cart item's quantity
export const updateCartItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { cartItemId, quantity } = req.body;
    const userId = res.locals.userId;

    if (!cartItemId || !quantity || quantity < 0) {
      res.status(400).json({ error: "Invalid input data" });
      return;
    }

    const updatedItem = await updateCartItemService({
      userId,
      cartItemId,
      quantity,
    });

    res.status(200).json(updatedItem);
  } catch (error: any) {
    console.error(error);
    if (
      error.message === "Cart not found" ||
      error.message === "Cart item not found"
    ) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Failed to update cart item" });
    }
  }
};

// Remove a specific item from the cart
export const removeCartItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { cartItemId } = req.body;
    const userId = res.locals.userId;

    if (!cartItemId) {
      res.status(400).json({ error: "Invalid input data" });
      return;
    }

    const response = await removeFromCartService({
      userId,
      cartItemId,
    });

    res.status(200).json(response);
  } catch (error: any) {
    console.error(error);
    if (
      error.message === "Cart not found" ||
      error.message === "Cart item not found"
    ) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Failed to remove item from cart" });
    }
  }
};

// Clear the entire cart
export const clearCart = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.userId;

    const response = await clearCartService({ userId });

    res.status(200).json(response);
  } catch (error: any) {
    console.error(error);
    if (error.message === "Cart not found") {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Failed to clear cart" });
    }
  }
};
