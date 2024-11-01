import express, { Application } from "express";
import bodyParser from "body-parser";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import dishRoutes from "./routes/dish.routes";
import diseaseRoutes from "./routes/disease.routes";
import orderRoutes from "./routes/order.routes";

import { verifyToken } from "./middlewares/verifyToken";

const app: Application = express();
app.use(bodyParser.json());

app.use("/auth", authRoutes);
app.use("/user", verifyToken, userRoutes);
app.use("/dishes", dishRoutes);
app.use("/diseases", diseaseRoutes);

app.use("/order", orderRoutes);

export default app;
