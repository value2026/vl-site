const { PrismaClient } = require('../src/generated/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Create or Find default users and institutions
  const adminEmail = 'admin@virtuallabs.in';
  let admin = await prisma.user.findFirst({ where: { role: 'admin' } });

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
    console.log('ℹ️ Admin user already exists (found by role).');
  }


  // Create Default Institutions with Legacy Metadata
  const defaultInstitutions = [
    { legacyId: 1, name: 'Amrita Vishwa Vidyapeetham', code: 'amrita', oldCreatedAt: '01-01-2015' },
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
              contentPath: 'labs/f0513ca4-6622-460a-a465-bf192ba426da/7c2cc105-09b2-4494-a8f3-d29926545ca9/content',
              simulationPath: 'labs/f0513ca4-6622-460a-a465-bf192ba426da/7c2cc105-09b2-4494-a8f3-d29926545ca9/sim-root/simulation'
            },
            {
              id: '18c16f17-a849-4a6c-bc5a-9cb98410ab03',
              title: 'Magnetic Field Along The Axis of A Circular Coil Carrying Current',
              description: 'Analyze magnetic field along the axis of a circular coil.',
              duration: '60 min',
              difficulty: 'Beginner',
              contentPath: 'labs/f0513ca4-6622-460a-a465-bf192ba426da/18c16f17-a849-4a6c-bc5a-9cb98410ab03/content',
              simulationPath: 'labs/f0513ca4-6622-460a-a465-bf192ba426da/18c16f17-a849-4a6c-bc5a-9cb98410ab03/sim-root/simulation'
            },
            {
              id: 'b0345919-ec61-499a-8440-3be1216fad39',
              title: 'Deflection Magnetometer',
              description: 'Experiment on Deflection Magnetometer.',
              duration: '60 min',
              difficulty: 'Beginner',
              contentPath: 'labs/f0513ca4-6622-460a-a465-bf192ba426da/b0345919-ec61-499a-8440-3be1216fad39/content',
              simulationPath: 'labs/f0513ca4-6622-460a-a465-bf192ba426da/b0345919-ec61-499a-8440-3be1216fad39/sim-root/simulation'
            },
            {
              id: 'd952599c-fbe3-4246-9ca8-68b201f47f65',
              title: 'Van De Graaff Generator',
              description: 'Experiment on Van De Graaff Generator.',
              duration: '60 min',
              difficulty: 'Beginner',
              contentPath: 'labs/f0513ca4-6622-460a-a465-bf192ba426da/d952599c-fbe3-4246-9ca8-68b201f47f65/content',
              simulationPath: 'labs/f0513ca4-6622-460a-a465-bf192ba426da/d952599c-fbe3-4246-9ca8-68b201f47f65/sim-root/simulation'
            },
            {
              id: '0adf85be-fe6b-4148-8c2f-cebaef432314',
              title: 'Barkhausen Effect',
              description: 'Observe the Barkhausen effect.',
              duration: '60 min',
              difficulty: 'Beginner',
              contentPath: 'labs/f0513ca4-6622-460a-a465-bf192ba426da/0adf85be-fe6b-4148-8c2f-cebaef432314/content',
              simulationPath: 'labs/f0513ca4-6622-460a-a465-bf192ba426da/0adf85be-fe6b-4148-8c2f-cebaef432314/sim-root/simulation'
            },
            {
              id: '07df6e46-6e79-4cdd-b47f-6f43536cabc5',
              title: 'Temperature Coefficient of Resistance',
              description: 'Determine the temperature coefficient of resistance.',
              duration: '60 min',
              difficulty: 'Beginner',
              contentPath: 'labs/f0513ca4-6622-460a-a465-bf192ba426da/07df6e46-6e79-4cdd-b47f-6f43536cabc5/content',
              simulationPath: 'labs/f0513ca4-6622-460a-a465-bf192ba426da/07df6e46-6e79-4cdd-b47f-6f43536cabc5/sim-root/simulation'
            },
            {
              id: '37c08ccb-4412-440e-8bcf-9a8a94bb5a92',
              title: 'Anderson\'s Bridge',
              description: 'Experiment on Anderson\'s Bridge.',
              duration: '60 min',
              difficulty: 'Beginner',
              contentPath: 'labs/f0513ca4-6622-460a-a465-bf192ba426da/37c08ccb-4412-440e-8bcf-9a8a94bb5a92/content',
              simulationPath: 'labs/f0513ca4-6622-460a-a465-bf192ba426da/37c08ccb-4412-440e-8bcf-9a8a94bb5a92/sim-root/simulation'
            },
            {
              id: '374b9cdb-86cf-4aab-bbad-ea65c87ec16e',
              title: 'Quincke\'s Method',
              description: 'Experiment using Quincke\'s Method.',
              duration: '60 min',
              difficulty: 'Beginner',
              contentPath: 'labs/f0513ca4-6622-460a-a465-bf192ba426da/374b9cdb-86cf-4aab-bbad-ea65c87ec16e/content',
              simulationPath: 'labs/f0513ca4-6622-460a-a465-bf192ba426da/374b9cdb-86cf-4aab-bbad-ea65c87ec16e/sim-root/simulation'
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
        let contentPath = eData.contentPath || null;
        let simulationPath = eData.simulationPath || null;

        if (expId && !contentPath && !simulationPath) {
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
