// src/services/dishService.ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Service to add a new dish with associated diseases
export const createDish = async (
  name: string,
  info: string,
  meals: string,
  price: string,
  image: string,
  refrence: string,
  restaurantName: string,
  calorie: string
) => {
  // Create the dish in the database without connecting to diseases
  const dish = await prisma.dish.create({
    data: {
      name,
      info,
      meals,
      price,
      image,
      refrence,
      restaurantName,
      calorie,
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
  updates: {
    name?: string;
    info?: string;
    meals?: string;
    image?: string;
    calorie?: string;
    refrence: string;
    restaurantName: string;
  }
) => {
  return await prisma.dish.update({
    where: { id },
    data: updates,
  });
};

export const getDishesByDiseaseId = async (
  diseaseId: number,
  userId: number
) => {
  const dishes = await prisma.dish.findMany({
    where: {
      diseases: {
        some: {
          id: diseaseId,
        },
      },
    },
    include: {
      FavoriteDish: {
        where: { userId }, // Match favorites for the given user
        select: { id: true }, // Select favorite ID to check existence
      },
    },
  });

  // Map dishes to include `isFavorite` boolean
  return dishes.map((dish) => ({
    ...dish,
    isFavorite: dish.FavoriteDish.length > 0, // If favorite exists for the user, set true
  }));
};

export const deleteDishById = async (dishId: number) => {
  return await prisma.dish.delete({
    where: { id: dishId },
  });
};

export const addDishToFavorites = async (userId: number, dishId: number) => {
  const existingDish = await prisma.dish.findUnique({
    where: { id: dishId },
  });

  if (!existingDish) throw new Error("Dish Does not Exist");
  // Check if the dish is already in the user's favorites
  const existingFavorite = await prisma.favoriteDish.findFirst({
    where: { userId, dishId },
  });

  if (existingFavorite) {
    throw new Error("Dish is already in favorites");
  }

  // Add the dish to the user's favorite dishes
  const favoriteDish = await prisma.favoriteDish.create({
    data: {
      userId,
      dishId,
    },
  });

  return favoriteDish;
};

// Remove a dish from the user's favorite dishes
export const removeDishFromFavorites = async (
  userId: number,
  dishId: number
) => {
  // Check if the dish exists in the user's favorites
  const favoriteDish = await prisma.favoriteDish.findFirst({
    where: { userId, dishId },
  });

  if (!favoriteDish) {
    throw new Error("Dish not found in favorites");
  }

  // Remove the dish from favorites
  await prisma.favoriteDish.delete({
    where: { id: favoriteDish.id },
  });
};

// Get all favorite dishes for a user
export const getFavoriteDishes = async (userId: number) => {
  // Get all dishes in the user's favorites
  const favoriteDishes = await prisma.favoriteDish.findMany({
    where: { userId },
    include: { dish: true }, // Include dish details in the response
  });

  return favoriteDishes.map((fav) => fav.dish);
};
