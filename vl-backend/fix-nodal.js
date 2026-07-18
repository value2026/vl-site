const { PrismaClient } = require('./src/generated/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const hashed = await bcrypt.hash('VLNodal@2024', 12);

  // Reset nodal centre password and ensure correct email/name
  const updated = await prisma.user.updateMany({
    where: { role: 'nodal_centre' },
    data: { password: hashed, email: 'nodal@virtuallabs.in', name: 'Nodal Centre', isActive: true }
  });
  console.log('Updated nodal centre users:', updated.count);

  const nodal = await prisma.user.findFirst({ where: { role: 'nodal_centre' } });
  if (!nodal) { console.log('No nodal centre found!'); return; }

  console.log('Nodal centre:', nodal.name, nodal.email);

  // Link all teachers to nodal centre
  const t = await prisma.user.updateMany({
    where: { role: 'teacher' },
    data: { nodalCentreId: nodal.id }
  });
  console.log('Linked teachers:', t.count);

  // Link all students to nodal centre, and set createdById to teacher
  const teacherUser = await prisma.user.findFirst({ where: { role: 'teacher' } });
  const s = await prisma.user.updateMany({
    where: { role: 'student' },
    data: { nodalCentreId: nodal.id, createdById: teacherUser ? teacherUser.id : undefined }
  });
  console.log('Linked students:', s.count);

  console.log('Done!');
}

main()
  .then(() => prisma.$disconnect())
  .catch(e => { console.error(e); prisma.$disconnect(); process.exit(1); });
