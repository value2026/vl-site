const { PrismaClient } = require('../src/generated/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

async function linkUploads() {
  console.log('🔗 Scanning uploads/ directory to auto-link content and simulations...');

  const labId = '55555555-5555-5555-5555-555555555555';
  const experiments = await prisma.experiment.findMany({ where: { labId } });

  console.log(`Found ${experiments.length} experiments in Quantum Computing Lab.`);

  const uploadsDir = __dirname;
  
  // Recursively scan all subdirectories inside uploads/
  function scanDir(dir, relativePath = '') {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    
    // Check if current directory has 'content' or 'simulation' or 'sim-root'
    const hasContent = items.some(i => i.isDirectory() && i.name === 'content');
    const hasSim = items.some(i => i.isDirectory() && (i.name === 'simulation' || i.name === 'sim-root'));

    if (hasContent || hasSim) {
      const folderName = path.basename(dir);
      
      // Find matching experiment
      const match = experiments.find(exp => {
        const titleSlug = slugify(exp.title);
        const folderSlug = slugify(folderName);
        return titleSlug.includes(folderSlug) || folderSlug.includes(titleSlug) || exp.id === folderName;
      });

      if (match) {
        const updateData = {};
        if (hasContent) {
          updateData.contentPath = `${relativePath}/content`;
        }
        if (hasSim) {
          const simFolderName = items.find(i => i.isDirectory() && (i.name === 'simulation' || i.name === 'sim-root')).name;
          updateData.simulationPath = `${relativePath}/${simFolderName}`;
        }

        console.log(`✅ Matched [${match.title}] to folder "${relativePath}" ->`, updateData);
        return { matchId: match.id, updateData };
      }
    }

    const updates = [];
    for (const item of items) {
      if (item.isDirectory() && item.name !== 'content' && item.name !== 'simulation' && item.name !== 'sim-root') {
        const subDirPath = path.join(dir, item.name);
        const subRelPath = relativePath ? `${relativePath}/${item.name}` : item.name;
        const res = scanDir(subDirPath, subRelPath);
        if (Array.isArray(res)) {
          updates.push(...res);
        } else if (res) {
          updates.push(res);
        }
      }
    }
    return updates;
  }

  const foundUpdates = scanDir(uploadsDir);

  for (const u of foundUpdates) {
    await prisma.experiment.update({
      where: { id: u.matchId },
      data: u.updateData
    });
  }

  console.log(`🎉 Auto-linking complete! Updated ${foundUpdates.length} experiments in database.`);
}

linkUploads()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
