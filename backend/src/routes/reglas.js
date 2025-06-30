import express from 'express';
import { PrismaClient } from '@prisma/client';
const router = express.Router();
const prisma = new PrismaClient();

/**
 * @swagger
 * tags:
 *   name: Reglas
 *   description: Endpoints para gestión de reglas de convivencia
 */

/**
 * @swagger
 * /reglas:
 *   get:
 *     summary: Obtiene todas las reglas
 *     tags: [Reglas]
 *     responses:
 *       200:
 *         description: Lista de reglas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Regla'
 */
router.get('/', async (req, res) => {
  try {
    const reglas = await prisma.regla.findMany({ orderBy: { fecha: 'desc' } });
    res.json(reglas);
  } catch (error) {
    res.status(500).json({ error: 'No se pudieron cargar las reglas' });
  }
});

/**
 * @swagger
 * /reglas:
 *   post:
 *     summary: Crea una nueva regla
 *     tags: [Reglas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReglaInput'
 *     responses:
 *       201:
 *         description: Regla creada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Regla'
 *       500:
 *         description: Error al crear la regla
 */
router.post('/', async (req, res) => {
  try {
    const { titulo, descripcion } = req.body;
    const nuevaRegla = await prisma.regla.create({
      data: { titulo, descripcion }
    });
    res.status(201).json(nuevaRegla);
  } catch (error) {
    res.status(500).json({ error: 'No se pudo crear la regla' });
  }
});

/**
 * @swagger
 * /reglas/{id}:
 *   get:
 *     summary: Obtiene una regla por ID
 *     tags: [Reglas]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la regla
 *     responses:
 *       200:
 *         description: Regla encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Regla'
 *       404:
 *         description: Regla no encontrada
 */
router.get('/:id', async (req, res) => {
  try {
    const regla = await prisma.regla.findUnique({
      where: { id: Number(req.params.id) }
    });
    if (!regla) return res.status(404).json({ error: 'Regla no encontrada' });
    res.json(regla);
  } catch (error) {
    res.status(500).json({ error: 'Error al buscar la regla' });
  }
});

/**
 * @swagger
 * /reglas/{id}:
 *   put:
 *     summary: Edita una regla
 *     tags: [Reglas]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la regla
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReglaInput'
 *     responses:
 *       200:
 *         description: Regla actualizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Regla'
 *       404:
 *         description: Regla no encontrada
 *       500:
 *         description: Error al actualizar la regla
 */
router.put('/:id', async (req, res) => {
  try {
    const { titulo, descripcion } = req.body;
    const reglaActualizada = await prisma.regla.update({
      where: { id: Number(req.params.id) },
      data: { titulo, descripcion }
    });
    res.json(reglaActualizada);
  } catch (error) {
    res.status(500).json({ error: 'No se pudo actualizar la regla' });
  }
});

/**
 * @swagger
 * /reglas/{id}:
 *   delete:
 *     summary: Elimina una regla
 *     tags: [Reglas]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la regla
 *     responses:
 *       200:
 *         description: Regla eliminada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *       404:
 *         description: Regla no encontrada
 *       500:
 *         description: Error al eliminar la regla
 */
router.delete('/:id', async (req, res) => {
  try {
    await prisma.regla.delete({
      where: { id: Number(req.params.id) }
    });
    res.json({ ok: true });
  } catch (error) {
    res.status(404).json({ error: 'Regla no encontrada' });
  }
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Regla:
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
 *     ReglaInput:
 *       type: object
 *       properties:
 *         titulo:
 *           type: string
 *         descripcion:
 *           type: string
 */

export default router;