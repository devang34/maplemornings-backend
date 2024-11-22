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
exports.getOrderById = exports.getAllOrders = exports.confirmOrder = exports.createOrder = void 0;
const order_services_1 = require("../services/order.services");
const createOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { dishId, quantity, pincode, address } = req.body;
        const userId = res.locals.userId;
        if (!dishId || !quantity || quantity <= 0 || !pincode || !address) {
            res.status(400).json({
                error: "dishId ,quantity ,pincode ,address is not in the input data",
            });
            return;
        }
        // Create the order in the database
        const { order, dish, totalAmount } = yield (0, order_services_1.createOrderService)(userId, dishId, quantity, pincode, address);
        if (totalAmount <= 0) {
            res.status(400).json({ error: "Invalid total amount for order" });
            return;
        }
        // Generate the payment intent and retrieve client_secret
        const clientSecret = yield (0, order_services_1.createPaymentIntentService)(totalAmount, order.id);
        console.log("Generated clientSecret:", clientSecret);
        // Return the client_secret to the frontend
        res.status(201).json({ clientSecret });
    }
    catch (error) {
        console.error(error);
        if (error.message === "Dish not found") {
            res.status(404).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: "Failed to create order" });
        }
    }
});
exports.createOrder = createOrder;
const confirmOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { paymentIntentId } = req.body;
        // Confirm the order by updating the payment status in the database
        const updatedOrder = yield (0, order_services_1.confirmOrderService)(paymentIntentId);
        res.status(200).json({ message: "Order confirmed", order: updatedOrder });
    }
    catch (error) {
        console.error(error);
        if (error.message === "Order not found") {
            res.status(404).json({ error: "Order not found" });
        }
        else {
            res.status(500).json({ error: "Failed to confirm order" });
        }
    }
});
exports.confirmOrder = confirmOrder;
const getAllOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = res.locals.userId;
        // Retrieve all orders for the authenticated user
        const orders = yield (0, order_services_1.getAllOrdersService)(userId);
        res.status(200).json(orders);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to retrieve orders" });
    }
});
exports.getAllOrders = getAllOrders;
const getOrderById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const userId = res.locals.userId;
        // Retrieve the order by ID and confirm it belongs to the authenticated user
        const order = yield (0, order_services_1.getOrderByIdService)(Number(id), userId);
        if (!order) {
            res.status(404).json({ error: "Order not found" });
            return;
        }
        res.status(200).json(order);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to retrieve order" });
    }
});
exports.getOrderById = getOrderById;
