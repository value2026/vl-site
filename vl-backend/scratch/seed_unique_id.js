const { PrismaClient } = require('./src/generated/client');
const prisma = new PrismaClient();

async function main() {
  const page = await prisma.page.findUnique({ where: { slug: 'nodal-centres' } });
  if (!page) {
    console.log('Nodal centres page not found, skip manual seed.');
    return;
  }

  const uniqueIdSection = {
    sectionKey: 'nc_unique_id',
    label: 'Unique Login ID',
    order: 3,
    title: 'Unique Login ID',
    subtitle: 'Registered Nodal Centres receive a unique institutional login ID granting access to exclusive faculty features, progress tracking, and lab management tools.',
    content: {
      tag: 'Access',
      instructions: 'Nodal coordinator can submit the list of students and faculty members for obtaining the unique login id in the prescribed format to virtual_labs@am.amrita.edu with the subject line - Login ID request - your institute name.',
      templateLink: 'https://vlab.amrita.edu/userfiles/1/file/login_id_template.xlsx',
      templateLabel: 'Click Here To Download Login ID Template',
      features: [
        { icon: 'KeyRound', title: 'Institutional Login', desc: 'A dedicated login ID tied to your institution for centralized access management.' },
        { icon: 'ClipboardList', title: 'Lab Exam Setup', desc: 'Set up, schedule, and monitor online virtual lab exams directly from your dashboard.' },
        { icon: 'Users', title: 'Student Enrollment', desc: 'Enroll students under your nodal centre and track their experiment completions and scores.' },
        { icon: 'Award', title: 'Results Reporting', desc: 'Generate and export detailed performance reports for students and faculty.' },
      ]
    }
  };

  await prisma.pageSection.upsert({
    where: { pageId_sectionKey: { pageId: page.id, sectionKey: uniqueIdSection.sectionKey } },
    update: {},
    create: {
      pageId: page.id,
      sectionKey: uniqueIdSection.sectionKey,
      label: uniqueIdSection.label,
      title: uniqueIdSection.title,
      content: uniqueIdSection.content,
      isVisible: true,
      order: uniqueIdSection.order,
    },
  });

  console.log('Successfully seeded nc_unique_id section.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
