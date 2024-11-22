"use strict";
// src/routes/userRoutes.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const verifyToken_1 = require("../middlewares/verifyToken");
const user_controller_1 = require("../controllers/user.controller");
const dish_controller_1 = require("../controllers/dish.controller");
const router = express_1.default.Router();
// Protected route to get user details
router.get("/", user_controller_1.getUser);
router.put("/get-disease", verifyToken_1.verifyToken, user_controller_1.updateUserInfoAndGetDiseaseDetailsController);
router.get("/diseases/:id/", verifyToken_1.verifyToken, dish_controller_1.getDishesByDiseaseController);
exports.default = router;
