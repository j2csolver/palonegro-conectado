import express from 'express';
import prisma from '../prismaClient.js';
import { verificarToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Obtener encuestas (público)
router.get('/', async (req, res) => {
  const encuestas = await prisma.encuesta.findMany({
    include: { preguntas: { include: { opciones: true } } }
  });
  res.json(encuestas);
});

// Crear encuesta (solo Administrador)
router.post('/', verificarToken, requireRole('Administrador'), async (req, res) => {
  const { titulo, activa, preguntas } = req.body;
  const encuesta = await prisma.encuesta.create({
    data: {
      titulo,
      activa,
      preguntas: {
        create: preguntas.map(p => ({
          texto: p.texto,
          opciones: { create: p.opciones.map(o => ({ texto: o })) }
        }))
      }
    },
    include: { preguntas: { include: { opciones: true } } }
  });
  res.json(encuesta);
});

// Obtener encuesta por id (público)
router.get('/:id', async (req, res) => {
  const encuesta = await prisma.encuesta.findUnique({
    where: { id: Number(req.params.id) },
    include: { preguntas: { include: { opciones: true } } }
  });
  if (!encuesta) return res.status(404).json({ error: 'Encuesta no encontrada' });
  res.json(encuesta);
});

// Participar en encuesta (Residente o Administrador)
router.post('/:id/responder', verificarToken, requireRole('Residente', 'Administrador'), async (req, res) => {
  const usuarioId = req.user.id;
  const encuestaId = Number(req.params.id);
  const participacion = await prisma.encuestaParticipacion.create({
    data: { usuarioId, encuestaId }
  });
  res.json(participacion);
});

export default router;