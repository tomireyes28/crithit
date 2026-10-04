const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$connect();
    const users = await prisma.user.findMany({
      select: { id: true, email: true, username: true, role: true },
      take: 5,
    });
    console.log('Usuarios en BD:', users);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
