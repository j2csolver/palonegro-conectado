import express from 'express';
import prisma from '../prismaClient.js';
import { verificarToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Obtener eventos (público)
router.get('/', async (req, res) => {
  const eventos = await prisma.evento.findMany();
  res.json(eventos);
});

// Crear evento (solo Administrador)
router.post('/', verificarToken, requireRole('Administrador'), async (req, res) => {
  const { titulo, descripcion, fecha, publicado } = req.body;
  const autorId = req.user.id;
  const evento = await prisma.evento.create({
    data: { titulo, descripcion, fecha: new Date(fecha), publicado, autorId }
  });
  res.json(evento);
});

// Obtener evento por id (público)
router.get('/:id', async (req, res) => {
  const evento = await prisma.evento.findUnique({ where: { id: Number(req.params.id) } });
  if (!evento) return res.status(404).json({ error: 'Evento no encontrado' });
  res.json(evento);
});

// Editar evento (solo Administrador)
router.put('/:id', verificarToken, requireRole('Administrador'), async (req, res) => {
  const { titulo, descripcion, fecha, publicado } = req.body;
  try {
    const evento = await prisma.evento.update({
      where: { id: Number(req.params.id) },
      data: { titulo, descripcion, fecha: new Date(fecha), publicado }
    });
    res.json(evento);
  } catch {
    res.status(404).json({ error: 'Evento no encontrado' });
  }
});

// Eliminar evento (solo Administrador)
router.delete('/:id', verificarToken, requireRole('Administrador'), async (req, res) => {
  try {
    await prisma.evento.delete({ where: { id: Number(req.params.id) } });
    res.json({ ok: true });
  } catch {
    res.status(404).json({ error: 'Evento no encontrado' });
  }
});

export default router;