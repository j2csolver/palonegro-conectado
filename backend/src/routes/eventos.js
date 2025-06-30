import express from 'express';
import prisma from '../prismaClient.js';
import { verificarToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Eventos
 *   description: Endpoints para gestión de eventos comunitarios
 */

/**
 * @swagger
 * /eventos:
 *   get:
 *     summary: Obtiene todos los eventos
 *     tags: [Eventos]
 *     responses:
 *       200:
 *         description: Lista de eventos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Evento'
 */
router.get('/', async (req, res) => {
  const eventos = await prisma.evento.findMany();
  res.json(eventos);
});

/**
 * @swagger
 * /eventos:
 *   post:
 *     summary: Crea un evento (solo Administrador)
 *     tags: [Eventos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EventoInput'
 *     responses:
 *       200:
 *         description: Evento creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Evento'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 */
router.post('/', verificarToken, requireRole('Administrador'), async (req, res) => {
  const { titulo, descripcion, fecha, publicado } = req.body;
  const autorId = req.user.id;
  const evento = await prisma.evento.create({
    data: { titulo, descripcion, fecha: new Date(fecha), publicado, autorId }
  });
  res.json(evento);
});

/**
 * @swagger
 * /eventos/{id}:
 *   get:
 *     summary: Obtiene un evento por ID
 *     tags: [Eventos]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del evento
 *     responses:
 *       200:
 *         description: Evento encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Evento'
 *       404:
 *         description: Evento no encontrado
 */
router.get('/:id', async (req, res) => {
  const evento = await prisma.evento.findUnique({ where: { id: Number(req.params.id) } });
  if (!evento) return res.status(404).json({ error: 'Evento no encontrado' });
  res.json(evento);
});

/**
 * @swagger
 * /eventos/{id}:
 *   put:
 *     summary: Edita un evento (solo Administrador)
 *     tags: [Eventos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del evento
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EventoInput'
 *     responses:
 *       200:
 *         description: Evento actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Evento'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 *       404:
 *         description: Evento no encontrado
 */
router.put('/:id', verificarToken, requireRole('Administrador'), async (req, res) => {
  const { titulo, descripcion, fecha, publicado } = req.body;
  try {
    const evento = await prisma.evento.update({
      where: { id: Number(req.params.id) },
      data: { titulo, descripcion, fecha: new Date(fecha), publicado }
    });
    res.json(evento);
  } catch {
    res.status(404).json({ error: 'Evento no encontrado' });
  }
});

/**
 * @swagger
 * /eventos/{id}:
 *   delete:
 *     summary: Elimina un evento (solo Administrador)
 *     tags: [Eventos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del evento
 *     responses:
 *       200:
 *         description: Evento eliminado
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
 *         description: Evento no encontrado
 */
router.delete('/:id', verificarToken, requireRole('Administrador'), async (req, res) => {
  try {
    await prisma.evento.delete({ where: { id: Number(req.params.id) } });
    res.json({ ok: true });
  } catch {
    res.status(404).json({ error: 'Evento no encontrado' });
  }
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Evento:
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
 *         publicado:
 *           type: boolean
 *         autorId:
 *           type: integer
 *     EventoInput:
 *       type: object
 *       properties:
 *         titulo:
 *           type: string
 *         descripcion:
 *           type: string
 *         fecha:
 *           type: string
 *           format: date-time
 *         publicado:
 *           type: boolean
 */

export default router;