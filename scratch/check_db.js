const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const notifications = await prisma.notification.findMany();
  console.log('Total notifications:', notifications.length);
  console.log(JSON.stringify(notifications, null, 2));
}

main().finally(() => prisma.$disconnect());
