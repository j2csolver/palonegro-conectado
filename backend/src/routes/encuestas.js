import express from 'express';
import prisma from '../prismaClient.js';
import { verificarToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Encuestas
 *   description: Endpoints para gestión y participación en encuestas comunitarias
 */

/**
 * @swagger
 * /encuestas:
 *   get:
 *     summary: Obtiene todas las encuestas
 *     tags: [Encuestas]
 *     responses:
 *       200:
 *         description: Lista de encuestas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Encuesta'
 */
router.get('/', async (req, res) => {
  const encuestas = await prisma.encuesta.findMany({
    include: { preguntas: { include: { opciones: true } } }
  });
  res.json(encuestas);
});

/**
 * @swagger
 * /encuestas:
 *   post:
 *     summary: Crea una encuesta (solo Administrador)
 *     tags: [Encuestas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EncuestaInput'
 *     responses:
 *       200:
 *         description: Encuesta creada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Encuesta'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 */
router.post('/', verificarToken, requireRole('Administrador'), async (req, res) => {
  const { titulo, activa, preguntas } = req.body;
  const encuesta = await prisma.encuesta.create({
    data: {
      titulo,
      activa,
      preguntas: {
        create: preguntas.map(p => ({
          texto: p.texto,
          opciones: { create: p.opciones.map(o => ({ texto: o })) }
        }))
      }
    },
    include: { preguntas: { include: { opciones: true } } }
  });
  res.json(encuesta);
});

/**
 * @swagger
 * /encuestas/{id}:
 *   get:
 *     summary: Obtiene una encuesta por ID
 *     tags: [Encuestas]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la encuesta
 *     responses:
 *       200:
 *         description: Encuesta encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Encuesta'
 *       404:
 *         description: Encuesta no encontrada
 */
router.get('/:id', async (req, res) => {
  const encuesta = await prisma.encuesta.findUnique({
    where: { id: Number(req.params.id) },
    include: { preguntas: { include: { opciones: true } } }
  });
  if (!encuesta) return res.status(404).json({ error: 'Encuesta no encontrada' });
  res.json(encuesta);
});

/**
 * @swagger
 * /encuestas/{id}/responder:
 *   post:
 *     summary: Participar en una encuesta (Residente o Administrador)
 *     tags: [Encuestas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la encuesta
 *     responses:
 *       200:
 *         description: Participación registrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EncuestaParticipacion'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 */
router.post('/:id/responder', verificarToken, requireRole('Residente', 'Administrador'), async (req, res) => {
  const usuarioId = req.user.id;
  const encuestaId = Number(req.params.id);
  const participacion = await prisma.encuestaParticipacion.create({
    data: { usuarioId, encuestaId }
  });
  res.json(participacion);
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Encuesta:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         titulo:
 *           type: string
 *         activa:
 *           type: boolean
 *         preguntas:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Pregunta'
 *     Pregunta:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         texto:
 *           type: string
 *         opciones:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Opcion'
 *     Opcion:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         texto:
 *           type: string
 *     EncuestaInput:
 *       type: object
 *       properties:
 *         titulo:
 *           type: string
 *         activa:
 *           type: boolean
 *         preguntas:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               texto:
 *                 type: string
 *               opciones:
 *                 type: array
 *                 items:
 *                   type: string
 *     EncuestaParticipacion:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         usuarioId:
 *           type: integer
 *         encuestaId:
 *           type: integer
 *         fecha:
 *           type: string
 *           format: date-time
 */

export default router;