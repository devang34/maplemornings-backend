/*
  Warnings:

  - You are about to drop the column `userId` on the `Dish` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Dish" DROP CONSTRAINT "Dish_userId_fkey";

-- AlterTable
ALTER TABLE "Dish" DROP COLUMN "userId";
