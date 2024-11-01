/*
  Warnings:

  - You are about to drop the column `diseaseId` on the `Dish` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Dish" DROP CONSTRAINT "Dish_diseaseId_fkey";

-- AlterTable
ALTER TABLE "Dish" DROP COLUMN "diseaseId";

-- CreateTable
CREATE TABLE "DiseaseDish" (
    "dishId" INTEGER NOT NULL,
    "diseaseId" INTEGER NOT NULL,

    CONSTRAINT "DiseaseDish_pkey" PRIMARY KEY ("dishId","diseaseId")
);

-- AddForeignKey
ALTER TABLE "DiseaseDish" ADD CONSTRAINT "DiseaseDish_dishId_fkey" FOREIGN KEY ("dishId") REFERENCES "Dish"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiseaseDish" ADD CONSTRAINT "DiseaseDish_diseaseId_fkey" FOREIGN KEY ("diseaseId") REFERENCES "Disease"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
