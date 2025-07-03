import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import tesoreriaRoutes from './routes/tesoreria.js';
import noticiaRoutes from './routes/noticias.js';
import comentarioRoutes from './routes/comentarios.js';
import eventoRoutes from './routes/eventos.js';
import reglaRoutes from './routes/reglas.js';
import quejaRoutes from './routes/quejas.js';
import encuestaRoutes from './routes/encuestas.js';
import notificacionRoutes from './routes/notificaciones.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tesoreria', tesoreriaRoutes);
app.use('/api/noticias', noticiaRoutes);
app.use('/api/comentarios', comentarioRoutes);
app.use('/api/eventos', eventoRoutes);
app.use('/api/reglas', reglaRoutes);
app.use('/api/quejas', quejaRoutes);
app.use('/api/encuestas', encuestaRoutes);
app.use('/api/notificaciones', notificacionRoutes);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/', (req, res) => res.send('API Palonegro Conectado funcionando'));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Servidor escuchando en puerto ${PORT}`));