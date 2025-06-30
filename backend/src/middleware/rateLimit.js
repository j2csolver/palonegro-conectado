import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // máximo 10 intentos por IP cada 15 minutos
  message: { error: 'Demasiados intentos, intenta más tarde.' }
});