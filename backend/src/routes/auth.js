import express from 'express';
import prisma from '../prismaClient.js';
import bcrypt from 'bcryptjs';
import { generarToken } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

router.post('/login', authLimiter, async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Credenciales inválidas' });

  const token = generarToken({ id: user.id, rol: user.rol });
  res.json({ token, user: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol } });
});

export default router;