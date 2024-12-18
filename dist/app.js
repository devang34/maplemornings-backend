"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const dish_routes_1 = __importDefault(require("./routes/dish.routes"));
const disease_routes_1 = __importDefault(require("./routes/disease.routes"));
const order_routes_1 = __importDefault(require("./routes/order.routes"));
const cart_routes_1 = __importDefault(require("./routes/cart.routes"));
const verifyToken_1 = require("./middlewares/verifyToken");
const app = (0, express_1.default)();
app.use(body_parser_1.default.json());
app.use("/auth", auth_routes_1.default);
app.use("/user", verifyToken_1.verifyToken, user_routes_1.default);
app.use("/dishes", dish_routes_1.default);
app.use("/diseases", disease_routes_1.default);
app.use("/order", order_routes_1.default);
app.use("/cart", cart_routes_1.default);
exports.default = app;
