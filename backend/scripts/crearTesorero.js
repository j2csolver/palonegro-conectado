import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashed = await bcrypt.hash('tesoreroClave', 10);
  const user = await prisma.user.create({
    data: {
      nombre: 'Usuario Tesorero',
      email: 'tesorero@correo.com',
      password: hashed,
      rol: 'Tesorero' // o 'Residente', 'Administrador', etc.
    }
  });
  console.log(user);
  await prisma.$disconnect();
}

main();