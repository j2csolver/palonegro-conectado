import express from 'express';
import prisma from '../prismaClient.js';
import { verificarToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Noticias
 *   description: Endpoints para gestión de noticias comunitarias
 */

/**
 * @swagger
 * /noticias:
 *   get:
 *     summary: Obtiene todas las noticias
 *     tags: [Noticias]
 *     responses:
 *       200:
 *         description: Lista de noticias
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Noticia'
 */
router.get('/', async (req, res) => {
  const noticias = await prisma.noticia.findMany();
  res.json(noticias);
});

/**
 * @swagger
 * /noticias:
 *   post:
 *     summary: Crea una noticia (solo Administrador)
 *     tags: [Noticias]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NoticiaInput'
 *     responses:
 *       200:
 *         description: Noticia creada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Noticia'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 */
router.post('/', verificarToken, requireRole('Administrador'), async (req, res) => {
  const { titulo, contenido, categoria, publicado } = req.body;
  const autorId = req.user.id;
  const noticia = await prisma.noticia.create({
    data: { titulo, contenido, categoria, publicado, autorId }
  });
  res.json(noticia);
});

/**
 * @swagger
 * /noticias/{id}:
 *   get:
 *     summary: Obtiene una noticia por ID
 *     tags: [Noticias]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la noticia
 *     responses:
 *       200:
 *         description: Noticia encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Noticia'
 *       404:
 *         description: Noticia no encontrada
 */
router.get('/:id', async (req, res) => {
  const noticia = await prisma.noticia.findUnique({ where: { id: Number(req.params.id) } });
  if (!noticia) return res.status(404).json({ error: 'Noticia no encontrada' });
  res.json(noticia);
});

/**
 * @swagger
 * /noticias/{id}:
 *   put:
 *     summary: Edita una noticia (solo Administrador)
 *     tags: [Noticias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la noticia
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NoticiaInput'
 *     responses:
 *       200:
 *         description: Noticia actualizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Noticia'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 *       404:
 *         description: Noticia no encontrada
 */
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

/**
 * @swagger
 * /noticias/{id}:
 *   delete:
 *     summary: Elimina una noticia (solo Administrador)
 *     tags: [Noticias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la noticia
 *     responses:
 *       200:
 *         description: Noticia eliminada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 *       404:
 *         description: Noticia no encontrada
 */
router.delete('/:id', verificarToken, requireRole('Administrador'), async (req, res) => {
  try {
    await prisma.noticia.delete({ where: { id: Number(req.params.id) } });
    res.json({ ok: true });
  } catch {
    res.status(404).json({ error: 'Noticia no encontrada' });
  }
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Noticia:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         titulo:
 *           type: string
 *         contenido:
 *           type: string
 *         categoria:
 *           type: string
 *         publicado:
 *           type: boolean
 *         autorId:
 *           type: integer
 *     NoticiaInput:
 *       type: object
 *       properties:
 *         titulo:
 *           type: string
 *         contenido:
 *           type: string
 *         categoria:
 *           type: string
 *         publicado:
 *           type: boolean
 */

export default router;