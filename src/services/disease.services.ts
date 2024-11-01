// src/services/diseaseService.ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Service to add a new disease
export const createDisease = async (
  name: string,
  desc: string,
  prevention: string
) => {
  return await prisma.disease.create({
    data: { name, desc, prevention },
  });
};

// Service to update an existing disease
export const updateDiseaseById = async (
  id: number,
  updates: { name?: string; desc?: string; prevention?: string }
) => {
  return await prisma.disease.update({
    where: { id },
    data: updates,
  });
};

// Service to retrieve all diseases
export const getAllDisease = async () => {
  return await prisma.disease.findMany();
};

// Service to retrieve a single disease by ID
export const getDiseaseById = async (id: number) => {
  return await prisma.disease.findUnique({
    where: { id },
  });
};
// Service to add dishes to a disease
export const addDishesToDisease = async (
  diseaseId: number,
  dishIds: number[]
) => {
  const dishesToConnect = dishIds.map((id) => ({ id }));

  // Update the disease to connect the dishes
  const updatedDisease = await prisma.disease.update({
    where: { id: diseaseId },
    data: {
      dishes: {
        connect: dishesToConnect,
      },
    },
  });

  return updatedDisease;
};

export const deleteDiseaseById = async (diseaseId: number) => {
  return await prisma.disease.delete({
    where: { id: diseaseId },
  });
};
