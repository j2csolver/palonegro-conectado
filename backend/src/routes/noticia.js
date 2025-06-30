import express from 'express';
import prisma from '../prismaClient.js';
import { verificarToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Obtener noticias (público)
router.get('/', async (req, res) => {
  const noticias = await prisma.noticia.findMany();
  res.json(noticias);
});

// Crear noticia (solo Administrador)
router.post('/', verificarToken, requireRole('Administrador'), async (req, res) => {
  const { titulo, contenido, categoria, publicado } = req.body;
  const autorId = req.user.id;
  const noticia = await prisma.noticia.create({
    data: { titulo, contenido, categoria, publicado, autorId }
  });
  res.json(noticia);
});

// Obtener noticia por id (público)
router.get('/:id', async (req, res) => {
  const noticia = await prisma.noticia.findUnique({ where: { id: Number(req.params.id) } });
  if (!noticia) return res.status(404).json({ error: 'Noticia no encontrada' });
  res.json(noticia);
});

// Editar noticia (solo Administrador)
router.put('/:id', verificarToken, requireRole('Administrador'), async (req, res) => {
  const { titulo, contenido, categoria, publicado } = req.body;
  try {
    const noticia = await prisma.noticia.update({
      where: { id: Number(req.params.id) },
      data: { titulo, contenido, categoria, publicado }
    });
    res.json(noticia);
  } catch {
    res.status(404).json({ error: 'Noticia no encontrada' });
  }
});

// Eliminar noticia (solo Administrador)
router.delete('/:id', verificarToken, requireRole('Administrador'), async (req, res) => {
  try {
    await prisma.noticia.delete({ where: { id: Number(req.params.id) } });
    res.json({ ok: true });
  } catch {
    res.status(404).json({ error: 'Noticia no encontrada' });
  }
});

export default router;