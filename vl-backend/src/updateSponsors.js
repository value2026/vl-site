const { PrismaClient } = require('./generated/client');
const prisma = new PrismaClient();

async function updateSponsors() {
  const section = await prisma.pageSection.findFirst({
    where: { sectionKey: 'sponsors' }
  });

  if (section) {
    const updatedContent = typeof section.content === 'string' ? JSON.parse(section.content) : section.content || {};
    updatedContent.sectionTag = 'OUR PARTNERS';
    updatedContent.sponsors = [
      { id: 'moe',        name: 'Ministry of Education', acronym: 'MoE',    description: 'Government of India',  color: 'from-orange-500 to-red-500',    isSponsor: true  },
      { id: 'iit-bombay', name: 'IIT Bombay',            acronym: 'IITB',   description: 'Lead Institute',       color: 'from-blue-600 to-blue-800',     isSponsor: false },
      { id: 'nmeict',     name: 'NMEICT',                acronym: 'NMEICT', description: 'National Mission',     color: 'from-green-600 to-teal-700',    isSponsor: false },
      { id: 'iit-delhi',  name: 'IIT Delhi',             acronym: 'IITD',   description: 'Partner Institute',   color: 'from-purple-600 to-indigo-700', isSponsor: false },
      { id: 'iit-madras', name: 'IIT Madras',            acronym: 'IITM',   description: 'Partner Institute',   color: 'from-yellow-500 to-orange-600', isSponsor: false },
    ];

    await prisma.pageSection.update({
      where: { id: section.id },
      data: {
        title: 'Partners & Sponsors of Virtual Labs',
        subtitle: 'This project is an initiative of Ministry of Education under National Mission on Education through ICT. These experiments and labs will be hosted for open access through the main project website www.vlab.co.in.',
        content: updatedContent,
      }
    });
    console.log('✅ Updated sponsors section in DB');
  } else {
    console.log('⚠️  Sponsors section not found in DB');
  }
}

updateSponsors().finally(() => process.exit(0));
