import express from 'express';
import prisma from '../prismaClient.js';
import { verificarToken } from '../middleware/auth.js';

const router = express.Router();

// Obtener notificaciones del usuario autenticado
router.get('/', verificarToken, async (req, res) => {
  const usuarioId = req.user.id;
  const notificaciones = await prisma.notificacion.findMany({
    where: { usuarioId }
  });
  res.json(notificaciones);
});

// Marcar notificación como leída (solo el usuario dueño)
router.put('/:id/leida', verificarToken, async (req, res) => {
  const usuarioId = req.user.id;
  try {
    // Verifica que la notificación pertenezca al usuario
    const notificacion = await prisma.notificacion.findUnique({
      where: { id: Number(req.params.id) }
    });
    if (!notificacion || notificacion.usuarioId !== usuarioId) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }
    const actualizada = await prisma.notificacion.update({
      where: { id: Number(req.params.id) },
      data: { leida: true }
    });
    res.json(actualizada);
  } catch {
    res.status(404).json({ error: 'Notificación no encontrada' });
  }
});

export default router;