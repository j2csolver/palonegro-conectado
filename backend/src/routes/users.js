import express from 'express';
import prisma from '../prismaClient.js';
import { verificarToken } from '../middleware/auth.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: Endpoints para gestión de usuarios
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Obtener todos los usuarios (solo administrador)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 */
router.get('/', verificarToken, async (req, res) => {
  if (req.user.rol !== 'Administrador') {
    return res.status(403).json({ error: 'Acceso denegado' });
  }
  const users = await prisma.user.findMany({
    select: { id: true, nombre: true, email: true, rol: true }
  });
  res.json(users);
});

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Crear un usuario (solo administrador)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserCreateInput'
 *     responses:
 *       201:
 *         description: Usuario creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Solicitud incorrecta
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 */
router.post('/', verificarToken, async (req, res) => {
  if (req.user.rol !== 'Administrador') {
    return res.status(403).json({ error: 'Acceso denegado' });
  }
  const { nombre, email, rol, password } = req.body;
  if (!nombre || !email || !rol) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }
  const userPassword = password || 'Cambiar123'; // Contraseña estándar si no se envía
  try {
    // Cifrar la contraseña antes de guardar
    const hashedPassword = await bcrypt.hash(userPassword, 10);
    const user = await prisma.user.create({
      data: { nombre, email, rol, password: hashedPassword }
    });
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: 'No se pudo crear el usuario' });
  }
});

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
 * /users/{id}:
 *   delete:
 *     summary: Eliminar un usuario (solo administrador)
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
 *         description: Usuario eliminado
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 *       404:
 *         description: Usuario no encontrado
 */
router.delete('/:id', verificarToken, async (req, res) => {
  if (req.user.rol !== 'Administrador') {
    return res.status(403).json({ error: 'Acceso denegado' });
  }
  const userId = Number(req.params.id);
  try {
    await prisma.user.delete({ where: { id: userId } });
    res.json({ message: 'Usuario eliminado' });
  } catch {
    res.status(404).json({ error: 'Usuario no encontrado' });
  }
});

/**
 * @swagger
 * /users/cambiar-password:
 *   post:
 *     summary: Cambiar la contraseña de un usuario (propio o administrador)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               nuevaPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Contraseña cambiada
 *       400:
 *         description: Datos incompletos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 */
router.post('/cambiar-password', verificarToken, async (req, res) => {
  const { id, nuevaPassword } = req.body;
  if (!id || !nuevaPassword) {
    return res.status(400).json({ error: 'Datos incompletos' });
  }
  if (req.user.id !== id && req.user.rol !== 'Administrador') {
    return res.status(403).json({ error: 'No autorizado' });
  }
  try {
    const hashedPassword = await bcrypt.hash(nuevaPassword, 10);
    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword, debeCambiarPassword: false }
    });
    res.json({ message: 'Contraseña cambiada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al cambiar la contraseña' });
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
 *     UserCreateInput:
 *       type: object
 *       properties:
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