// src/routes/diseaseRoutes.ts

import express from "express";
import { verifyAdmin } from "../middlewares/verifyAdmin";
import {
  addDisease,
  addDishesToDiseaseController,
  deleteDiseaseController,
  getAllDiseases,
  getDisease,
  updateDisease,
} from "../controllers/disease.controller";
import { verifyToken } from "../middlewares/verifyToken";

const router = express.Router();

router.post("/add", verifyAdmin, addDisease);

router.put("/update/:id", verifyAdmin, updateDisease);

router.get("/", verifyToken, getAllDiseases);

router.get("/:id", verifyToken, getDisease);

router.put("/:id/dishes", verifyAdmin, addDishesToDiseaseController);

router.delete("/:id", verifyAdmin, deleteDiseaseController);

export default router;
