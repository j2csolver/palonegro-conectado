import express from 'express';
import { PrismaClient } from '@prisma/client';
const router = express.Router();
const prisma = new PrismaClient();

/**
 * @swagger
 * tags:
 *   name: Quejas
 *   description: Endpoints para gestión de quejas comunitarias
 */

/**
 * @swagger
 * /quejas:
 *   get:
 *     summary: Obtiene todas las quejas
 *     tags: [Quejas]
 *     responses:
 *       200:
 *         description: Lista de quejas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Queja'
 */
router.get('/', async (req, res) => {
  try {
    const quejas = await prisma.queja.findMany({
      include: { usuario: true },
      orderBy: { fecha: 'desc' }
    });
    res.json(quejas);
  } catch (error) {
    res.status(500).json({ error: 'No se pudieron cargar las quejas' });
  }
});

/**
 * @swagger
 * /quejas:
 *   post:
 *     summary: Crea una queja
 *     tags: [Quejas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/QuejaInput'
 *     responses:
 *       201:
 *         description: Queja creada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Queja'
 *       500:
 *         description: Error al crear la queja
 */
router.post('/', async (req, res) => {
  try {
    const { titulo, descripcion, usuarioId } = req.body;
    const nuevaQueja = await prisma.queja.create({
      data: {
        titulo,
        descripcion,
        usuarioId: usuarioId || null
      }
    });
    res.status(201).json(nuevaQueja);
  } catch (error) {
    res.status(500).json({ error: 'No se pudo crear la queja' });
  }
});

/**
 * @swagger
 * /quejas/{id}:
 *   get:
 *     summary: Obtiene una queja por ID
 *     tags: [Quejas]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la queja
 *     responses:
 *       200:
 *         description: Queja encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Queja'
 *       404:
 *         description: Queja no encontrada
 */
router.get('/:id', async (req, res) => {
  try {
    const queja = await prisma.queja.findUnique({
      where: { id: Number(req.params.id) },
      include: { usuario: true }
    });
    if (!queja) return res.status(404).json({ error: 'Queja no encontrada' });
    res.json(queja);
  } catch (error) {
    res.status(500).json({ error: 'Error al buscar la queja' });
  }
});

/**
 * @swagger
 * /quejas/{id}:
 *   put:
 *     summary: Edita una queja
 *     tags: [Quejas]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la queja
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/QuejaInput'
 *     responses:
 *       200:
 *         description: Queja actualizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Queja'
 *       404:
 *         description: Queja no encontrada
 *       500:
 *         description: Error al actualizar la queja
 */
router.put('/:id', async (req, res) => {
  try {
    const { titulo, descripcion } = req.body;
    const quejaActualizada = await prisma.queja.update({
      where: { id: Number(req.params.id) },
      data: { titulo, descripcion }
    });
    res.json(quejaActualizada);
  } catch (error) {
    res.status(500).json({ error: 'No se pudo actualizar la queja' });
  }
});

/**
 * @swagger
 * /quejas/{id}:
 *   delete:
 *     summary: Elimina una queja
 *     tags: [Quejas]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la queja
 *     responses:
 *       200:
 *         description: Queja eliminada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *       404:
 *         description: Queja no encontrada
 *       500:
 *         description: Error al eliminar la queja
 */
router.delete('/:id', async (req, res) => {
  try {
    await prisma.queja.delete({
      where: { id: Number(req.params.id) }
    });
    res.json({ ok: true });
  } catch (error) {
    res.status(404).json({ error: 'Queja no encontrada' });
  }
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Queja:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         titulo:
 *           type: string
 *         descripcion:
 *           type: string
 *         fecha:
 *           type: string
 *           format: date-time
 *         usuarioId:
 *           type: integer
 *           nullable: true
 *         usuario:
 *           type: object
 *           nullable: true
 *     QuejaInput:
 *       type: object
 *       properties:
 *         titulo:
 *           type: string
 *         descripcion:
 *           type: string
 *         usuarioId:
 *           type: integer
 *           nullable: true
 */

export default router;