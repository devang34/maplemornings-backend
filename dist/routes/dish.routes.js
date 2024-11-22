"use strict";
// src/routes/dishRoutes.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const verifyAdmin_1 = require("../middlewares/verifyAdmin");
const dish_controller_1 = require("../controllers/dish.controller");
const verifyToken_1 = require("../middlewares/verifyToken");
const router = express_1.default.Router();
router.post("/add", verifyAdmin_1.verifyAdmin, dish_controller_1.addDish);
router.put("/update/:id", verifyAdmin_1.verifyAdmin, dish_controller_1.updateDishController);
router.get("/", verifyToken_1.verifyToken, dish_controller_1.getAllDishesController);
router.get("/:id", verifyToken_1.verifyToken, dish_controller_1.getDishByIdController);
router.delete("/:id", verifyAdmin_1.verifyAdmin, dish_controller_1.deleteDishController);
exports.default = router;
