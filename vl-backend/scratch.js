const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.experiment.findMany({ where: { simulationPath: { contains: 'build' } } })
  .then(x => console.log(x))
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
