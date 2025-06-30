import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashed = await bcrypt.hash('pruebaClave', 10);
  const user = await prisma.user.create({
    data: {
      nombre: 'Usuario Prueba',
      email: 'prueba@correo.com',
      password: hashed,
      rol: 'Administrador' // o 'Residente', 'Tesorero'
    }
  });
  console.log(user);
  await prisma.$disconnect();
}

main();