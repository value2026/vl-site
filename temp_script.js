const { PrismaClient } = require('./vl-backend/src/generated/client');
const prisma = new PrismaClient();

async function main() {
  const responses = await prisma.surveyResponse.findMany({
    where: { pageSlug: 'nodal-centre-request' },
    orderBy: { createdAt: 'desc' },
    take: 1
  });
  console.log(JSON.stringify(responses, null, 2));
}

main().finally(() => prisma.$disconnect());
