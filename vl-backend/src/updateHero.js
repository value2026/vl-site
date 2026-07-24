const { PrismaClient } = require('./generated/client');
const prisma = new PrismaClient();

async function updateHero() {
  const section = await prisma.pageSection.findFirst({
    where: { sectionKey: 'hero' }
  });

  if (section) {
    const updatedContent = typeof section.content === 'string' ? JSON.parse(section.content) : section.content || {};
    updatedContent.ctaPrimaryHref = '#labs-heading';

    await prisma.pageSection.update({
      where: { id: section.id },
      data: {
        content: updatedContent
      }
    });
    console.log('Updated hero section in DB');
  } else {
    console.log('Hero section not found in DB');
  }
}

updateHero().finally(() => process.exit(0));
