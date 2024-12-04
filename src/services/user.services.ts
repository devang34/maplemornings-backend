import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const updateUserAgeDiseaseAndGetDiseaseInfo = async (
  userId: number,
  age: number,
  diseaseId: number
) => {
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { age, disease: diseaseId.toString() },
  });

  const diseaseData = await prisma.disease.findUnique({
    where: { id: diseaseId },
    include: {
      dishes: true,
    },
  });

  if (!diseaseData) {
    throw new Error("Disease not found");
  }

  return { updatedUser, diseaseData };
};
export const createContactUsMessage = async (
  email: string,
  message: string,
  userId: number
) => {
  try {
    const newMessage = await prisma.contactUs.create({
      data: {
        email,
        message,
        userId, // userId is now guaranteed to be provided from the authenticated user
      },
    });

    return newMessage;
  } catch (error: any) {
    throw new Error("Error creating contact message: " + error.message);
  }
};

export const getContactUsMessages = async (userId: number | null) => {
  try {
    if (userId) {
      // If userId is provided, retrieve messages for that user
      return await prisma.contactUs.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" }, // Optional: Sort by creation date
      });
    } else {
      // If no userId, retrieve all messages
      return await prisma.contactUs.findMany({
        orderBy: { createdAt: "desc" }, // Optional: Sort by creation date
      });
    }
  } catch (error: any) {
    throw new Error("Error retrieving contact messages: " + error.message);
  }
};
