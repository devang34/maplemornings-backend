import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createCouponService = async (data: {
  code: string;
  discountPercentage: number;
  maxDiscountAmount: number;
  expiryDate: Date;
}) => {
  try {
    return await prisma.coupon.create({
      data,
    });
  } catch (error) {
    console.error("Error creating coupon:", error);
    throw new Error("Failed to create coupon");
  }
};

export const getCouponByCodeService = async (code: string) => {
  try {
    const coupon = await prisma.coupon.findUnique({
      where: { code },
    });

    if (!coupon) {
      throw new Error("Coupon not found");
    }

    return coupon;
  } catch (error) {
    console.error("Error fetching coupon by code:", error);
    throw new Error("Failed to fetch coupon");
  }
};

export const validateCouponService = async (code: string) => {
  try {
    const coupon = await prisma.coupon.findUnique({
      where: { code },
    });

    if (!coupon) {
      throw new Error("Coupon not found");
    }

    if (!coupon.isActive) {
      throw new Error("Coupon is no longer active");
    }

    if (new Date(coupon.expiryDate) < new Date()) {
      throw new Error("Coupon has expired");
    }

    return coupon;
  } catch (error: any) {
    console.error("Error validating coupon:", error);
    throw new Error(error.message || "Failed to validate coupon");
  }
};

export const deleteCouponService = async (id: number) => {
  try {
    return await prisma.coupon.delete({
      where: { id },
    });
  } catch (error) {
    console.error("Error deleting coupon:", error);
    throw new Error("Failed to delete coupon");
  }
};

export const getAllCouponsService = async () => {
  try {
    return await prisma.coupon.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        expiryDate: "asc",
      },
    });
  } catch (error) {
    console.error("Error fetching coupon:", error);
    throw new Error("Failed to fetch coupons");
  }
};
