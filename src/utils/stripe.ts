import Stripe from "stripe";

// Initialize Stripe with your secret key from environment variables
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-09-30.acacia", // Ensure you’re using the correct Stripe API version
});
