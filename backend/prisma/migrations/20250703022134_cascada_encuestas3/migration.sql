-- DropForeignKey
ALTER TABLE "EncuestaParticipacion" DROP CONSTRAINT "EncuestaParticipacion_encuestaId_fkey";

-- DropForeignKey
ALTER TABLE "Opcion" DROP CONSTRAINT "Opcion_preguntaId_fkey";

-- DropForeignKey
ALTER TABLE "Pregunta" DROP CONSTRAINT "Pregunta_encuestaId_fkey";

-- DropForeignKey
ALTER TABLE "Respuesta" DROP CONSTRAINT "Respuesta_opcionId_fkey";

-- DropForeignKey
ALTER TABLE "Respuesta" DROP CONSTRAINT "Respuesta_participacionId_fkey";

-- DropForeignKey
ALTER TABLE "Respuesta" DROP CONSTRAINT "Respuesta_preguntaId_fkey";

-- AddForeignKey
ALTER TABLE "Pregunta" ADD CONSTRAINT "Pregunta_encuestaId_fkey" FOREIGN KEY ("encuestaId") REFERENCES "Encuesta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Opcion" ADD CONSTRAINT "Opcion_preguntaId_fkey" FOREIGN KEY ("preguntaId") REFERENCES "Pregunta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EncuestaParticipacion" ADD CONSTRAINT "EncuestaParticipacion_encuestaId_fkey" FOREIGN KEY ("encuestaId") REFERENCES "Encuesta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Respuesta" ADD CONSTRAINT "Respuesta_participacionId_fkey" FOREIGN KEY ("participacionId") REFERENCES "EncuestaParticipacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
