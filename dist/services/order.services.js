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
exports.getOrderByIdService = exports.getAllOrdersService = exports.confirmOrderService = exports.createPaymentIntentService = exports.createOrderService = void 0;
const client_1 = require("@prisma/client");
const stripe_1 = require("../utils/stripe");
const prisma = new client_1.PrismaClient();
const createOrderService = (userId, dishId, quantity, address, pincode) => __awaiter(void 0, void 0, void 0, function* () {
    // Fetch dish details
    const dish = yield prisma.dish.findUnique({
        where: { id: dishId },
    });
    if (!dish) {
        throw new Error("Dish not found");
    }
    const totalAmount = parseFloat(dish.price) * quantity;
    const order = yield prisma.order.create({
        data: {
            userId,
            dishId,
            quantity,
            totalAmount,
            status: "PENDING",
            paymentStatus: "PENDING",
            address,
            pincode,
        },
    });
    return { order, dish, totalAmount };
});
exports.createOrderService = createOrderService;
const createPaymentIntentService = (amount, orderId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const paymentIntent = yield stripe_1.stripe.paymentIntents.create({
            amount: Math.round(amount * 100),
            currency: "cad",
            payment_method_types: ["card"],
            metadata: { orderId: orderId.toString() },
        });
        console.log("New payment intent ID:", paymentIntent.id);
        return paymentIntent.client_secret;
    }
    catch (error) {
        console.error("Error creating payment intent:", error);
        throw new Error("Failed to create payment intent");
    }
});
exports.createPaymentIntentService = createPaymentIntentService;
const confirmOrderService = (paymentIntentId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // Retrieve payment intent to ensure it's completed
    const paymentIntent = yield stripe_1.stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== "succeeded") {
        throw new Error("Payment not completed");
    }
    const orderId = (_a = paymentIntent.metadata) === null || _a === void 0 ? void 0 : _a.orderId;
    if (!orderId) {
        throw new Error("Order ID not found in payment metadata");
    }
    // Find and update the order status in your database
    const order = yield prisma.order.findUnique({
        where: { id: parseInt(orderId) },
    });
    if (!order) {
        throw new Error("Order not found");
    }
    const updatedOrder = yield prisma.order.update({
        where: { id: order.id },
        data: {
            status: "CONFIRMED",
            paymentStatus: "COMPLETED",
        },
    });
    return updatedOrder;
});
exports.confirmOrderService = confirmOrderService;
const getAllOrdersService = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    // Fetch all orders belonging to the user with associated dish details
    const orders = yield prisma.order.findMany({
        where: { userId },
        include: {
            dish: true, // Include related dish details for each order
        },
        orderBy: {
            createdAt: "desc", // Optional: order by most recent orders first
        },
    });
    return orders;
});
exports.getAllOrdersService = getAllOrdersService;
const getOrderByIdService = (orderId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    // Fetch the order, confirming it belongs to the user and including dish details
    const order = yield prisma.order.findFirst({
        where: {
            id: orderId,
            userId: userId, // Ensure the order belongs to the requesting user
        },
        include: {
            dish: true, // Include related dish details
        },
    });
    return order;
});
exports.getOrderByIdService = getOrderByIdService;
