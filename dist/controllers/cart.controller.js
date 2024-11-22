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
exports.clearCart = exports.removeCartItem = exports.updateCartItem = exports.getCart = exports.addToCart = void 0;
const cart_services_1 = require("../services/cart.services");
// Add a dish to the cart
const addToCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { dishId, quantity } = req.body;
        const userId = res.locals.userId;
        if (!dishId || !quantity || quantity <= 0) {
            res.status(400).json({ error: "Invalid input data" });
            return;
        }
        const cartItem = yield (0, cart_services_1.addToCartService)({
            userId,
            dishId,
            quantity,
        });
        res.status(201).json(cartItem);
    }
    catch (error) {
        console.error(error);
        if (error.message === "Dish not found") {
            res.status(404).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: "Failed to add to cart" });
        }
    }
});
exports.addToCart = addToCart;
// Get the user's cart
const getCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = res.locals.userId;
        const cart = yield (0, cart_services_1.getCartService)({ userId });
        res.status(200).json(cart);
    }
    catch (error) {
        console.error(error);
        if (error.message === "Cart not found") {
            res.status(404).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: "Failed to fetch cart" });
        }
    }
});
exports.getCart = getCart;
// Update a cart item's quantity
const updateCartItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { cartItemId, quantity } = req.body;
        const userId = res.locals.userId;
        if (!cartItemId || !quantity || quantity < 0) {
            res.status(400).json({ error: "Invalid input data" });
            return;
        }
        const updatedItem = yield (0, cart_services_1.updateCartItemService)({
            userId,
            cartItemId,
            quantity,
        });
        res.status(200).json(updatedItem);
    }
    catch (error) {
        console.error(error);
        if (error.message === "Cart not found" ||
            error.message === "Cart item not found") {
            res.status(404).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: "Failed to update cart item" });
        }
    }
});
exports.updateCartItem = updateCartItem;
// Remove a specific item from the cart
const removeCartItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { cartItemId } = req.body;
        const userId = res.locals.userId;
        if (!cartItemId) {
            res.status(400).json({ error: "Invalid input data" });
            return;
        }
        const response = yield (0, cart_services_1.removeFromCartService)({
            userId,
            cartItemId,
        });
        res.status(200).json(response);
    }
    catch (error) {
        console.error(error);
        if (error.message === "Cart not found" ||
            error.message === "Cart item not found") {
            res.status(404).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: "Failed to remove item from cart" });
        }
    }
});
exports.removeCartItem = removeCartItem;
// Clear the entire cart
const clearCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = res.locals.userId;
        const response = yield (0, cart_services_1.clearCartService)({ userId });
        res.status(200).json(response);
    }
    catch (error) {
        console.error(error);
        if (error.message === "Cart not found") {
            res.status(404).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: "Failed to clear cart" });
        }
    }
});
exports.clearCart = clearCart;
