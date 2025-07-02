-- CreateTable
CREATE TABLE "Respuesta" (
    "id" SERIAL NOT NULL,
    "participacionId" INTEGER NOT NULL,
    "preguntaId" INTEGER NOT NULL,
    "opcionId" INTEGER NOT NULL,

    CONSTRAINT "Respuesta_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Respuesta" ADD CONSTRAINT "Respuesta_participacionId_fkey" FOREIGN KEY ("participacionId") REFERENCES "EncuestaParticipacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Respuesta" ADD CONSTRAINT "Respuesta_preguntaId_fkey" FOREIGN KEY ("preguntaId") REFERENCES "Pregunta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Respuesta" ADD CONSTRAINT "Respuesta_opcionId_fkey" FOREIGN KEY ("opcionId") REFERENCES "Opcion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
