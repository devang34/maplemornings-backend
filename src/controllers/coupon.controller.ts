import { Request, Response } from "express";
import {
  createCouponService,
  getCouponByCodeService,
  validateCouponService,
  deleteCouponService,
  getAllCouponsService,
} from "../services/coupon.services";

export const createCoupon = async (req: Request, res: Response) => {
  try {
    const { code, discountPercentage, maxDiscountAmount, expiryDate } =
      req.body;

    if (!code || !discountPercentage || !maxDiscountAmount || !expiryDate) {
      res.status(400).json({ error: "All fields are required" });
      return;
    }

    const coupon = await createCouponService({
      code,
      discountPercentage,
      maxDiscountAmount,
      expiryDate: new Date(expiryDate),
    });

    res.status(201).json(coupon);
  } catch (error) {
    console.error("Error creating coupon:", error);
    res.status(500).json({ error: "Failed to create coupon" });
  }
};

export const getCouponByCode = async (req: Request, res: Response) => {
  try {
    const { code } = req.params;

    const coupon = await getCouponByCodeService(code);

    if (!coupon) {
      res.status(404).json({ error: "Coupon not found" });
      return;
    }

    res.status(200).json(coupon);
  } catch (error) {
    console.error("Error fetching coupon:", error);
    res.status(500).json({ error: "Failed to fetch coupon" });
  }
};

export const validateCoupon = async (req: Request, res: Response) => {
  try {
    const { code } = req.params;

    const coupon = await validateCouponService(code);

    res.status(200).json({ valid: true, coupon });
  } catch (error: any) {
    console.error("Error validating coupon:", error);
    res.status(400).json({ error: error.message });
  }
};

export const deleteCoupon = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deletedCoupon = await deleteCouponService(Number(id));

    res
      .status(200)
      .json({ message: "Coupon deleted successfully", deletedCoupon });
  } catch (error) {
    console.error("Error deleting coupon:", error);
    res.status(500).json({ error: "Failed to delete coupon" });
  }
};

export const getAllCoupons = async (req: Request, res: Response) => {
  try {
    const coupons = await getAllCouponsService();
    res.status(200).json(coupons);
  } catch (error: any) {
    console.error("Error fetching coupons:", error);
    res.status(500).json({ error: error.message || "Failed to fetch coupons" });
  }
};
