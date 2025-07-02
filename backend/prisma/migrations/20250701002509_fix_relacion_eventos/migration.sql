/*
  Warnings:

  - You are about to drop the column `fecha` on the `Evento` table. All the data in the column will be lost.
  - Added the required column `fechaFin` to the `Evento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fechaInicio` to the `Evento` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Evento" DROP COLUMN "fecha",
ADD COLUMN     "fechaFin" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "fechaInicio" TIMESTAMP(3) NOT NULL;
