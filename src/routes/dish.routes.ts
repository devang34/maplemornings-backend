// src/routes/dishRoutes.ts

import express from "express";
import { verifyAdmin } from "../middlewares/verifyAdmin";
import {
  addDish,
  deleteDishController,
  getAllDishesController,
  getDishByIdController,
  updateDishController,
} from "../controllers/dish.controller";

const router = express.Router();

router.post("/add", verifyAdmin, addDish);
router.put("/update/:id", verifyAdmin, updateDishController);
router.get("/", getAllDishesController);
router.get("/:id", getDishByIdController);
router.delete("/:id", verifyAdmin, deleteDishController);

export default router;
