const { PrismaClient } = require('./src/generated/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Clearing nodalCentreId to allow migration...');
  await prisma.user.updateMany({
    data: {
      nodalCentreId: null
    }
  });
  
  // also need to clear lab.nodalCentreId just in case
  await prisma.lab.updateMany({
    data: {
      nodalCentreId: null
    }
  });
  console.log('Done.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
