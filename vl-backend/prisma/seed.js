const { PrismaClient } = require('../src/generated/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Create or Find default users and institutions
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

  // Create default VL Manager
  const managerEmail = 'manager@virtuallabs.in';
  let manager = await prisma.user.findUnique({ where: { email: managerEmail } });
  if (!manager) {
    const hashed = await bcrypt.hash('VLManager@2024', 12);
    manager = await prisma.user.create({
      data: {
        name: 'VL Manager',
        email: managerEmail,
        password: hashed,
        role: 'vl_manager',
      },
    });
    console.log('✅ VL Manager created!');
  } else {
    console.log('ℹ️ VL Manager already exists.');
  }

  // Create Default Institutions with Legacy Metadata
  const defaultInstitutions = [
    { legacyId: 1, name: 'Amrita Vishwa Vidyapeetham', code: 'amrita', oldCreatedAt: '01-01-2015' },
    { legacyId: 2, name: 'VMKV Engineering College',  code: 'vmkv',   oldCreatedAt: '2/3/2015' },
    { legacyId: 3, name: 'IIT Bombay',                 code: 'iitb',   oldCreatedAt: '01-01-2015' },
    { legacyId: 4, name: 'NIT Warangal',               code: 'nitw',   oldCreatedAt: '01-01-2015' },
    { legacyId: 5, name: 'MET Nashik',                 code: 'met',    oldCreatedAt: '01-05-2015' },
    { legacyId: 6, name: 'IIIT Hyderabad',             code: 'iiith',  oldCreatedAt: '01-01-2015' },
  ];
  
  let primaryInstitution = null;
  
  for (const item of defaultInstitutions) {
    let inst = await prisma.institution.findFirst({
      where: {
        OR: [
          { legacyId: item.legacyId },
          { name: item.name }
        ]
      }
    });
    if (!inst) {
      inst = await prisma.institution.create({
        data: {
          name: item.name,
          code: item.code,
          legacyId: item.legacyId,
          oldCreatedAt: item.oldCreatedAt,
          createdById: admin.id
        }
      });
      console.log(`✅ Institution created: ${item.name} (${item.code})`);
    } else {
      inst = await prisma.institution.update({
        where: { id: inst.id },
        data: {
          name: item.name,
          code: item.code,
          legacyId: item.legacyId,
          oldCreatedAt: item.oldCreatedAt
        }
      });
    }
    if (item.name === 'Amrita Vishwa Vidyapeetham') {
      primaryInstitution = inst;
    }
  }

  // Create default nodal admin (Nodal Centre role)
  const nodalEmail = 'nodal@amrita.edu';
  let nodalAdmin = await prisma.user.findUnique({ where: { email: nodalEmail } });
  if (!nodalAdmin && primaryInstitution) {
    const hashed = await bcrypt.hash('VLNodal@2024', 12);
    nodalAdmin = await prisma.user.create({
      data: {
        name: 'Amrita Nodal Admin',
        email: nodalEmail,
        password: hashed,
        role: 'nodal_centre',
        nodalCentreId: primaryInstitution.id, // Linking to Institution
        createdById: admin.id,
      },
    });
    console.log('✅ Nodal Admin user created!');
  }

  // Create default teacher if not exists
  const teacherEmail = 'teacher@virtuallabs.in';
  let teacherExists = await prisma.user.findUnique({ where: { email: teacherEmail } });
  if (!teacherExists && primaryInstitution) {
    const hashed = await bcrypt.hash('VLTeacher@2024', 12);
    teacherExists = await prisma.user.create({
      data: {
        name: 'Jane Teacher',
        email: teacherEmail,
        password: hashed,
        role: 'teacher',
        nodalCentreId: primaryInstitution.id, // Linking to Institution
      },
    });
    console.log('✅ Teacher user created!');
  }

  // Create default student if not exists
  const studentEmail = 'student@virtuallabs.in';
  let studentExists = await prisma.user.findUnique({ where: { email: studentEmail } });
  if (!studentExists && primaryInstitution) {
    const hashed = await bcrypt.hash('VLStudent@2024', 12);
    studentExists = await prisma.user.create({
      data: {
        name: 'John Student',
        email: studentEmail,
        password: hashed,
        role: 'student',
        nodalCentreId: primaryInstitution.id, // Linking to Institution
      },
    });
    console.log('✅ Student user created!');
  }

  // Ensure extra students (alice, bob, charlie) if they exist are linked to the primary institution
  const extraStudentEmails = ['alice@virtuallabs.in', 'bob@virtuallabs.in', 'charlie@virtuallabs.in'];
  for (const email of extraStudentEmails) {
    const s = await prisma.user.findUnique({ where: { email } });
    if (s && primaryInstitution) {
      await prisma.user.update({
        where: { id: s.id },
        data: {
          nodalCentreId: primaryInstitution.id
        }
      });
    }
  }




  // 3. Define Seed Data
  const subjectsData = [
    {
      id: 'e1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c',
      title: 'Computer Science',
      icon: '💻',
      description: 'Explore programming, algorithms, data structures, and computer networking.',
      gradient: 'from-blue-600 to-indigo-700',
      labs: [
        {
          id: 'f2b3c4d5-e6f7-4a8b-9c0d-1e2f3a4b5c6d',
          title: 'Quantum Computing Lab',
          icon: '⚛️',
          description: 'Hands-on simulations covering quantum state preparation, Shor\'s algorithm, VQE optimization, QSVM, and quantum machine learning.',
          experiments: [
            {
              id: 'df1f65c6-7e0c-4c2c-bfc7-5e6ab330c46d',
              title: 'Expectation Value Calculation in Quantum Systems',
              description: 'Calculate expectation values of observables for various parameterized quantum state vectors.',
              duration: '60 min',
              difficulty: 'Intermediate',
            },
            {
              id: '4a8d2e1b-9f3c-4b5a-8e7d-6c5b4a3f2e1d',
              title: 'Factorization Using Shor\'s Algorithm',
              description: 'Simulate Shor\'s period-finding quantum circuits to factor prime products.',
              duration: '90 min',
              difficulty: 'Advanced',
            },
            {
              id: '7c9e1f2a-3d4b-4e6f-9a8b-1c2d3e4f5a6b',
              title: 'Variational Quantum Eigensolver (VQE) Optimization',
              description: 'Solve for the ground state energy of molecular Hamiltonians using parameterized ansatz circuits.',
              duration: '75 min',
              difficulty: 'Advanced',
            },
            {
              id: '8b1d2e3f-4a5c-4b6d-7e8f-9a0b1c2d3e4f',
              title: 'Quantum Measurement and Result Interpretation',
              description: 'Observe quantum measurement collapse, state tomography, and evaluate probability distributions.',
              duration: '45 min',
              difficulty: 'Beginner',
            },
            {
              id: '3f4e5d6c-7b8a-4901-8234-56789abcdef0',
              title: 'Quantum Linear Algebra – Matrix and Vector Operations',
              description: 'Explore quantum algorithms for systems of linear equations and state vector operations.',
              duration: '60 min',
              difficulty: 'Intermediate',
            },
            {
              id: '6d5e4f3a-2b1c-4098-9876-543210fedcba',
              title: 'Applied Linear Algebra – Quantum Gates in Action',
              description: 'Apply Hadamard, Pauli, CNOT, and phase gates in quantum circuits to observe state rotations.',
              duration: '60 min',
              difficulty: 'Intermediate',
            },
            {
              id: '9e8d7c6b-5a4f-4321-8765-43210fedcba9',
              title: 'Quantum Kernel Alignment in Machine Learning',
              description: 'Optimize quantum kernel parameters to increase data separability in high-dimensional feature spaces.',
              duration: '90 min',
              difficulty: 'Advanced',
            },
            {
              id: '2a1b3c4d-5e6f-4789-9012-3456789abcde',
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
      id: '3834263f-6848-4015-bf6f-1a7c6ebb0b8f',
      title: 'Physical Sciences',
      icon: '📚',
      description: 'Explore concepts in physics and chemistry.',
      gradient: 'from-rose-500 to-red-600',
      labs: [
        {
          id: 'f0513ca4-6622-460a-a465-bf192ba426da',
          title: 'Electricity & Magnetism Virtual Lab',
          icon: '🔬',
          description: 'Explore fundamental principles of electricity and magnetism.',
          experiments: [
            {
              id: '7c2cc105-09b2-4494-a8f3-d29926545ca9',
              title: 'Tangent Galvanometer',
              description: 'Experiment on Tangent Galvanometer.',
              duration: '60 min',
              difficulty: 'Beginner',
            },
            {
              id: '18c16f17-a849-4a6c-bc5a-9cb98410ab03',
              title: 'Magnetic Field Along The Axis of A Circular Coil Carrying Current',
              description: 'Analyze magnetic field along the axis of a circular coil.',
              duration: '60 min',
              difficulty: 'Beginner',
            },
            {
              id: 'b0345919-ec61-499a-8440-3be1216fad39',
              title: 'Deflection Magnetometer',
              description: 'Experiment on Deflection Magnetometer.',
              duration: '60 min',
              difficulty: 'Beginner',
            },
            {
              id: 'd952599c-fbe3-4246-9ca8-68b201f47f65',
              title: 'Van De Graaff Generator',
              description: 'Experiment on Van De Graaff Generator.',
              duration: '60 min',
              difficulty: 'Beginner',
            },
            {
              id: '0adf85be-fe6b-4148-8c2f-cebaef432314',
              title: 'Barkhausen Effect',
              description: 'Observe the Barkhausen effect.',
              duration: '60 min',
              difficulty: 'Beginner',
            },
            {
              id: '07df6e46-6e79-4cdd-b47f-6f43536cabc5',
              title: 'Temperature Coefficient of Resistance',
              description: 'Determine the temperature coefficient of resistance.',
              duration: '60 min',
              difficulty: 'Beginner',
            },
            {
              id: '37c08ccb-4412-440e-8bcf-9a8a94bb5a92',
              title: 'Anderson\'s Bridge',
              description: 'Experiment on Anderson\'s Bridge.',
              duration: '60 min',
              difficulty: 'Beginner',
            },
            {
              id: '374b9cdb-86cf-4aab-bbad-ea65c87ec16e',
              title: 'Quincke\'s Method',
              description: 'Experiment using Quincke\'s Method.',
              duration: '60 min',
              difficulty: 'Beginner',
            }
          ]
        }
      ]
    }
  ];

  // 4. Insert Seed Data
  for (const sData of subjectsData) {
    const subject = await prisma.subject.upsert({
      where: { id: sData.id },
      update: {
        title: sData.title,
        icon: sData.icon,
        description: sData.description,
        gradient: sData.gradient,
      },
      create: {
        id: sData.id,
        title: sData.title,
        icon: sData.icon,
        description: sData.description,
        gradient: sData.gradient,
        createdById: admin.id,
      }
    });
    console.log(`📚 Upserted Subject: ${subject.title}`);

    for (const lData of sData.labs) {
      const lab = await prisma.lab.upsert({
        where: { id: lData.id },
        update: {
          title: lData.title,
          icon: lData.icon,
          description: lData.description,
        },
        create: {
          id: lData.id,
          title: lData.title,
          icon: lData.icon,
          description: lData.description,
          subjectId: subject.id,
          createdById: admin.id,
        }
      });
      console.log(`   🔬 Upserted Lab: ${lab.title}`);

      for (const eData of lData.experiments) {
        const expId = eData.id || undefined;
        let contentPath = null;
        let simulationPath = null;

        if (expId) {
          const fs = require('fs');
          const path = require('path');
          let uploadsDir = path.join(__dirname, '../uploads/experiments', expId);
          if (fs.existsSync(path.join(uploadsDir, 'content'))) {
            contentPath = `experiments/${expId}/content`;
          }
          if (fs.existsSync(path.join(uploadsDir, 'simulation'))) {
            simulationPath = `experiments/${expId}/simulation`;
          }
          if (!contentPath && !simulationPath) {
            uploadsDir = path.join(__dirname, '../uploads', expId);
            if (fs.existsSync(path.join(uploadsDir, 'content'))) {
              contentPath = `${expId}/content`;
            }
            if (fs.existsSync(path.join(uploadsDir, 'simulation'))) {
              simulationPath = `${expId}/simulation`;
            }
          }
        }

        const exp = await prisma.experiment.upsert({
          where: { id: eData.id || '00000000-0000-0000-0000-000000000000' },
          update: {
            title: eData.title,
            description: eData.description,
            duration: eData.duration,
            difficulty: eData.difficulty,
            contentPath,
            simulationPath: simulationPath || (eData.title === 'Stack Operations' ? null : null),
          },
          create: {
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
        console.log(`      ⚗️ Upserted Experiment: ${exp.title} (${exp.id})`);
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
            nodalCentreId: student?.nodalCentreId || null, // Group them to make report work
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

  // Auto-link any uploaded content/simulations on disk
  try {
    const linkUploads = require('../uploads/link_uploads.js');
    await linkUploads();
  } catch (e) {
    console.log('ℹ️ Auto-link uploads skipped or encountered non-critical notice:', e.message);
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
