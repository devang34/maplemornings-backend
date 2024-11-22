import express from "express";
import {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../controllers/cart.controller";
import { verifyToken } from "../middlewares/verifyToken";

const router = express.Router();

router.post("/add", verifyToken, addToCart);
router.get("/", verifyToken, getCart);
router.put("/item", verifyToken, updateCartItem);
router.delete("/item", verifyToken, removeCartItem);
router.delete("/clear", verifyToken, clearCart);

export default router;
