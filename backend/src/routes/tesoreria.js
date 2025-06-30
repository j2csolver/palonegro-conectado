import express from 'express';
import prisma from '../prismaClient.js';
import { verificarToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Todas las rutas de tesorería solo pueden ser accedidas por usuarios con rol "Tesorero"
router.use(verificarToken, requireRole('Tesorero'));

/**
 * @swagger
 * tags:
 *   name: Tesoreria
 *   description: Endpoints para gestión de transacciones de tesorería
 */

/**
 * @swagger
 * /tesoreria:
 *   get:
 *     summary: Obtiene todas las transacciones
 *     tags: [Tesoreria]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de transacciones
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Transaccion'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 */
router.get('/', async (req, res) => {
  const transacciones = await prisma.transaccion.findMany();
  res.json(transacciones);
});

/**
 * @swagger
 * /tesoreria:
 *   post:
 *     summary: Crea una transacción
 *     tags: [Tesoreria]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TransaccionInput'
 *     responses:
 *       200:
 *         description: Transacción creada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transaccion'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 */
router.post('/', async (req, res) => {
  const { tipo, categoria, monto, descripcion, comprobante } = req.body;
  const tesoreroId = req.user.id;
  const transaccion = await prisma.transaccion.create({
    data: { tipo, categoria, monto, descripcion, comprobante, tesoreroId }
  });
  res.json(transaccion);
});

/**
 * @swagger
 * /tesoreria/{id}:
 *   get:
 *     summary: Obtiene una transacción por ID
 *     tags: [Tesoreria]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la transacción
 *     responses:
 *       200:
 *         description: Transacción encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transaccion'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 *       404:
 *         description: Transacción no encontrada
 */
router.get('/:id', async (req, res) => {
  const transaccion = await prisma.transaccion.findUnique({ where: { id: Number(req.params.id) } });
  if (!transaccion) return res.status(404).json({ error: 'Transacción no encontrada' });
  res.json(transaccion);
});

/**
 * @swagger
 * /tesoreria/{id}:
 *   put:
 *     summary: Edita una transacción
 *     tags: [Tesoreria]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la transacción
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TransaccionInput'
 *     responses:
 *       200:
 *         description: Transacción actualizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transaccion'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 *       404:
 *         description: Transacción no encontrada
 */
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

/**
 * @swagger
 * /tesoreria/{id}:
 *   delete:
 *     summary: Elimina una transacción
 *     tags: [Tesoreria]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la transacción
 *     responses:
 *       200:
 *         description: Transacción eliminada
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
 *         description: Transacción no encontrada
 */
router.delete('/:id', async (req, res) => {
  try {
    await prisma.transaccion.delete({ where: { id: Number(req.params.id) } });
    res.json({ ok: true });
  } catch {
    res.status(404).json({ error: 'Transacción no encontrada' });
  }
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Transaccion:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         tipo:
 *           type: string
 *         categoria:
 *           type: string
 *         monto:
 *           type: number
 *         descripcion:
 *           type: string
 *         comprobante:
 *           type: string
 *         tesoreroId:
 *           type: integer
 *     TransaccionInput:
 *       type: object
 *       properties:
 *         tipo:
 *           type: string
 *         categoria:
 *           type: string
 *         monto:
 *           type: number
 *         descripcion:
 *           type: string
 *         comprobante:
 *           type: string
 */

export default router;