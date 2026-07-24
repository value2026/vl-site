const { execSync } = require('child_process');
const { PrismaClient } = require('./src/generated/client');
const fs = require('fs');
const path = require('path');

async function fix() {
  console.log('Running db:seed...');
  execSync('npm run db:seed', { stdio: 'inherit' });

  const prisma = new PrismaClient();
  const spectro = await prisma.experiment.findFirst({ where: { title: 'Spectrophotometry' } });
  const cryo = await prisma.experiment.findFirst({ where: { title: 'Cryoscopy' } });

  const oldSpectroId = '83c0fc70-8367-4598-93ed-09cb565c06f4';
  const oldCryoId = 'fb645967-38e2-4244-8204-bda3b83e8587';

  if (spectro && fs.existsSync('uploads/experiments/' + oldSpectroId)) {
    console.log('Moving Spectrophotometry to ' + spectro.id);
    fs.renameSync('uploads/experiments/' + oldSpectroId, 'uploads/experiments/' + spectro.id);
    await prisma.experiment.update({
      where: { id: spectro.id },
      data: {
        contentPath: 'experiments/' + spectro.id + '/content',
        simulationPath: 'experiments/' + spectro.id + '/simulation'
      }
    });
  }

  if (cryo && fs.existsSync('uploads/experiments/' + oldCryoId)) {
    console.log('Moving Cryoscopy to ' + cryo.id);
    fs.renameSync('uploads/experiments/' + oldCryoId, 'uploads/experiments/' + cryo.id);
    await prisma.experiment.update({
      where: { id: cryo.id },
      data: {
        contentPath: 'experiments/' + cryo.id + '/content',
        simulationPath: 'experiments/' + cryo.id + '/simulation'
      }
    });
  }

  // Also I'll check all other orphaned folders that have content and try to map them by reading aim.md if possible.
  const dirs = fs.readdirSync('uploads/experiments');
  for (const dir of dirs) {
    const aimPath = path.join('uploads/experiments', dir, 'content', 'aim.md');
    if (fs.existsSync(aimPath) && dir !== spectro?.id && dir !== cryo?.id) {
      const aim = fs.readFileSync(aimPath, 'utf8');
      
      let titleToFind = null;
      if (aim.includes('Expectation Value Calculation')) titleToFind = 'Expectation Value Calculation in Quantum Systems';
      if (aim.includes('integer factorization')) titleToFind = 'Factorization Using Shor\'s Algorithm';
      if (aim.includes('quantum kernels can transform data')) titleToFind = 'Quantum Kernel Alignment in Machine Learning';
      if (aim.includes('quantum measurement postulates')) titleToFind = 'Quantum Measurement and Result Interpretation';
      if (aim.includes('job scheduling optimization')) titleToFind = 'Variational Quantum Eigensolver (VQE) Optimization';
      if (aim.includes('binary classification using QSVM')) titleToFind = 'Quantum Support Vector Machines (QSVM)';
      if (aim.includes('linear algebra concepts')) titleToFind = 'Applied Linear Algebra – Quantum Gates in Action';
      if (aim.includes('linear algebra operations')) titleToFind = 'Quantum Linear Algebra – Matrix and Vector Operations';
      
      if (titleToFind) {
        const exp = await prisma.experiment.findFirst({ where: { title: titleToFind } });
        if (exp && dir !== exp.id) {
          console.log(`Moving ${titleToFind} to ${exp.id}`);
          fs.renameSync('uploads/experiments/' + dir, 'uploads/experiments/' + exp.id);
          await prisma.experiment.update({
            where: { id: exp.id },
            data: {
              contentPath: 'experiments/' + exp.id + '/content',
              simulationPath: 'experiments/' + exp.id + '/simulation'
            }
          });
        }
      }
    }
  }

  console.log('Done mapping.');
  await prisma.$disconnect();
}

fix();
