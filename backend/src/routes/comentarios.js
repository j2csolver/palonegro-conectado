import express from 'express';
import prisma from '../prismaClient.js';
import { verificarToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Comentarios
 *   description: Endpoints para gestión de comentarios en noticias
 */

/**
 * @swagger
 * /comentarios/{noticiaId}:
 *   post:
 *     summary: Agrega un comentario a una noticia
 *     tags: [Comentarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: noticiaId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la noticia a comentar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ComentarioInput'
 *     responses:
 *       200:
 *         description: Comentario creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comentario'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 */
router.post('/:noticiaId', verificarToken, requireRole('Administrador', 'Residente', 'Tesorero'), async (req, res) => {
  const { contenido } = req.body;
  const autorId = req.user.id;
  const comentario = await prisma.comentario.create({
    data: { contenido, noticiaId: Number(req.params.noticiaId), autorId }
  });
  res.json(comentario);
});

/**
 * @swagger
 * /comentarios/{noticiaId}:
 *   get:
 *     summary: Obtiene los comentarios de una noticia
 *     tags: [Comentarios]
 *     parameters:
 *       - in: path
 *         name: noticiaId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la noticia
 *     responses:
 *       200:
 *         description: Lista de comentarios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comentario'
 */
router.get('/:noticiaId', async (req, res) => {
  const comentarios = await prisma.comentario.findMany({
    where: { noticiaId: Number(req.params.noticiaId) }
  });
  res.json(comentarios);
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Comentario:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         contenido:
 *           type: string
 *         fecha:
 *           type: string
 *           format: date-time
 *         noticiaId:
 *           type: integer
 *         autorId:
 *           type: integer
 *     ComentarioInput:
 *       type: object
 *       properties:
 *         contenido:
 *           type: string
 */

export default router;