/*
  Warnings:

  - You are about to drop the `DiseaseDish` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "DiseaseDish" DROP CONSTRAINT "DiseaseDish_diseaseId_fkey";

-- DropForeignKey
ALTER TABLE "DiseaseDish" DROP CONSTRAINT "DiseaseDish_dishId_fkey";

-- DropTable
DROP TABLE "DiseaseDish";

-- CreateTable
CREATE TABLE "_DishDiseases" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_DishDiseases_AB_unique" ON "_DishDiseases"("A", "B");

-- CreateIndex
CREATE INDEX "_DishDiseases_B_index" ON "_DishDiseases"("B");

-- AddForeignKey
ALTER TABLE "_DishDiseases" ADD CONSTRAINT "_DishDiseases_A_fkey" FOREIGN KEY ("A") REFERENCES "Disease"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DishDiseases" ADD CONSTRAINT "_DishDiseases_B_fkey" FOREIGN KEY ("B") REFERENCES "Dish"("id") ON DELETE CASCADE ON UPDATE CASCADE;
