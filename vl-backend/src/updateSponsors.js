const { PrismaClient } = require('./generated/client');
const prisma = new PrismaClient();

async function updateSponsors() {
  const section = await prisma.pageSection.findFirst({
    where: { sectionKey: 'sponsors' }
  });

  if (section) {
    const updatedContent = typeof section.content === 'string' ? JSON.parse(section.content) : section.content || {};
    updatedContent.sectionTag = 'OUR SPONSORS';
    updatedContent.titleHighlight = 'Virtual Labs';
    updatedContent.portalUrl = 'https://www.vlab.co.in';
    updatedContent.portalLabel = 'www.vlab.co.in';
    updatedContent.partnersTag = 'OUR PARTNERS';
    updatedContent.footerNote = 'A Government of India initiative to democratize quality STEM education';
    updatedContent.initiativeText = 'This project is an initiative of the Ministry of Education (MoE) under the National Mission on Education through ICT. These experiments and virtual labs are hosted for open access through the main project website,';
    updatedContent.sponsors = [
      {
        id: 'iit-bombay',
        name: 'IIT Bombay',
        theme: 'blue',
        logoUrl: '/logos/iit-bombay.svg',
        websiteUrl: 'https://www.iitb.ac.in',
      },
      {
        id: 'iit-delhi',
        name: 'IIT Delhi',
        theme: 'purple',
        logoUrl: '/logos/iit-delhi.svg',
        websiteUrl: 'https://home.iitd.ac.in',
      },
      {
        id: 'iit-madras',
        name: 'IIT Madras',
        theme: 'amber',
        logoUrl: '/logos/iit-madras.svg',
        websiteUrl: 'https://www.iitm.ac.in',
      },
    ];

    await prisma.pageSection.update({
      where: { id: section.id },
      data: {
        title: 'Partners & Sponsors of Virtual Labs',
        subtitle: 'This project is an initiative of the Ministry of Education (MoE) under the National Mission on Education through ICT. These experiments and virtual labs are hosted for open access through the main project website,',
        content: updatedContent,
      }
    });
    console.log('✅ Updated sponsors section in DB to reference design');
  } else {
    console.log('⚠️  Sponsors section not found in DB');
  }
}

updateSponsors().finally(() => process.exit(0));
