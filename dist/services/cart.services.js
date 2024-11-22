"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCartService = exports.removeFromCartService = exports.updateCartItemService = exports.getCartService = exports.addToCartService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Add a dish to the cart
const addToCartService = (_a) => __awaiter(void 0, [_a], void 0, function* ({ userId, dishId, quantity, }) {
    try {
        // Ensure the user has a cart
        let cart = yield prisma.cart.findUnique({
            where: { userId },
        });
        if (!cart) {
            cart = yield prisma.cart.create({
                data: { userId },
            });
        }
        // Check if the dish exists
        const dish = yield prisma.dish.findUnique({ where: { id: dishId } });
        if (!dish) {
            throw new Error("Dish not found");
        }
        // Check if the dish is already in the cart
        const existingCartItem = yield prisma.cartItem.findFirst({
            where: {
                cartId: cart.id,
                dishId,
            },
        });
        if (existingCartItem) {
            // Update the quantity if it exists
            return yield prisma.cartItem.update({
                where: { id: existingCartItem.id },
                data: { quantity: existingCartItem.quantity + quantity },
            });
        }
        // Add the dish to the cart if it doesn't exist
        return yield prisma.cartItem.create({
            data: {
                cartId: cart.id,
                dishId,
                quantity,
            },
        });
    }
    catch (error) {
        console.error("Error adding to cart:", error);
        throw new Error("Failed to add dish to cart");
    }
});
exports.addToCartService = addToCartService;
// Get the user's cart
const getCartService = (_a) => __awaiter(void 0, [_a], void 0, function* ({ userId }) {
    try {
        const cart = yield prisma.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    include: { dish: true },
                },
            },
        });
        if (!cart) {
            throw new Error("Cart not found");
        }
        return cart;
    }
    catch (error) {
        console.error("Error fetching cart:", error);
        throw new Error("Failed to fetch cart");
    }
});
exports.getCartService = getCartService;
// Update a cart item's quantity
const updateCartItemService = (_a) => __awaiter(void 0, [_a], void 0, function* ({ userId, cartItemId, quantity, }) {
    try {
        const cart = yield prisma.cart.findUnique({ where: { userId } });
        if (!cart) {
            throw new Error("Cart not found");
        }
        const cartItem = yield prisma.cartItem.findFirst({
            where: { id: cartItemId, cartId: cart.id },
        });
        if (!cartItem) {
            throw new Error("Cart item not found");
        }
        if (quantity <= 0) {
            // Remove the item if quantity is zero or less
            yield prisma.cartItem.delete({
                where: { id: cartItem.id },
            });
            return { message: "Item removed from cart" };
        }
        return yield prisma.cartItem.update({
            where: { id: cartItem.id },
            data: { quantity },
        });
    }
    catch (error) {
        console.error("Error updating cart item:", error);
        throw new Error("Failed to update cart item");
    }
});
exports.updateCartItemService = updateCartItemService;
// Remove a specific item from the cart
const removeFromCartService = (_a) => __awaiter(void 0, [_a], void 0, function* ({ userId, cartItemId, }) {
    try {
        const cart = yield prisma.cart.findUnique({ where: { userId } });
        if (!cart) {
            throw new Error("Cart not found");
        }
        const cartItem = yield prisma.cartItem.findFirst({
            where: { id: cartItemId, cartId: cart.id },
        });
        if (!cartItem) {
            throw new Error("Cart item not found");
        }
        yield prisma.cartItem.delete({
            where: { id: cartItem.id },
        });
        return { message: "Item removed from cart" };
    }
    catch (error) {
        console.error("Error removing cart item:", error);
        throw new Error("Failed to remove item from cart");
    }
});
exports.removeFromCartService = removeFromCartService;
// Clear the entire cart
const clearCartService = (_a) => __awaiter(void 0, [_a], void 0, function* ({ userId }) {
    try {
        const cart = yield prisma.cart.findUnique({ where: { userId } });
        if (!cart) {
            throw new Error("Cart not found");
        }
        yield prisma.cartItem.deleteMany({
            where: { cartId: cart.id },
        });
        return { message: "Cart cleared" };
    }
    catch (error) {
        console.error("Error clearing cart:", error);
        throw new Error("Failed to clear cart");
    }
});
exports.clearCartService = clearCartService;
