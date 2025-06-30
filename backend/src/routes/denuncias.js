import express from 'express';
import prisma from '../prismaClient.js';
import { verificarToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Denuncias
 *   description: Endpoints para gestión de denuncias comunitarias
 */

/**
 * @swagger
 * /denuncias:
 *   post:
 *     summary: Crea una denuncia (Residente, Administrador o Tesorero)
 *     tags: [Denuncias]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DenunciaInput'
 *     responses:
 *       200:
 *         description: Denuncia creada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Denuncia'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 */
router.post('/', verificarToken, requireRole('Residente', 'Administrador', 'Tesorero'), async (req, res) => {
  const { contenido, estado } = req.body;
  const autorId = req.user.id;
  const denuncia = await prisma.denuncia.create({
    data: { contenido, autorId, estado }
  });
  res.json(denuncia);
});

/**
 * @swagger
 * /denuncias:
 *   get:
 *     summary: Obtiene todas las denuncias (solo Administrador)
 *     tags: [Denuncias]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de denuncias
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Denuncia'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 */
router.get('/', verificarToken, requireRole('Administrador'), async (req, res) => {
  const denuncias = await prisma.denuncia.findMany();
  res.json(denuncias);
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Denuncia:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         contenido:
 *           type: string
 *         fecha:
 *           type: string
 *           format: date-time
 *         autorId:
 *           type: integer
 *         estado:
 *           type: string
 *     DenunciaInput:
 *       type: object
 *       properties:
 *         contenido:
 *           type: string
 *         estado:
 *           type: string
 */

export default router;