const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateSponsors() {
  const page = await prisma.page.findUnique({ where: { slug: 'home' } });
  if (!page) return console.log('Home page not found in DB');

  const section = await prisma.pageSection.findFirst({
    where: { pageId: page.id, sectionKey: 'sponsors' }
  });

  if (section) {
    const updatedContent = typeof section.content === 'string' ? JSON.parse(section.content) : section.content || {};
    updatedContent.sectionTag = 'Our Sponsors';

    await prisma.pageSection.update({
      where: { id: section.id },
      data: {
        title: "Sponsors of Virtual Labs",
        subtitle: "This project is an initiative of Ministry of Human Resource Department under National Mission on Education through ICT. These experiments and labs will be hosted for open access through the main project website www.vlab.co.in.",
        content: updatedContent
      }
    });
    console.log('Updated sponsors section in DB');
  } else {
    console.log('Sponsors section not found in DB');
  }
}

updateSponsors().finally(() => process.exit(0));
