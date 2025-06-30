import express from 'express';
import prisma from '../prismaClient.js';
import { verificarToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Sugerencias
 *   description: Endpoints para gestión de sugerencias comunitarias
 */

/**
 * @swagger
 * /sugerencias:
 *   post:
 *     summary: Crea una sugerencia (Residente, Administrador o Tesorero)
 *     tags: [Sugerencias]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SugerenciaInput'
 *     responses:
 *       200:
 *         description: Sugerencia creada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Sugerencia'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 */
router.post('/', verificarToken, requireRole('Residente', 'Administrador', 'Tesorero'), async (req, res) => {
  const { contenido } = req.body;
  const autorId = req.user.id;
  const sugerencia = await prisma.sugerencia.create({
    data: { contenido, autorId }
  });
  res.json(sugerencia);
});

/**
 * @swagger
 * /sugerencias:
 *   get:
 *     summary: Obtiene todas las sugerencias (solo Administrador)
 *     tags: [Sugerencias]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de sugerencias
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Sugerencia'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 */
router.get('/', verificarToken, requireRole('Administrador'), async (req, res) => {
  const sugerencias = await prisma.sugerencia.findMany();
  res.json(sugerencias);
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Sugerencia:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         contenido:
 *           type: string
 *         autorId:
 *           type: integer
 *         fecha:
 *           type: string
 *           format: date-time
 *     SugerenciaInput:
 *       type: object
 *       properties:
 *         contenido:
 *           type: string
 */

export default router;