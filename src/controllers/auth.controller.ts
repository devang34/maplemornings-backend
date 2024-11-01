// src/controllers/authController.ts

import { Request, Response } from "express";
import { SignUpDto, SignInDto } from "../dto/auth.dto";
import { signIn, signUp } from "../services/auth.services";

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
