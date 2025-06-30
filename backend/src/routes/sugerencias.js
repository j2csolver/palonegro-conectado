import express from 'express';
import prisma from '../prismaClient.js';
import { verificarToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Solo usuarios autenticados (Residente, Administrador, Tesorero) pueden crear sugerencias
router.post('/', verificarToken, requireRole('Residente', 'Administrador', 'Tesorero'), async (req, res) => {
  const { contenido } = req.body;
  const autorId = req.user.id;
  const sugerencia = await prisma.sugerencia.create({
    data: { contenido, autorId }
  });
  res.json(sugerencia);
});

// Solo el Administrador puede ver todas las sugerencias
router.get('/', verificarToken, requireRole('Administrador'), async (req, res) => {
  const sugerencias = await prisma.sugerencia.findMany();
  res.json(sugerencias);
});

export default router;