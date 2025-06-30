/*
  Warnings:

  - You are about to drop the `Denuncia` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Sugerencia` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Denuncia" DROP CONSTRAINT "Denuncia_autorId_fkey";

-- DropForeignKey
ALTER TABLE "Sugerencia" DROP CONSTRAINT "Sugerencia_autorId_fkey";

-- DropTable
DROP TABLE "Denuncia";

-- DropTable
DROP TABLE "Sugerencia";

-- CreateTable
CREATE TABLE "Regla" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Regla_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Queja" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioId" INTEGER,

    CONSTRAINT "Queja_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Queja" ADD CONSTRAINT "Queja_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
