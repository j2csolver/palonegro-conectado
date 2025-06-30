import express from 'express';
import prisma from '../prismaClient.js';
import { verificarToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Solo usuarios autenticados (Administrador, Residente, Tesorero) pueden comentar
router.post('/:noticiaId', verificarToken, requireRole('Administrador', 'Residente', 'Tesorero'), async (req, res) => {
  const { contenido } = req.body;
  const autorId = req.user.id;
  const comentario = await prisma.comentario.create({
    data: { contenido, noticiaId: Number(req.params.noticiaId), autorId }
  });
  res.json(comentario);
});

// Obtener comentarios es público
router.get('/:noticiaId', async (req, res) => {
  const comentarios = await prisma.comentario.findMany({
    where: { noticiaId: Number(req.params.noticiaId) }
  });
  res.json(comentarios);
});

export default router;