import { Request, Response } from "express";
import {
  confirmOrderService,
  createOrderService,
  createPaymentIntentService,
  getAllOrdersService,
  getOrderByIdService,
} from "../services/order.services";
import { validateCouponService } from "../services/coupon.services";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { items, pincode, address, couponCode } = req.body; // items is an array of { dishId, quantity }
    const userId = res.locals.userId;

    if (
      !items ||
      !Array.isArray(items) ||
      items.length === 0 ||
      !pincode ||
      !address
    ) {
      res.status(400).json({
        error:
          "items (array of { dishId, quantity}), pincode, and address are required",
      });
      return;
    }

    // Call the service to calculate total amount and create the orders
    const { orders, totalAmount: initialTotalAmount } =
      await createOrderService(userId, items, address, pincode);

    let discountAmount = 0;
    let totalAmount = initialTotalAmount;

    if (couponCode) {
      try {
        const coupon = await validateCouponService(couponCode);
        const { discountPercentage, maxDiscountAmount } = coupon;

        const calculatedDiscount =
          (initialTotalAmount * discountPercentage) / 100;
        discountAmount = Math.min(calculatedDiscount, maxDiscountAmount);

        totalAmount = initialTotalAmount - discountAmount;

        console.log(`Coupon applied. Discount: ${discountAmount}`);

        await prisma.coupon.update({
          where: { code: couponCode },
          data: { isActive: false },
        });
      } catch (error: any) {
        res.status(400).json({ error: error.message });
        return;
      }
    }

    if (totalAmount <= 0) {
      res.status(400).json({ error: "Invalid total amount for order" });
      return;
    }

    // Generate the payment intent and retrieve client_secret
    const clientSecret = await createPaymentIntentService(
      totalAmount,
      orders.map((order) => order.id)
    );

    console.log("Generated clientSecret:", clientSecret);

    // Return the client_secret and order details to the frontend
    res.status(201).json({ clientSecret, orders });
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
