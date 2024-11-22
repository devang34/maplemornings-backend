"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cart_controller_1 = require("../controllers/cart.controller");
const verifyToken_1 = require("../middlewares/verifyToken");
const router = express_1.default.Router();
router.post("/add", verifyToken_1.verifyToken, cart_controller_1.addToCart);
router.get("/", cart_controller_1.getCart);
router.put("/item", cart_controller_1.updateCartItem);
router.delete("/item", cart_controller_1.removeCartItem);
router.delete("/clear", cart_controller_1.clearCart);
exports.default = router;
