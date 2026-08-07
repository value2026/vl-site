const { PrismaClient } = require('./generated/client');
const migrateInstitutions = require('../uploads/migrate_institutions');
const migrateStudents = require('../uploads/migrate_students');

async function run() {
  const prisma = new PrismaClient();
  try {
    await migrateInstitutions(prisma);
    await migrateStudents(prisma);
  } catch (error) {
    console.error('Background migration error:', error);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

run();
