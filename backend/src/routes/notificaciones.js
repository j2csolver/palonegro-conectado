import express from 'express';
import prisma from '../prismaClient.js';
import { verificarToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Notificaciones
 *   description: Endpoints para gestión de notificaciones de usuario
 */

/**
 * @swagger
 * /notificaciones:
 *   get:
 *     summary: Obtiene las notificaciones del usuario autenticado
 *     tags: [Notificaciones]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de notificaciones
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Notificacion'
 *       401:
 *         description: No autorizado
 */
router.get('/', verificarToken, async (req, res) => {
  const usuarioId = req.user.id;
  const notificaciones = await prisma.notificacion.findMany({
    where: { usuarioId }
  });
  res.json(notificaciones);
});

/**
 * @swagger
 * /notificaciones/{id}/leida:
 *   put:
 *     summary: Marca una notificación como leída (solo el usuario dueño)
 *     tags: [Notificaciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la notificación
 *     responses:
 *       200:
 *         description: Notificación actualizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notificacion'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 *       404:
 *         description: Notificación no encontrada
 */
router.put('/:id/leida', verificarToken, async (req, res) => {
  const usuarioId = req.user.id;
  try {
    // Verifica que la notificación pertenezca al usuario
    const notificacion = await prisma.notificacion.findUnique({
      where: { id: Number(req.params.id) }
    });
    if (!notificacion || notificacion.usuarioId !== usuarioId) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }
    const actualizada = await prisma.notificacion.update({
      where: { id: Number(req.params.id) },
      data: { leida: true }
    });
    res.json(actualizada);
  } catch {
    res.status(404).json({ error: 'Notificación no encontrada' });
  }
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Notificacion:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         mensaje:
 *           type: string
 *         usuarioId:
 *           type: integer
 *         leida:
 *           type: boolean
 *         fecha:
 *           type: string
 *           format: date-time
 */

export default router;