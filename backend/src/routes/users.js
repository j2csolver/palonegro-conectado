import express from 'express';
import prisma from '../prismaClient.js';
import { verificarToken } from '../middleware/auth.js';

const router = express.Router();

// Obtener perfil de usuario (solo el propio usuario o administrador)
router.get('/:id', verificarToken, async (req, res) => {
  const userId = Number(req.params.id);
  if (req.user.id !== userId && req.user.rol !== 'Administrador') {
    return res.status(403).json({ error: 'Acceso denegado' });
  }
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
  res.json(user);
});

// Actualizar perfil de usuario (solo el propio usuario o administrador)
router.put('/:id', verificarToken, async (req, res) => {
  const userId = Number(req.params.id);
  if (req.user.id !== userId && req.user.rol !== 'Administrador') {
    return res.status(403).json({ error: 'Acceso denegado' });
  }
  const { nombre, email } = req.body;
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { nombre, email }
    });
    res.json(user);
  } catch {
    res.status(404).json({ error: 'Usuario no encontrado' });
  }
});

export default router;