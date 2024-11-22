import { PrismaClient } from "@prisma/client";
import { stripe } from "../utils/stripe";

const prisma = new PrismaClient();

export const createOrderService = async (
  userId: number,
  items: { dishId: number; quantity: number }[],
  address: string,
  pincode: string,
  discountAmount: number = 0 // Added discountAmount
) => {
  let totalAmount = 0;
  const orders = [];

  for (const item of items) {
    const { dishId, quantity } = item;

    // Validate the quantity
    if (!dishId || !quantity || quantity <= 0) {
      throw new Error("Invalid dishId or quantity in order items");
    }

    // Fetch dish details
    const dish = await prisma.dish.findUnique({
      where: { id: dishId },
    });

    if (!dish) {
      throw new Error(`Dish with id ${dishId} not found`);
    }

    // Calculate amount for the current dish
    const itemTotal = parseFloat(dish.price) * quantity;
    totalAmount += itemTotal;

    // Create an order entry for this dish
    const order = await prisma.order.create({
      data: {
        userId,
        dishId,
        quantity,
        totalAmount: itemTotal,
        status: "PENDING",
        paymentStatus: "PENDING",
        address,
        pincode,
      },
    });

    orders.push(order);
  }

  // Apply the discount
  totalAmount = totalAmount - discountAmount;
  totalAmount = Math.max(totalAmount, 0); // Ensure total is not negative

  return { orders, totalAmount };
};

export const createPaymentIntentService = async (
  amount: number,
  orderIds: number[]
) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: "cad",
      payment_method_types: ["card"],
      metadata: { orderIds: JSON.stringify(orderIds) },
    });
    console.log("New payment intent ID:", paymentIntent.id);
    return paymentIntent.client_secret;
  } catch (error) {
    console.error("Error creating payment intent:", error);
    throw new Error("Failed to create payment intent");
  }
};

export const confirmOrderService = async (paymentIntentId: string) => {
  // Retrieve payment intent to ensure it's completed
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  if (paymentIntent.status !== "succeeded") {
    throw new Error("Payment not completed");
  }

  const orderIdsJson = paymentIntent.metadata?.orderIds;
  if (!orderIdsJson) {
    throw new Error("Order IDs not found in payment metadata");
  }

  let orderIds: number[];

  try {
    orderIds = JSON.parse(orderIdsJson); // Safely parse the JSON string
  } catch (error) {
    throw new Error("Failed to parse order IDs from payment metadata");
  }

  if (!Array.isArray(orderIds) || orderIds.length === 0) {
    throw new Error("Invalid order IDs in payment metadata");
  }

  // Confirm each order in the database
  const updatedOrders = [];
  for (const orderId of orderIds) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new Error(`Order with ID ${orderId} not found`);
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "CONFIRMED",
        paymentStatus: "COMPLETED",
      },
    });

    updatedOrders.push(updatedOrder);
  }

  return updatedOrders;
};

export const getAllOrdersService = async (userId: number) => {
  // Fetch all orders belonging to the user with associated dish details
  const orders = await prisma.order.findMany({
    where: { userId, paymentStatus: "COMPLETED" },
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
