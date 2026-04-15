// ============================================
// DATABASE CONNECTION — Prisma Singleton
// ============================================
// Why singleton? In development, nodemon restarts the server frequently.
// Without this pattern, each restart creates a new PrismaClient,
// eventually exhausting the database connection pool.

const { PrismaClient } = require("@prisma/client");

let prisma;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  // In dev, reuse the same client across hot-reloads
  if (!global._prisma) {
    global._prisma = new PrismaClient();
  }
  prisma = global._prisma;
}

module.exports = prisma;
