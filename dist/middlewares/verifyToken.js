"use strict";
// src/middlewares/verifyToken.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ error: "Authorization token required" });
        return;
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
        res.status(401).json({ error: "Token missing" });
        return;
    }
    prisma.token
        .findUnique({ where: { token } })
        .then((tokenRecord) => {
        if (!tokenRecord) {
            res.status(498).json({ error: "Invalid token" });
            return;
        }
        res.locals.userId = tokenRecord.userId;
        next();
    })
        .catch((error) => {
        res.status(500).json({ error: `Token verification failed` });
    });
};
exports.verifyToken = verifyToken;
