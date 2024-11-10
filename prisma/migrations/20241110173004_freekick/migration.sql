/*
  Warnings:

  - You are about to drop the column `gridIndex` on the `Challenge` table. All the data in the column will be lost.
  - You are about to drop the column `selectedGrid` on the `Challenge` table. All the data in the column will be lost.
  - Added the required column `position` to the `Challenge` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Challenge" DROP COLUMN "gridIndex",
DROP COLUMN "selectedGrid",
ADD COLUMN     "position" TEXT NOT NULL,
ADD COLUMN     "selectedPosition" TEXT;
