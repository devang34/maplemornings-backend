// src/middlewares/verifyToken.ts

import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
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
      res.status(500).json({ error: `Token verification failed ${error}` });
    });
};
