const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const users = await prisma.user.findMany();
  console.log('Users:', users);
  
  const eventTypes = await prisma.eventType.findMany();
  console.log('Event types count:', eventTypes.length);
  if (eventTypes.length > 0) {
    console.log('First event type userId:', eventTypes[0].userId);
  }
}
check().finally(() => prisma.$disconnect());
