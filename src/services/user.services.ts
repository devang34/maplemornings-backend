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
