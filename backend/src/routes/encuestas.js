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
router.get(
  '/',
  verificarToken,
  requireRole('Residente', 'Administrador'),
  async (req, res) => {
    const encuestas = await prisma.encuesta.findMany({
      include: { preguntas: { include: { opciones: true } } }
    });
    res.json(encuestas);
  }
);

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
router.get(
  '/:id',
  verificarToken,
  requireRole('Residente', 'Administrador'),
  async (req, res) => {
    const encuesta = await prisma.encuesta.findUnique({
      where: { id: Number(req.params.id) },
      include: { preguntas: { include: { opciones: true } } }
    });
    if (!encuesta) return res.status(404).json({ error: 'Encuesta no encontrada' });
    res.json(encuesta);
  }
);

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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               respuestas:
 *                 type: object
 *                 additionalProperties:
 *                   type: integer
 *                 description:
 *                   preguntaId: opcionId
 *             example:
 *               respuestas:
 *                 "1": 10
 *                 "2": 21
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
  const { respuestas } = req.body; // { [preguntaId]: opcionId }

  // Crea la participación
  const participacion = await prisma.encuestaParticipacion.create({
    data: {
      usuarioId,
      encuestaId,
      respuestas: {
        create: Object.entries(respuestas).map(([preguntaId, opcionId]) => ({
          preguntaId: Number(preguntaId),
          opcionId: Number(opcionId)
        }))
      }
    },
    include: { respuestas: true }
  });

  res.json(participacion);
});

/**
 * @swagger
 * /encuestas/{id}/resultados:
 *   get:
 *     summary: Obtiene los resultados de una encuesta agrupados por pregunta y opción
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
 *         description: Resultados de la encuesta
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               additionalProperties:
 *                 type: object
 *                 additionalProperties:
 *                   type: integer
 *             example:
 *               "1":
 *                 "10": 5
 *                 "11": 2
 *               "2":
 *                 "20": 3
 *                 "21": 4
 *       404:
 *         description: Encuesta no encontrada
 *       500:
 *         description: Error al obtener los resultados
 */
router.get(
  '/:id/resultados',
  verificarToken,
  requireRole('Residente', 'Administrador'),
  async (req, res) => {
    const encuestaId = Number(req.params.id);
    try {
      // Trae todas las respuestas de participaciones de esa encuesta
      const respuestas = await prisma.respuesta.findMany({
        where: { participacion: { encuestaId } }
      });

      // Agrupa por pregunta y opción
      const resultados = {};
      respuestas.forEach(r => {
        if (!resultados[r.preguntaId]) resultados[r.preguntaId] = {};
        if (!resultados[r.preguntaId][r.opcionId]) resultados[r.preguntaId][r.opcionId] = 0;
        resultados[r.preguntaId][r.opcionId]++;
      });

      res.json(resultados);
    } catch (error) {
      res.status(500).json({ error: 'No se pudieron obtener los resultados de la encuesta' });
    }
  }
);

/**
 * @swagger
 * /encuestas/{id}/participacion:
 *   get:
 *     summary: Verifica si el usuario autenticado ya participó en la encuesta
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
 *         description: Estado de participación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 yaParticipo:
 *                   type: boolean
 *             example:
 *               yaParticipo: true
 *       401:
 *         description: No autorizado
 */
router.get('/:id/participacion', verificarToken, requireRole('Residente', 'Administrador'), async (req, res) => {
  const encuestaId = Number(req.params.id);
  const usuarioId = req.user.id;
  const participacion = await prisma.encuestaParticipacion.findFirst({
    where: { encuestaId, usuarioId }
  });
  res.json({ yaParticipo: !!participacion });
});

/**
 * @swagger
 * /encuestas/{id}:
 *   put:
 *     summary: Activa o desactiva una encuesta (solo Administrador)
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               activa:
 *                 type: boolean
 *             example:
 *               activa: false
 *     responses:
 *       200:
 *         description: Encuesta actualizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Encuesta'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 *       500:
 *         description: No se pudo actualizar la encuesta
 */
router.put('/:id', verificarToken, requireRole('Administrador'), async (req, res) => {
  const { id } = req.params;
  const { activa } = req.body;
  try {
    const encuesta = await prisma.encuesta.update({
      where: { id: Number(id) },
      data: { activa }
    });
    res.json(encuesta);
  } catch (error) {
    res.status(500).json({ error: 'No se pudo actualizar la encuesta' });
  }
});

/**
 * @swagger
 * /encuestas/{id}:
 *   delete:
 *     summary: Elimina una encuesta por ID (solo Administrador)
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
 *         description: Encuesta eliminada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Encuesta eliminada correctamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 *       500:
 *         description: No se pudo eliminar la encuesta
 */
router.delete('/:id', verificarToken, requireRole('Administrador'), async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.encuesta.delete({
      where: { id: Number(id) }
    });
    res.json({ message: 'Encuesta eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'No se pudo eliminar la encuesta' });
  }
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