// src/controllers/userController.ts

import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { updateUserAgeDiseaseAndGetDiseaseInfo } from "../services/user.services";

const prisma = new PrismaClient();

export const getUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = res.locals.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, username: true },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve user" });
  }
};

export const updateUserInfoAndGetDiseaseDetailsController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = res.locals.userId; 
    const { age, diseaseId } = req.body;

    if (age === undefined || !diseaseId) {
      res.status(400).json({ error: "Both age and disease ID are required" });
      return;
    }

    const { diseaseData } = await updateUserAgeDiseaseAndGetDiseaseInfo(
      userId,
      age,
      diseaseId
    );

    res.status(200).json({
      message: "User information updated successfully",
      disease: {
        name: diseaseData.name,
        prevention: diseaseData.prevention,
      },
      dishes: diseaseData.dishes,
    });
  } catch (error: any) {
    console.error(error);
    if (error.message === "Disease not found") {
      res.status(404).json({ error: "Disease not found" });
    } else {
      res.status(500).json({
        error: "Failed to update user information and retrieve disease details",
      });
    }
  }
};
