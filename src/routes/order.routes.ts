// src/routes/orderRoutes.ts

import express from "express";
import { verifyToken } from "../middlewares/verifyToken";
import {
  confirmOrder,
  createOrder,
  getAllOrders,
  getOrderById,
} from "../controllers/order.controller";

const router = express.Router();

// Route to create an order and initiate Stripe payment
router.post("/create", verifyToken, createOrder);

router.post("/confirm", verifyToken, confirmOrder);

router.get("/", verifyToken, getAllOrders);

router.get("/:id", verifyToken, getOrderById);

export default router;
