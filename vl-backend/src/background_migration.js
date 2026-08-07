const { PrismaClient } = require('./generated/client');
const migrateStudents = require('../uploads/migrate_students');

async function run() {
  const prisma = new PrismaClient();
  try {
    await migrateStudents(prisma);
  } catch (error) {
    console.error('Background migration error:', error);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

run();
