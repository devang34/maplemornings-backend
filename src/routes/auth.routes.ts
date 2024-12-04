import express from "express";
import {
  forgotPassword,
  resetPassword,
  signInController,
  signUpController,
} from "../controllers/auth.controller";

const router = express.Router();

router.post("/signup", signUpController);
router.post("/signin", signInController);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
