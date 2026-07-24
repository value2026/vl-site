const prisma = require('./src/db');

async function run() {
  const admin = await prisma.user.findFirst({ where: { role: 'admin' } });
  
  if (!admin) {
    console.error('No admin found!');
    return;
  }

  await prisma.workshop.create({
    data: {
      title: 'Faculty Development Program on Virtual Labs',
      description: 'A comprehensive online training session designed for faculty members to effectively integrate virtual labs into their curriculum. Learn how to track student progress and utilize the CMS.',
      date: new Date('2026-08-15T10:00:00Z'),
      status: 'approved',
      createdById: admin.id
    }
  });

  await prisma.workshop.create({
    data: {
      title: 'Student Orientation: Virtual Labs',
      description: 'An introductory workshop for students explaining how to register, navigate the platform, and submit quiz attempts for credit.',
      date: new Date('2026-09-01T14:30:00Z'),
      status: 'pending',
      createdById: admin.id
    }
  });

  console.log('Demo workshops created!');
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
