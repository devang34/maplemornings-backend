"use strict";
// src/middlewares/verifyAdmin.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAdmin = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const verifyAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
    try {
        // Define expected structure for tokenRecord to include user
        const tokenRecord = (yield prisma.token.findUnique({
            where: { token },
            include: { user: true }, // Include the user to check their role
        }));
        if (!tokenRecord) {
            res.status(498).json({ error: "Invalid token" });
            return;
        }
        // Check if the user's role is ADMIN
        if (tokenRecord.user.role !== "ADMIN") {
            res.status(403).json({ error: "Access denied. Admins only." });
            return;
        }
        // Attach userId to request for downstream access
        res.locals.userId = tokenRecord.user.id;
        next();
    }
    catch (error) {
        res.status(500).json({ error: "Token verification failed" });
    }
});
exports.verifyAdmin = verifyAdmin;
