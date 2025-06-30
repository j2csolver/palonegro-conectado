import express from 'express';
import prisma from '../prismaClient.js';
import { verificarToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Solo usuarios autenticados (Residente, Administrador, Tesorero) pueden crear denuncias
router.post('/', verificarToken, requireRole('Residente', 'Administrador', 'Tesorero'), async (req, res) => {
  const { contenido, estado } = req.body;
  const autorId = req.user.id;
  const denuncia = await prisma.denuncia.create({
    data: { contenido, autorId, estado }
  });
  res.json(denuncia);
});

// Solo el Administrador puede ver todas las denuncias
router.get('/', verificarToken, requireRole('Administrador'), async (req, res) => {
  const denuncias = await prisma.denuncia.findMany();
  res.json(denuncias);
});

export default router;