import express from 'express';
import prisma from '../prismaClient.js';
import { verificarToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: Endpoints para gestión de usuarios
 */

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Obtiene el perfil de un usuario (solo el propio usuario o administrador)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Perfil de usuario
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 *       404:
 *         description: Usuario no encontrado
 */
router.get('/:id', verificarToken, async (req, res) => {
  const userId = Number(req.params.id);
  if (req.user.id !== userId && req.user.rol !== 'Administrador') {
    return res.status(403).json({ error: 'Acceso denegado' });
  }
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
  res.json(user);
});

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Actualiza el perfil de usuario (solo el propio usuario o administrador)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserUpdateInput'
 *     responses:
 *       200:
 *         description: Usuario actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 *       404:
 *         description: Usuario no encontrado
 */
router.put('/:id', verificarToken, async (req, res) => {
  const userId = Number(req.params.id);
  if (req.user.id !== userId && req.user.rol !== 'Administrador') {
    return res.status(403).json({ error: 'Acceso denegado' });
  }
  const { nombre, email } = req.body;
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { nombre, email }
    });
    res.json(user);
  } catch {
    res.status(404).json({ error: 'Usuario no encontrado' });
  }
});

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         nombre:
 *           type: string
 *         email:
 *           type: string
 *         rol:
 *           type: string
 *     UserUpdateInput:
 *       type: object
 *       properties:
 *         nombre:
 *           type: string
 *         email:
 *           type: string
 */

export default router;