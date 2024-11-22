import express from "express";
import {
  createCoupon,
  getCouponByCode,
  validateCoupon,
  deleteCoupon,
  getAllCoupons,
} from "../controllers/coupon.controller";
import { verifyAdmin } from "../middlewares/verifyAdmin";
import { verifyToken } from "../middlewares/verifyToken";

const router = express.Router();

// Create a new coupon
router.post("/create", verifyAdmin, createCoupon);

// Get a coupon by code
router.get("/:code", verifyToken, getCouponByCode);
router.get("/", verifyToken, getAllCoupons);

// Validate a coupon
router.get("/validate/:code", verifyToken, validateCoupon);

// Delete a coupon
router.delete("/:id", verifyAdmin, deleteCoupon);

export default router;
