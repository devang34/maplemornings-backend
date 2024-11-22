import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface AddToCartInput {
  userId: number;
  dishId: number;
  quantity: number;
}

// Add a dish to the cart
export const addToCartService = async ({
  userId,
  dishId,
  quantity,
}: AddToCartInput) => {
  try {
    // Ensure the user has a cart
    let cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
      });
    }

    // Check if the dish exists
    const dish = await prisma.dish.findUnique({ where: { id: dishId } });
    if (!dish) {
      throw new Error("Dish not found");
    }

    // Check if the dish is already in the cart
    const existingCartItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        dishId,
      },
    });

    if (existingCartItem) {
      // Update the quantity if it exists
      return await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: existingCartItem.quantity + quantity },
      });
    }

    // Add the dish to the cart if it doesn't exist
    return await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        dishId,
        quantity,
      },
    });
  } catch (error) {
    console.error("Error adding to cart:", error);
    throw new Error("Failed to add dish to cart");
  }
};

interface GetCartInput {
  userId: number;
}

// Get the user's cart
export const getCartService = async ({ userId }: GetCartInput) => {
  try {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: { dish: true },
        },
      },
    });

    if (!cart) {
      return [];
    }

    return cart || [];
  } catch (error) {
    console.error("Error fetching cart:", error);
    throw new Error("Failed to fetch cart");
  }
};

interface UpdateCartItemInput {
  userId: number;
  cartItemId: number;
  quantity: number;
}

// Update a cart item's quantity
export const updateCartItemService = async ({
  userId,
  cartItemId,
  quantity,
}: UpdateCartItemInput) => {
  try {
    const cart = await prisma.cart.findUnique({ where: { userId } });

    if (!cart) {
      throw new Error("Cart not found");
    }

    const cartItem = await prisma.cartItem.findFirst({
      where: { id: cartItemId, cartId: cart.id },
    });

    if (!cartItem) {
      throw new Error("Cart item not found");
    }

    if (quantity <= 0) {
      // Remove the item if quantity is zero or less
      await prisma.cartItem.delete({
        where: { id: cartItem.id },
      });
      return { message: "Item removed from cart" };
    }

    return await prisma.cartItem.update({
      where: { id: cartItem.id },
      data: { quantity },
    });
  } catch (error) {
    console.error("Error updating cart item:", error);
    throw new Error("Failed to update cart item");
  }
};

interface RemoveFromCartInput {
  userId: number;
  cartItemId: number;
}

// Remove a specific item from the cart
export const removeFromCartService = async ({
  userId,
  cartItemId,
}: RemoveFromCartInput) => {
  try {
    const cart = await prisma.cart.findUnique({ where: { userId } });

    if (!cart) {
      throw new Error("Cart not found");
    }

    const cartItem = await prisma.cartItem.findFirst({
      where: { id: cartItemId, cartId: cart.id },
    });

    if (!cartItem) {
      throw new Error("Cart item not found");
    }

    await prisma.cartItem.delete({
      where: { id: cartItem.id },
    });

    return { message: "Item removed from cart" };
  } catch (error) {
    console.error("Error removing cart item:", error);
    throw new Error("Failed to remove item from cart");
  }
};

interface ClearCartInput {
  userId: number;
}

// Clear the entire cart
export const clearCartService = async ({ userId }: ClearCartInput) => {
  try {
    const cart = await prisma.cart.findUnique({ where: { userId } });

    if (!cart) {
      throw new Error("Cart not found");
    }

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return { message: "Cart cleared" };
  } catch (error) {
    console.error("Error clearing cart:", error);
    throw new Error("Failed to clear cart");
  }
};
