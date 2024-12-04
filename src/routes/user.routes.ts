// src/routes/userRoutes.ts

import express from "express";
import { verifyToken } from "../middlewares/verifyToken";
import {
  createContactUs,
  getContactUsMessagesController,
  getUser,
  updateUserInfoAndGetDiseaseDetailsController,
} from "../controllers/user.controller";
import {
  addFavoriteDish,
  getDishesByDiseaseController,
  getFavoriteDish,
  removeFavoriteDish,
} from "../controllers/dish.controller";

const router = express.Router();

// Protected route to get user details
router.get("/", getUser);

router.put(
  "/get-disease",
  verifyToken,
  updateUserInfoAndGetDiseaseDetailsController
);

router.get("/diseases/:id/", verifyToken, getDishesByDiseaseController);

router.post("/favorite", addFavoriteDish);
router.delete("/favorite", removeFavoriteDish);
router.get("/favorite", getFavoriteDish);
router.post("/contact-us", createContactUs);
router.get("/contact-us", getContactUsMessagesController);

export default router;
