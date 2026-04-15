require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

async function reset() {
  await p.booking.deleteMany();
  await p.eventType.deleteMany();
  await p.availabilityRule.deleteMany();
  await p.availabilitySchedule.deleteMany();
  await p.user.deleteMany();
  console.log("Cleared all data");
  await p.$disconnect();
}

reset();
