"use strict";
// src/routes/orderRoutes.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const verifyToken_1 = require("../middlewares/verifyToken");
const order_controller_1 = require("../controllers/order.controller");
const router = express_1.default.Router();
// Route to create an order and initiate Stripe payment
router.post("/create", verifyToken_1.verifyToken, order_controller_1.createOrder);
router.post("/confirm", verifyToken_1.verifyToken, order_controller_1.confirmOrder);
router.get("/", verifyToken_1.verifyToken, order_controller_1.getAllOrders);
router.get("/:id", verifyToken_1.verifyToken, order_controller_1.getOrderById);
exports.default = router;
