// src/middlewares/verifyAdmin.ts

import { Request, Response, NextFunction } from "express";
import { PrismaClient, Token, User } from "@prisma/client";

const prisma = new PrismaClient();

export const verifyAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
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
    const tokenRecord = (await prisma.token.findUnique({
      where: { token },
      include: { user: true }, // Include the user to check their role
    })) as Token & { user: User };

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
  } catch (error) {
    res.status(500).json({ error: "Token verification failed" });
  }
};
