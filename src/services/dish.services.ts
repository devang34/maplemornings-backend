// src/services/dishService.ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Service to add a new dish with associated diseases
export const createDish = async (
  name: string,
  info: string,
  meals: string,
  price: string,
  image: string
) => {
  // Create the dish in the database without connecting to diseases
  const dish = await prisma.dish.create({
    data: {
      name,
      info,
      meals,
      price,
      image
    },
  });

  return dish;
};

export const getAllDishes = async () => {
  return await prisma.dish.findMany();
};

// Service to fetch a single dish by ID
export const getDishById = async (id: number) => {
  return await prisma.dish.findUnique({
    where: { id },
  });
};

// Service to update a dish by ID
export const updateDishById = async (
  id: number,
  updates: { name?: string; info?: string; meals?: string }
) => {
  return await prisma.dish.update({
    where: { id },
    data: updates,
  });
};

export const getDishesByDiseaseId = async (diseaseId: number) => {
  return await prisma.dish.findMany({
    where: {
      diseases: {
        some: {
          id: diseaseId,
        },
      },
    },
  });
};

export const deleteDishById = async (dishId: number) => {
  return await prisma.dish.delete({
    where: { id: dishId },
  });
};
