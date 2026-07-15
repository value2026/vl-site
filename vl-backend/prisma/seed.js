const { PrismaClient } = require('../src/generated/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Create or Find default users
  const adminEmail = 'admin@virtuallabs.in';
  let admin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!admin) {
    const hashed = await bcrypt.hash('VLAdmin@2024', 12);
    admin = await prisma.user.create({
      data: {
        name: 'Super Admin',
        email: adminEmail,
        password: hashed,
        role: 'admin',
      },
    });
    console.log('✅ Admin user created!');
  } else {
    console.log('ℹ️ Admin user already exists.');
  }

  // Create default student if not exists
  const studentEmail = 'student@virtuallabs.in';
  const studentExists = await prisma.user.findUnique({ where: { email: studentEmail } });
  if (!studentExists) {
    const hashed = await bcrypt.hash('VLStudent@2024', 12);
    await prisma.user.create({
      data: {
        name: 'John Student',
        email: studentEmail,
        password: hashed,
        role: 'student',
      },
    });
    console.log('✅ Student user created!');
  }

  // Create default teacher if not exists
  const teacherEmail = 'teacher@virtuallabs.in';
  const teacherExists = await prisma.user.findUnique({ where: { email: teacherEmail } });
  if (!teacherExists) {
    const hashed = await bcrypt.hash('VLTeacher@2024', 12);
    await prisma.user.create({
      data: {
        name: 'Dr. Jane Smith',
        email: teacherEmail,
        password: hashed,
        role: 'teacher',
      },
    });
    console.log('✅ Teacher user created!');
  }

  // Get teacher record (needed for linking)
  const teacher = await prisma.user.findUnique({ where: { email: teacherEmail } });

  // Create default nodal centre if not exists
  const nodalEmail = 'nodal@virtuallabs.in';
  let nodalCentre = await prisma.user.findUnique({ where: { email: nodalEmail } });
  if (!nodalCentre) {
    const hashed = await bcrypt.hash('VLNodal@2024', 12);
    nodalCentre = await prisma.user.create({
      data: {
        name: 'Nodal Centre',
        email: nodalEmail,
        password: hashed,
        role: 'nodal_centre',
        createdById: admin.id,
      },
    });
    console.log('✅ Nodal Centre user created!');
  }

  // Link teacher to nodal centre (if not already linked)
  if (teacher && !teacher.nodalCentreId) {
    await prisma.user.update({
      where: { id: teacher.id },
      data: { nodalCentreId: nodalCentre.id, createdById: nodalCentre.id }
    });
  }

  // Link default student to teacher + nodal centre (so they appear in contacts)
  const defaultStudent = await prisma.user.findUnique({ where: { email: 'student@virtuallabs.in' } });
  if (defaultStudent && !defaultStudent.createdById && teacher) {
    await prisma.user.update({
      where: { id: defaultStudent.id },
      data: { createdById: teacher.id, nodalCentreId: nodalCentre.id }
    });
  }

  // Link extra students (alice, bob, charlie) to teacher + nodal centre
  const extraStudentEmails = ['alice@virtuallabs.in', 'bob@virtuallabs.in', 'charlie@virtuallabs.in'];
  for (const email of extraStudentEmails) {
    const s = await prisma.user.findUnique({ where: { email } });
    if (s) {
      await prisma.user.update({
        where: { id: s.id },
        data: {
          createdById: teacher?.id || null,
          nodalCentreId: nodalCentre.id
        }
      });
    }
  }

  // 2. Clear existing subjects/labs/experiments if any to prevent duplicates on re-seed
  // Order of deletion: Experiment -> Lab -> Subject
  await prisma.experiment.deleteMany({});
  await prisma.lab.deleteMany({});
  await prisma.subject.deleteMany({});
  console.log('🧹 Cleaned existing lab/experiment structures.');

  // 3. Define Seed Data
  const subjectsData = [
    {
      title: 'Computer Science',
      icon: '💻',
      description: 'Explore programming, algorithms, data structures, and computer networking.',
      gradient: 'from-blue-600 to-indigo-700',
      labs: [
        {
          title: 'Data Structures Lab',
          icon: '🔬',
          description: 'Hands-on practice with stacks, queues, linked lists, trees, and hash tables.',
          experiments: [
            {
              title: 'Stack Operations',
              description: 'Learn stack concepts using Push, Pop, and Peek operations with live visualization.',
              duration: '45 min',
              difficulty: 'Beginner',
            },
            {
              title: 'Queue Operations',
              description: 'Understand linear and circular queues using Enqueue and Dequeue operations.',
              duration: '45 min',
              difficulty: 'Beginner',
            },
            {
              title: 'Binary Search Tree',
              description: 'Visualize insertion, deletion, and traversals (Inorder, Preorder, Postorder) of a BST.',
              duration: '60 min',
              difficulty: 'Intermediate',
            }
          ]
        },
        {
          title: 'Computer Networks Lab',
          icon: '🌐',
          description: 'Simulate networks, routing protocols, subnetting, and TCP handshake concepts.',
          experiments: [
            {
              title: 'IP Subnetting',
              description: 'Calculate subnet masks, network addresses, and broadcast addresses for IPv4 networks.',
              duration: '60 min',
              difficulty: 'Intermediate',
            },
            {
              title: 'TCP Three-Way Handshake',
              description: 'Simulate connection establishment and termination processes in transmission control protocol.',
              duration: '45 min',
              difficulty: 'Intermediate',
            }
          ]
        }
      ]
    },
    {
      title: 'Chemistry',
      icon: '🧪',
      description: 'Interact with virtual retorts, acids, bases, and examine organic reactions.',
      gradient: 'from-emerald-600 to-green-700',
      labs: [
        {
          title: 'Physical Chemistry Lab',
          icon: '⚗️',
          description: 'Measure reaction rates, thermodynamic variables, and perform acid-base titrations.',
          experiments: [
            {
              title: 'Acid-Base Titration',
              description: 'Determine the concentration of an acid by neutralizing it with a standard base.',
              duration: '45 min',
              difficulty: 'Beginner',
            },
            {
              title: 'Chemical Kinetics',
              description: 'Study the effect of concentration and temperature on the rate of reaction.',
              duration: '60 min',
              difficulty: 'Intermediate',
            }
          ]
        },
        {
          title: 'Organic Chemistry Lab',
          icon: '🧫',
          description: 'Understand purification techniques, chromatography, and reaction synthesis.',
          experiments: [
            {
              title: 'Paper Chromatography',
              description: 'Separate different pigments in ink based on their solubility in a mobile phase.',
              duration: '30 min',
              difficulty: 'Beginner',
            }
          ]
        }
      ]
    },
    {
      title: 'Physics',
      icon: '⚛️',
      description: 'Explore kinematic forces, optics, thermodynamics, and electromagnetism.',
      gradient: 'from-amber-500 to-orange-600',
      labs: [
        {
          title: 'Mechanics Lab',
          icon: '📐',
          description: 'Analyze mechanical movements, projectile dynamics, and wave oscillations.',
          experiments: [
            {
              title: 'Projectile Motion',
              description: 'Simulate launches with varying angles, velocities, and gravity settings.',
              duration: '45 min',
              difficulty: 'Beginner',
            },
            {
              title: 'Simple Pendulum',
              description: 'Verify the laws of simple pendulum and determine the acceleration due to gravity.',
              duration: '30 min',
              difficulty: 'Beginner',
            }
          ]
        },
        {
          title: 'Optics Lab',
          icon: '🔭',
          description: 'Examine light paths, diffraction patterns, reflection, and refraction indices.',
          experiments: [
            {
              title: 'Young\'s Double Slit Experiment',
              description: 'Study wave interference of light and determine the wavelength of light source.',
              duration: '60 min',
              difficulty: 'Advanced',
            }
          ]
        }
      ]
    }
  ];

  // 4. Insert Seed Data
  for (const sData of subjectsData) {
    const subject = await prisma.subject.create({
      data: {
        title: sData.title,
        icon: sData.icon,
        description: sData.description,
        gradient: sData.gradient,
        createdById: admin.id,
      }
    });
    console.log(`📚 Created Subject: ${subject.title}`);

    for (const lData of sData.labs) {
      const lab = await prisma.lab.create({
        data: {
          title: lData.title,
          icon: lData.icon,
          description: lData.description,
          subjectId: subject.id,
          createdById: admin.id,
        }
      });
      console.log(`   🔬 Created Lab: ${lab.title}`);

      for (const eData of lData.experiments) {
        // Automatically make Stack Operations dynamic on default simulation fallback
        const exp = await prisma.experiment.create({
          data: {
            title: eData.title,
            description: eData.description,
            duration: eData.duration,
            difficulty: eData.difficulty,
            labId: lab.id,
            createdById: admin.id,
            // Stack Operations will use the fallback react simulation
            simulationPath: eData.title === 'Stack Operations' ? null : null,
          }
        });
        console.log(`      ⚗️ Created Experiment: ${exp.title}`);
      }
    }
  }

  // 5. Insert Mock Analytics Data
  const student = await prisma.user.findFirst({ where: { role: 'student' } });
  const teacherForAnalytics = await prisma.user.findFirst({ where: { role: 'teacher' } });
  const allExps = await prisma.experiment.findMany();

  if (student && allExps.length > 0) {
    console.log('📈 Seeding mock analytics events...');
    const nowTime = new Date();

    // Add extra mock students for academic reports to look rich
    const extraStudents = [
      { name: 'Alice Johnson', email: 'alice@virtuallabs.in' },
      { name: 'Bob Roberts', email: 'bob@virtuallabs.in' },
      { name: 'Charlie Brown', email: 'charlie@virtuallabs.in' },
    ];

    const studentUsers = [student];
    for (const est of extraStudents) {
      let estUser = await prisma.user.findUnique({ where: { email: est.email } });
      if (!estUser) {
        const hashed = await bcrypt.hash('VLStudent@2024', 12);
        estUser = await prisma.user.create({
          data: {
            name: est.name,
            email: est.email,
            password: hashed,
            role: 'student',
            nodalCentreId: teacherForAnalytics?.nodalCentreId || null, // Group them to make report work
          },
        });
      }
      studentUsers.push(estUser);
    }

    // Generate visits over past 15 days
    const devicesList = ['desktop', 'mobile', 'tablet'];
    const browsersList = ['chrome', 'firefox', 'safari'];

    for (const sUser of studentUsers) {
      for (let i = 0; i < 15; i++) {
        // Random date in the past
        const date = new Date(nowTime.getTime() - i * 24 * 60 * 60 * 1000);
        // Random experiment
        const randomExp = allExps[Math.floor(Math.random() * allExps.length)];

        // Record 1-3 visits per day
        const visitCount = Math.floor(Math.random() * 3) + 1;
        for (let vc = 0; vc < visitCount; vc++) {
          await prisma.experimentVisit.create({
            data: {
              userId: sUser.id,
              experimentId: randomExp.id,
              duration: Math.floor(Math.random() * 600) + 120, // 2-12 minutes
              device: devicesList[Math.floor(Math.random() * devicesList.length)],
              browser: browsersList[Math.floor(Math.random() * browsersList.length)],
              createdAt: date,
            },
          });
        }

        // 50% chance of quiz attempt
        if (Math.random() > 0.5) {
          const maxScore = 5;
          const score = Math.floor(Math.random() * 4) + 2; // Score between 2 and 5
          const passed = score >= 3;
          await prisma.quizAttempt.create({
            data: {
              userId: sUser.id,
              experimentId: randomExp.id,
              quizType: Math.random() > 0.5 ? 'pretest' : 'posttest',
              score,
              maxScore,
              passed,
              createdAt: date,
            },
          });
        }

        // 30% chance of feedback
        if (Math.random() > 0.7) {
          const comments = [
            'Very helpful simulation!',
            'Understood stack concepts easily.',
            'Optics lab was realistic.',
            'Nice explanation of aim and theory.',
            'Smooth frame rate on simulation.',
          ];
          await prisma.feedback.create({
            data: {
              userId: sUser.id,
              experimentId: randomExp.id,
              rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 stars
              comment: comments[Math.floor(Math.random() * comments.length)],
              createdAt: date,
            },
          });
        }
      }
    }
    console.log('✅ Analytics events seeded successfully.');
  }

  console.log('✅ Seed complete successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
