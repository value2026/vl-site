const prisma = require('./src/db');

async function check() {
  // Check all subjects and their isActive status
  const subjects = await prisma.subject.findMany({
    include: {
      _count: { select: { labs: true } }
    },
    orderBy: { createdAt: 'asc' }
  });

  console.log('\n=== ALL SUBJECTS ===');
  for (const s of subjects) {
    console.log(`[${s.isActive ? 'ACTIVE' : 'INACTIVE'}] "${s.title}" (id: ${s.id}) — ${s._count.labs} labs`);
  }

  // Check labs for Computer Science
  const csSub = subjects.find(s => s.title.toLowerCase().includes('computer science'));
  if (csSub) {
    const labs = await prisma.lab.findMany({
      where: { subjectId: csSub.id },
      include: {
        _count: { select: { experiments: { where: { isActive: true } } } }
      }
    });
    console.log(`\n=== LABS IN "${csSub.title}" (isActive: ${csSub.isActive}) ===`);
    for (const l of labs) {
      console.log(`  [${l.isActive ? 'ACTIVE' : 'INACTIVE'}] "${l.title}" — ${l._count.experiments} active experiments`);
    }
  }
}

check()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
