/*
  Warnings:

  - Made the column `usuarioId` on table `Queja` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Queja" DROP CONSTRAINT "Queja_usuarioId_fkey";

-- AlterTable
ALTER TABLE "Queja" ALTER COLUMN "usuarioId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Queja" ADD CONSTRAINT "Queja_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
