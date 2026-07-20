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
              id: 'cbf34d52-0faa-4905-a232-5eeeba2a2775',
              title: 'Expectation Value Calculation in Quantum Systems',
              description: 'Calculate expectation values of observables for various parameterized quantum state vectors.',
              duration: '60 min',
              difficulty: 'Intermediate',
            },
            {
              id: '29682e5b-0b22-44cc-b2de-b8539d5d732c',
              title: 'Factorization Using Shor\'s Algorithm',
              description: 'Simulate Shor\'s period-finding quantum circuits to factor prime products.',
              duration: '90 min',
              difficulty: 'Advanced',
            },
            {
              id: '90eb30b9-88e7-4168-a352-6411714ae3dc',
              title: 'Variational Quantum Eigensolver (VQE) Optimization',
              description: 'Solve for the ground state energy of molecular Hamiltonians using parameterized ansatz circuits.',
              duration: '75 min',
              difficulty: 'Advanced',
            },
            {
              id: '906ca3d5-f1b1-4754-a459-db045046702b',
              title: 'Quantum Measurement and Result Interpretation',
              description: 'Observe quantum measurement collapse, state tomography, and evaluate probability distributions.',
              duration: '45 min',
              difficulty: 'Beginner',
            },
            {
              id: '265ae76d-5ee7-45ea-ba3c-3c2494a2228a',
              title: 'Quantum Linear Algebra – Matrix and Vector Operations',
              description: 'Explore quantum algorithms for systems of linear equations and state vector operations.',
              duration: '60 min',
              difficulty: 'Intermediate',
            },
            {
              id: 'd2528cd1-d1cc-4088-aadb-aa4cac1aadac',
              title: 'Applied Linear Algebra – Quantum Gates in Action',
              description: 'Apply Hadamard, Pauli, CNOT, and phase gates in quantum circuits to observe state rotations.',
              duration: '60 min',
              difficulty: 'Intermediate',
            },
            {
              id: '6f6e8a5f-8143-4a28-935a-85f96a3fe0d3',
              title: 'Quantum Kernel Alignment in Machine Learning',
              description: 'Optimize quantum kernel parameters to increase data separability in high-dimensional feature spaces.',
              duration: '90 min',
              difficulty: 'Advanced',
            },
            {
              id: '963217c5-6059-4f77-a5ea-2b0dbfbe3747',
              title: 'Quantum Support Vector Machines (QSVM)',
              description: 'Classify complex data distributions using quantum-enhanced kernels and support vectors.',
              duration: '90 min',
              difficulty: 'Advanced',
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
      labs: []
    },
    {
      title: 'Physics',
      icon: '⚛️',
      description: 'Explore kinematic forces, optics, thermodynamics, and electromagnetism.',
      gradient: 'from-amber-500 to-orange-600',
      labs: []
    },
    {
      title: 'Chemical Science',
      icon: '🧪',
      description: 'Explore chemical systems, molecular reactions, and physical chemistry principles.',
      gradient: 'from-teal-500 to-cyan-600',
      labs: [
        {
          title: 'Physical Chemistry Virtual Lab',
          icon: '⚗️',
          description: 'Explore spectrophotometry, cryoscopy, ebullioscopy and EMF measurement.',
          experiments: [
            {
              id: '83c0fc70-8367-4598-93ed-09cb565c06f4',
              title: 'Spectrophotometry',
              description: 'Measure the absorption of light by a chemical substance as a function of wavelength.',
              duration: '60 min',
              difficulty: 'Intermediate',
            },
            {
              id: 'fb645967-38e2-4244-8204-bda3b83e8587',
              title: 'Cryoscopy',
              description: 'Determine the depression of freezing point to calculate molecular mass.',
              duration: '60 min',
              difficulty: 'Intermediate',
            },
            {
              id: 'da92a101-b214-41d1-817a-24adff0bf12b',
              title: 'Ebullioscopy',
              description: 'Determine the elevation of boiling point of a solvent due to a solute.',
              duration: '60 min',
              difficulty: 'Intermediate',
            },
            {
              id: 'd9e0499b-4322-42f5-8d5f-4279ba8588dc',
              title: 'EMF Measurement',
              description: 'Measure electromotive force of galvanic cells to study thermodynamics.',
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
        const expId = eData.id || undefined;
        let contentPath = null;
        let simulationPath = null;

        if (expId) {
          const fs = require('fs');
          const path = require('path');
          const uploadsDir = path.join(__dirname, '../uploads/experiments', expId);
          if (fs.existsSync(path.join(uploadsDir, 'content'))) {
            contentPath = `experiments/${expId}/content`;
          }
          if (fs.existsSync(path.join(uploadsDir, 'simulation'))) {
            simulationPath = `experiments/${expId}/simulation`;
          }
        }

        const exp = await prisma.experiment.create({
          data: {
            id: expId,
            title: eData.title,
            description: eData.description,
            duration: eData.duration,
            difficulty: eData.difficulty,
            labId: lab.id,
            createdById: admin.id,
            contentPath,
            simulationPath: simulationPath || (eData.title === 'Stack Operations' ? null : null),
          }
        });
        console.log(`      ⚗️ Created Experiment: ${exp.title} (${exp.id})`);
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
