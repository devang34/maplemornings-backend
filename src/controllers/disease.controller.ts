// src/controllers/diseaseController.ts

import { Request, Response } from "express";
import {
  createDisease,
  updateDiseaseById,
  getAllDisease,
  getDiseaseById,
  addDishesToDisease,
  deleteDiseaseById,
} from "../services/disease.services";

function isPrismaError(error: unknown): error is { code: string } {
  return typeof error === "object" && error !== null && "code" in error;
}

// Add a disease (admin only)
export const addDisease = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, desc, prevention } = req.body;

    if (!name || !desc || !prevention) {
      res
        .status(400)
        .json({ error: "Name, description, and prevention are required" });
      return;
    }

    const disease = await createDisease(name, desc, prevention);
    res.status(201).json({ message: "Disease created successfully", disease });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create disease" });
  }
};

// Update a disease (admin only)
export const updateDisease = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, desc, prevention } = req.body;

    if (!name && !desc && !prevention) {
      res.status(400).json({
        error:
          "At least one field (name, desc, or prevention) is required to update",
      });
      return;
    }

    const updatedDisease = await updateDiseaseById(Number(id), {
      name,
      desc,
      prevention,
    });

    res.status(200).json({
      message: "Disease updated successfully",
      disease: updatedDisease,
    });
  } catch (error) {
    console.error(error);
    if (isPrismaError(error) && error.code === "P2025") {
      res.status(404).json({ error: "Disease not found" });
    } else {
      res.status(500).json({ error: "Failed to update disease" });
    }
  }
};

// Get all diseases (public access)
export const getAllDiseases = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const diseases = await getAllDisease();
    res.status(200).json(diseases);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve diseases" });
  }
};

// Get a single disease by ID (public access)
export const getDisease = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const disease = await getDiseaseById(Number(id));

    if (!disease) {
      res.status(404).json({ error: "Disease not found" });
      return;
    }

    res.status(200).json(disease);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve disease" });
  }
};

export const addDishesToDiseaseController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id: diseaseId } = req.params;
    const { dishIds } = req.body;

    if (!dishIds || !Array.isArray(dishIds) || dishIds.length === 0) {
      res
        .status(400)
        .json({ error: "A non-empty array of dishIds is required" });
      return;
    }

    const updatedDisease = await addDishesToDisease(Number(diseaseId), dishIds);

    res.status(200).json({
      message: "Dishes added to disease successfully",
      disease: updatedDisease,
    });
  } catch (error) {
    console.error(error);
    if ((error as any).code === "P2025") {
      res.status(404).json({ error: "Disease or one of the dishes not found" });
    } else {
      res.status(500).json({ error: "Failed to add dishes to disease" });
    }
  }
};

export const deleteDiseaseController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    await deleteDiseaseById(Number(id));

    res.status(200).json({ message: "Disease deleted successfully" });
  } catch (error) {
    console.error(error);
    if ((error as any).code === "P2025") {
      res.status(404).json({ error: "Disease not found" });
    } else {
      res.status(500).json({ error: "Failed to delete disease" });
    }
  }
};
