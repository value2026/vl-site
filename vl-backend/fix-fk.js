const { PrismaClient } = require('./src/generated/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe(`UPDATE users SET "nodalCentreId" = NULL WHERE "nodalCentreId" NOT IN (SELECT id FROM institutions)`);
  console.log('Fixed foreign keys');
}

main().catch(console.error).finally(() => prisma.$disconnect());
