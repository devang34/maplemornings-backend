// src/routes/userRoutes.ts

import express from "express";
import { verifyToken } from "../middlewares/verifyToken";
import {
  getUser,
  updateUserInfoAndGetDiseaseDetailsController,
} from "../controllers/user.controller";

const router = express.Router();

// Protected route to get user details
router.get("/", getUser);

router.put(
  "/get-disease",
  verifyToken,
  updateUserInfoAndGetDiseaseDetailsController
);

export default router;
