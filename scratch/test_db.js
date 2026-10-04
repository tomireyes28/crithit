const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$connect();
    console.log('✅ Conexión exitosa a la base de datos!');
    const count = await prisma.game.count();
    console.log('Total juegos en DB:', count);
    const sample = await prisma.game.findFirst({ select: { name: true, slug: true } });
    console.log('Juego muestra:', sample);
  } catch (err) {
    console.error('❌ Error de conexión:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
