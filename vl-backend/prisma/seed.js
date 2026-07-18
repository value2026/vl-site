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
          title: 'Quantum Computing Lab',
          icon: '⚛️',
          description: 'Hands-on simulations covering quantum state preparation, Shor\'s algorithm, VQE optimization, QSVM, and quantum machine learning.',
          experiments: [
            {
              title: 'Expectation Value Calculation in Quantum Systems',
              description: 'Calculate expectation values of observables for various parameterized quantum state vectors.',
              duration: '60 min',
              difficulty: 'Intermediate',
            },
            {
              title: 'Factorization Using Shor\'s Algorithm',
              description: 'Simulate Shor\'s period-finding quantum circuits to factor prime products.',
              duration: '90 min',
              difficulty: 'Advanced',
            },
            {
              title: 'Variational Quantum Eigensolver (VQE) Optimization',
              description: 'Solve for the ground state energy of molecular Hamiltonians using parameterized ansatz circuits.',
              duration: '75 min',
              difficulty: 'Advanced',
            },
            {
              title: 'Quantum Measurement and Result Interpretation',
              description: 'Observe quantum measurement collapse, state tomography, and evaluate probability distributions.',
              duration: '45 min',
              difficulty: 'Beginner',
            },
            {
              title: 'Quantum Linear Algebra – Matrix and Vector Operations',
              description: 'Explore quantum algorithms for systems of linear equations and state vector operations.',
              duration: '60 min',
              difficulty: 'Intermediate',
            },
            {
              title: 'Applied Linear Algebra – Quantum Gates in Action',
              description: 'Apply Hadamard, Pauli, CNOT, and phase gates in quantum circuits to observe state rotations.',
              duration: '60 min',
              difficulty: 'Intermediate',
            },
            {
              title: 'Quantum Kernel Alignment in Machine Learning',
              description: 'Optimize quantum kernel parameters to increase data separability in high-dimensional feature spaces.',
              duration: '90 min',
              difficulty: 'Advanced',
            },
            {
              title: 'Quantum Support Vector Machines (QSVM)',
              description: 'Classify complex data distributions using quantum-enhanced kernels and support vectors.',
              duration: '90 min',
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
        const specificId = {
          'Expectation Value Calculation in Quantum Systems': 'cbf34d52-0faa-4905-a232-5eeeba2a2775',
          'Factorization Using Shor\'s Algorithm': '3e16b36e-6443-46a5-992d-6a8595f984f6',
          'Variational Quantum Eigensolver (VQE) Optimization': '02f63ce2-8ee9-49da-84aa-fc847f6092e2',
          'Quantum Measurement and Result Interpretation': 'af183cbb-1a73-41d7-8f16-cc4337a63287',
          'Quantum Linear Algebra – Matrix and Vector Operations': '7e633a86-d25d-4cc5-9f61-b2fbd0f7f66c',
          'Applied Linear Algebra – Quantum Gates in Action': '500c175a-d20d-4146-b1a0-3b7274d40922',
          'Quantum Kernel Alignment in Machine Learning': '492bacfc-ecfd-4816-a8e0-6bdbbc657a99',
          'Quantum Support Vector Machines (QSVM)': '32f468e4-8f23-4653-8391-c89e25a16d8f'
        }[eData.title];

        const expData = {
          title: eData.title,
          description: eData.description,
          duration: eData.duration,
          difficulty: eData.difficulty,
          labId: lab.id,
          createdById: admin.id,
          simulationPath: eData.title === 'Stack Operations' ? null : (specificId ? 'experiments/' + specificId + '/simulation' : null),
          contentPath: specificId ? 'experiments/' + specificId + '/content' : null,
        };

        if (specificId) {
          expData.id = specificId;
        }

        const exp = await prisma.experiment.create({
          data: expData
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
