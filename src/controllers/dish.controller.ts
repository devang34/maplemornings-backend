import { Request, Response } from "express";
import {
  createDish,
  deleteDishById,
  getAllDishes,
  getDishById,
  getDishesByDiseaseId,
  updateDishById,
} from "../services/dish.services";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const addDish = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, info, meals, price, image } = req.body;

    if (!name || !info || !meals || !price || !image) {
      res
        .status(400)
        .json({ error: "Name, info, meals, price and image are required" });
      return;
    }

    await createDish(name, info, meals, price, image);

    res.status(201).json({ message: "Dish created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create dish" });
  }
};

export const getAllDishesController = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const dishes = await getAllDishes();
    res.status(200).json(dishes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve dishes" });
  }
};

// Controller to get a dish by ID
export const getDishByIdController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const dish = await getDishById(Number(id));

    if (!dish) {
      res.status(404).json({ error: "Dish not found" });
      return;
    }

    res.status(200).json(dish);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve dish" });
  }
};

// Controller to update a dish by ID
export const updateDishController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, info, meals } = req.body;

    if (!name && !info && !meals) {
      res.status(400).json({
        error:
          "At least one field (name, info, or meals) is required to update",
      });
      return;
    }

    const updatedDish = await updateDishById(Number(id), { name, info, meals });

    res
      .status(200)
      .json({ message: "Dish updated successfully", dish: updatedDish });
  } catch (error) {
    console.error(error);
    if ((error as any).code === "P2025") {
      res.status(404).json({ error: "Dish not found" });
    } else {
      res.status(500).json({ error: "Failed to update dish" });
    }
  }
};

export const getDishesByDiseaseController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id: diseaseId } = req.params;

    const disease = await prisma.disease.findUnique({
      where: { id: Number(diseaseId) },
    });

    if (!disease) {
      res.status(404).json({ error: "Disease not found" });
      return;
    }

    const dishes = await getDishesByDiseaseId(Number(diseaseId));

    // if (dishes.length === 0) {
    //   res.status(404).json({ error: "No dishes found for this disease" });
    //   return;
    // }

    res.status(200).json(dishes);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Failed to retrieve dishes for the disease" });
  }
};

export const deleteDishController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    await deleteDishById(Number(id));

    res.status(200).json({ message: "Dish deleted successfully" });
  } catch (error) {
    console.error(error);
    if ((error as any).code === "P2025") {
      res.status(404).json({ error: "Dish not found" });
    } else {
      res.status(500).json({ error: "Failed to delete dish" });
    }
  }
};
