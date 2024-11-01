import { Request, Response } from "express";
import {
  confirmOrderService,
  createOrderService,
  createPaymentIntentService,
  getAllOrdersService,
  getOrderByIdService,
} from "../services/order.services";

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { dishId, quantity } = req.body;
    const userId = res.locals.userId;

    // Create the order in the database
    const { order, dish, totalAmount } = await createOrderService(
      userId,
      dishId,
      quantity
    );

    // Generate the payment intent and retrieve client_secret
    const clientSecret = await createPaymentIntentService(totalAmount);

    // Return the client_secret to the frontend
    res.status(201).json({ clientSecret });
  } catch (error: any) {
    console.error(error);
    if (error.message === "Dish not found") {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Failed to create order" });
    }
  }
};

export const confirmOrder = async (req: Request, res: Response) => {
  try {
    const { paymentIntentId } = req.body;

    // Confirm the order by updating the payment status in the database
    const updatedOrder = await confirmOrderService(paymentIntentId);

    res.status(200).json({ message: "Order confirmed", order: updatedOrder });
  } catch (error: any) {
    console.error(error);
    if (error.message === "Order not found") {
      res.status(404).json({ error: "Order not found" });
    } else {
      res.status(500).json({ error: "Failed to confirm order" });
    }
  }
};

export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.userId;

    // Retrieve all orders for the authenticated user
    const orders = await getAllOrdersService(userId);

    res.status(200).json(orders);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve orders" });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = res.locals.userId;

    // Retrieve the order by ID and confirm it belongs to the authenticated user
    const order = await getOrderByIdService(Number(id), userId);

    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    res.status(200).json(order);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve order" });
  }
};
