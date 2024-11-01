import { PrismaClient } from "@prisma/client";
import { stripe } from "../utils/stripe";

const prisma = new PrismaClient();

export const createOrderService = async (
  userId: number,
  dishId: number,
  quantity: number
) => {
  // Fetch dish details
  const dish = await prisma.dish.findUnique({
    where: { id: dishId },
  });

  if (!dish) {
    throw new Error("Dish not found");
  }

  // Calculate total amount
  const totalAmount = parseFloat(dish.price) * quantity;

  // Create order in the database with a status of 'PENDING'
  const order = await prisma.order.create({
    data: {
      userId,
      dishId,
      quantity,
      totalAmount,
      status: "PENDING",
      paymentStatus: "PENDING",
    },
  });

  return { order, dish, totalAmount };
};

export const createPaymentIntentService = async (amount: number) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Stripe expects amount in cents
    currency: "usd",
    payment_method_types: ["card"],
  });

  return paymentIntent.client_secret;
};

export const confirmOrderService = async (paymentIntentId: string) => {
  // Retrieve payment intent to ensure it's completed
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  if (paymentIntent.status !== "succeeded") {
    throw new Error("Payment not completed");
  }

  // Find and update the order status in your database
  const order = await prisma.order.findUnique({
    where: { id: parseInt(paymentIntent.metadata.orderId) },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  const updatedOrder = await prisma.order.update({
    where: { id: order.id },
    data: {
      status: "CONFIRMED",
      paymentStatus: "COMPLETED",
    },
  });

  return updatedOrder;
};

export const getAllOrdersService = async (userId: number) => {
  // Fetch all orders belonging to the user with associated dish details
  const orders = await prisma.order.findMany({
    where: { userId },
    include: {
      dish: true, // Include related dish details for each order
    },
    orderBy: {
      createdAt: "desc", // Optional: order by most recent orders first
    },
  });

  return orders;
};

export const getOrderByIdService = async (orderId: number, userId: number) => {
  // Fetch the order, confirming it belongs to the user and including dish details
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId: userId, // Ensure the order belongs to the requesting user
    },
    include: {
      dish: true, // Include related dish details
    },
  });

  return order;
};
