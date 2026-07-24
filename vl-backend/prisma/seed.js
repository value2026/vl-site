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
    let inst = await prisma.institution.findUnique({ where: { name: item.name } });
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

  // 2. Clear existing subjects/labs/experiments ONLY if explicitly forced
  // WARNING: This deletes all lab content. Only run with SEED_FORCE=true when you
  // intentionally want to reset lab data (e.g. fresh install / dev environment).
  // In production, leave SEED_FORCE unset so existing lab data is preserved.
  if (process.env.SEED_FORCE === 'true') {
    await prisma.experiment.deleteMany({});
    await prisma.lab.deleteMany({});
    await prisma.subject.deleteMany({});
    console.log('🧹 [SEED_FORCE] Cleaned existing lab/experiment structures.');
  } else {
    console.log('ℹ️  Skipping lab data wipe (set SEED_FORCE=true to reset lab data).');
  }

  // 3. Define Seed Data
  const subjectsData = [
    {
      id: '11111111-1111-1111-1111-111111111111',
      title: 'Computer Science',
      icon: '💻',
      description: 'Explore programming, algorithms, data structures, and computer networking.',
      gradient: 'from-blue-600 to-indigo-700',
      labs: [
        {
          id: '55555555-5555-5555-5555-555555555555',
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
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      title: 'Chemistry',
      icon: '🧪',
      description: 'Interact with virtual retorts, acids, bases, and examine organic reactions.',
      gradient: 'from-emerald-600 to-green-700',
      labs: []
    },
    {
      id: '33333333-3333-3333-3333-333333333333',
      title: 'Physics',
      icon: '⚛️',
      description: 'Explore kinematic forces, optics, thermodynamics, and electromagnetism.',
      gradient: 'from-amber-500 to-orange-600',
      labs: []
    },
    {
      id: '44444444-4444-4444-4444-444444444444',
      title: 'Chemical Science',
      icon: '🧪',
      description: 'Explore chemical systems, molecular reactions, and physical chemistry principles.',
      gradient: 'from-teal-500 to-cyan-600',
      labs: [
        {
          id: '66666666-6666-6666-6666-666666666666',
          title: 'Physical Chemistry Virtual Lab',
          icon: '⚗️',
          description: 'Explore spectrophotometry, cryoscopy, ebullioscopy and EMF measurement.',
          experiments: [
            {
              title: 'Spectrophotometry',
              description: 'Measure the absorption of light by a chemical substance as a function of wavelength.',
              duration: '60 min',
              difficulty: 'Intermediate',
            },
            {
              title: 'Cryoscopy',
              description: 'Determine the depression of freezing point to calculate molecular mass.',
              duration: '60 min',
              difficulty: 'Intermediate',
            },
            {
              title: 'Ebullioscopy',
              description: 'Determine the elevation of boiling point of a solvent due to a solute.',
              duration: '60 min',
              difficulty: 'Intermediate',
            },
            {
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
          const uploadsDir = path.join(__dirname, '../uploads/experiments', expId);
          if (fs.existsSync(path.join(uploadsDir, 'content'))) {
            contentPath = `experiments/${expId}/content`;
          }
          if (fs.existsSync(path.join(uploadsDir, 'simulation'))) {
            simulationPath = `experiments/${expId}/simulation`;
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
