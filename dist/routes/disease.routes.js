"use strict";
// src/routes/diseaseRoutes.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const verifyAdmin_1 = require("../middlewares/verifyAdmin");
const disease_controller_1 = require("../controllers/disease.controller");
const verifyToken_1 = require("../middlewares/verifyToken");
const router = express_1.default.Router();
router.post("/add", verifyAdmin_1.verifyAdmin, disease_controller_1.addDisease);
router.put("/update/:id", verifyAdmin_1.verifyAdmin, disease_controller_1.updateDisease);
router.get("/", verifyToken_1.verifyToken, disease_controller_1.getAllDiseases);
router.get("/:id", verifyToken_1.verifyToken, disease_controller_1.getDisease);
router.put("/:id/dishes", verifyAdmin_1.verifyAdmin, disease_controller_1.addDishesToDiseaseController);
router.delete("/:id", verifyAdmin_1.verifyAdmin, disease_controller_1.deleteDiseaseController);
exports.default = router;
