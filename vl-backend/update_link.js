const { PrismaClient } = require('./src/generated/client');
const prisma = new PrismaClient();

async function main() {
  const page = await prisma.page.findUnique({ where: { slug: 'nodal-centres' } });
  if (!page) return;

  const section = await prisma.pageSection.findUnique({
    where: { pageId_sectionKey: { pageId: page.id, sectionKey: 'nc_unique_id' } }
  });

  if (section && section.content) {
    const content = section.content;
    content.templateLink = '/login_id_template.xlsx';
    
    await prisma.pageSection.update({
      where: { id: section.id },
      data: { content }
    });
    console.log('Updated db templateLink to local file.');
  }
}

main().finally(() => prisma.$disconnect());
