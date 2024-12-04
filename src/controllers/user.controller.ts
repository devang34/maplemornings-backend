// src/controllers/userController.ts

import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import {
  createContactUsMessage,
  getContactUsMessages,
  updateUserAgeDiseaseAndGetDiseaseInfo,
} from "../services/user.services";

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

export const createContactUs = async (req: Request, res: Response) => {
  const userId = res.locals.userId; // User ID should be available in res.locals after authentication

  try {
    // Validate that userId is available (user must be logged in)
    if (!userId) {
      res.status(400).json({ message: "User is not authenticated" });
      return;
    }

    // Retrieve the user email from Prisma using the userId
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    // If user does not exist or email is not found
    if (!user || !user.email) {
      res.status(400).json({ message: "User not found or email missing" });
      return;
    }

    const { message } = req.body;

    // Validate that message is provided
    if (!message) {
      res.status(400).json({ message: "Message is required" });
      return;
    }

    // Create the contact message
    const newMessage = await createContactUsMessage(
      user.email,
      message,
      userId
    );

    // Respond with success
    res.status(201).json({
      message: "Contact Us message sent successfully",
      data: newMessage,
    });
    return;
  } catch (error: any) {
    res.status(500).json({
      message: "Error submitting contact message",
      error: error.message,
    });
    return;
  }
};

export const getContactUsMessagesController = async (
  req: Request,
  res: Response
) => {
  const userId = res.locals.userId; // Optional: get userId from token (if needed)

  try {
    const messages = await getContactUsMessages(userId);
    res.status(200).json({ messages });
    return;
  } catch (error: any) {
    res.status(500).json({
      message: "Error retrieving contact messages",
      error: error.message,
    });
    return;
  }
};
