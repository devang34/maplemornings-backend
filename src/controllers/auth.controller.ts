// src/controllers/authController.ts

import { Request, Response } from "express";
import { SignUpDto, SignInDto } from "../dto/auth.dto";
import {
  generateAndSaveOtp,
  markOtpAsUsed,
  resetUserPassword,
  sendOtpEmail,
  signIn,
  signUp,
  validateOtp,
} from "../services/auth.services";
import logger from "../utils/logger";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const signUpController = async (req: Request, res: Response) => {
  try {
    const dto: SignUpDto = req.body;
    const result = await signUp(dto);
    res.json(result);
  } catch (error: any) {
    res.status(error.status || 500).json({ error: error.message });
  }
};

export const signInController = async (req: Request, res: Response) => {
  try {
    const dto: SignInDto = req.body;
    const result = await signIn(dto);
    res.json(result);
  } catch (error: any) {
    res.status(error.status || 500).json({ error: error.message });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    if (!email) {
      res.status(400).json({ message: "Email is required" });
      return;
    }

    // Check if the user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Generate OTP and save it
    const otpRecord = await generateAndSaveOtp(user.id);

    // Send OTP to user's email
    await sendOtpEmail(email, otpRecord.otpCode);

    res.status(200).json({ message: "OTP sent to your email" });
    return;
  } catch (error) {
    logger.error("Error in forgotPassword API", error);
    res.status(400).json({ message: error });
    return;
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { email, otp, newPassword } = req.body;

  try {
    if (!email || !otp || !newPassword) {
      res.status(400).json({ message: "Email, Otp and New Password are required" });
      return;
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Validate OTP
    const otpRecord = await validateOtp(user.id, otp);

    // Reset password
    await resetUserPassword(user.id, newPassword);

    // Mark OTP as used
    await markOtpAsUsed(otpRecord.id);

    res.status(200).json({ message: "Password reset successful" });
    return;
  } catch (error) {
    logger.error("Error in resetPassword API", error);
    res.status(400).json({ message: error });
    return;

  }
};
