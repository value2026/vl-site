const { PrismaClient } = require('../src/generated/client');
const prisma = new PrismaClient();
prisma.experiment.findUnique({ where: { id: 'b0345919-ec61-499a-8440-3be1216fad39' } })
  .then(x => console.log(x))
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
