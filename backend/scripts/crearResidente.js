import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashed = await bcrypt.hash('residenteClave', 10);
  const user = await prisma.user.create({
    data: {
      nombre: 'Usuario Residente',
      email: 'residente@correo.com',
      password: hashed,
      rol: 'Residente' // o 'Administrador', 'Tesorero'
    }
  });
  console.log(user);
  await prisma.$disconnect();
}

main();