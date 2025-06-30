import express from 'express';
import prisma from '../prismaClient.js';
import { verificarToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Todas las rutas de tesorería solo pueden ser accedidas por usuarios con rol "Tesorero"
router.use(verificarToken, requireRole('Tesorero'));

router.get('/', async (req, res) => {
  const transacciones = await prisma.transaccion.findMany();
  res.json(transacciones);
});

router.post('/', async (req, res) => {
  const { tipo, categoria, monto, descripcion, comprobante } = req.body;
  const tesoreroId = req.user.id;
  const transaccion = await prisma.transaccion.create({
    data: { tipo, categoria, monto, descripcion, comprobante, tesoreroId }
  });
  res.json(transaccion);
});

router.get('/:id', async (req, res) => {
  const transaccion = await prisma.transaccion.findUnique({ where: { id: Number(req.params.id) } });
  if (!transaccion) return res.status(404).json({ error: 'Transacción no encontrada' });
  res.json(transaccion);
});

router.put('/:id', async (req, res) => {
  const { tipo, categoria, monto, descripcion, comprobante } = req.body;
  try {
    const transaccion = await prisma.transaccion.update({
      where: { id: Number(req.params.id) },
      data: { tipo, categoria, monto, descripcion, comprobante }
    });
    res.json(transaccion);
  } catch {
    res.status(404).json({ error: 'Transacción no encontrada' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.transaccion.delete({ where: { id: Number(req.params.id) } });
    res.json({ ok: true });
  } catch {
    res.status(404).json({ error: 'Transacción no encontrada' });
  }
});

export default router;